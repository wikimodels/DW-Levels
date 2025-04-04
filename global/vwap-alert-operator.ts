import {
  MongoClient,
  Database,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { VwapAlert } from "../models/vwap-alert.ts";
import { DColors } from "../shared/colors.ts";
import { AlertsCollection } from "../models/alerts-collections.ts";

const env = await load();
const MONGO_DB = env.MONGO_DB;

export class VwapAlertOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly dbName = "vwap-alerts";

  // In-memory storage for collections
  private static alertsData: Map<string, VwapAlert[]> = new Map([
    ["working", []],
    ["triggered", []],
    ["archived", []],
  ]);

  public static async initialize() {
    if (this.dbClient) return; // Prevent re-initialization

    try {
      this.dbClient = new MongoClient();
      await this.dbClient.connect(MONGO_DB);
      this.db = this.dbClient.database(this.dbName);
      await this.loadAllData();
      console.log(
        "%c[DW-Levels] VwapAlertOperator --> initialized...",
        DColors.yellow
      );
    } catch (error) {
      console.error("❌ Failed to initialize VwapAlertOperator:", error);
      this.dbClient = null; // Reset to allow retrying initialization
      throw error;
    }
  }

  private static async loadAllData() {
    for (const collectionName of this.alertsData.keys()) {
      try {
        const data = await this.getAlertsFromDB(collectionName);
        this.alertsData.set(collectionName, data);
      } catch (error) {
        console.error(`❌ Failed to load collection: ${collectionName}`, error);
        this.alertsData.set(collectionName, []); // Set empty array to avoid undefined issues
      }
    }
  }

  public static async updateVwapRepo() {
    for (const collectionName of this.alertsData.keys()) {
      try {
        const data = await this.getAlertsFromDB(collectionName);
        this.alertsData.set(collectionName, data);
      } catch (error) {
        console.error(`❌ Failed to load collection: ${collectionName}`, error);
        this.alertsData.set(collectionName, []); // Set empty array to avoid undefined issues
      }
    }
  }

  private static getCollection(collectionName: string): Collection<VwapAlert> {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.collection<VwapAlert>(collectionName);
  }

  private static async getAlertsFromDB(
    collectionName: string
  ): Promise<VwapAlert[]> {
    const collection = this.getCollection(collectionName);
    return await collection.find().toArray();
  }

  // Read from in-memory storage
  public static getAlerts(collectionName: string): VwapAlert[] {
    return this.alertsData.get(collectionName) || [];
  }

  // Add VwapAlert to DB and update in-memory storage
  public static async addAlert(
    collectionName: string,
    VwapAlert: VwapAlert
  ): Promise<void> {
    const collection = this.getCollection(collectionName);
    await collection.insertOne(VwapAlert);

    // Update cache
    this.alertsData.get(collectionName)?.push(VwapAlert);
  }

  public static async addManyAlerts(
    collectionName: string,
    alerts: VwapAlert[]
  ): Promise<void> {
    if (!alerts.length) return; // No alerts to add

    const collection = this.getCollection(collectionName);

    try {
      // Insert multiple alerts into the database
      await collection.insertMany(alerts);

      // 🔹 Fetch fresh alerts from the database to ensure accurate data
      const updatedAlerts = await this.getAlertsFromDB(collectionName);

      // 🔹 Update in-memory storage with fresh data
      this.alertsData.set(collectionName, updatedAlerts);

      console.log(
        `✅ Successfully added ${alerts.length} alerts to ${collectionName}`
      );
    } catch (error) {
      console.error(
        `❌ Error adding alerts to collection ${collectionName}:`,
        error
      );
      throw new Error(`Failed to add alerts to collection ${collectionName}`);
    }
  }

  // Remove alerts from DB and update in-memory storage
  public static async removeAlerts(
    collectionName: string,
    alertIds: string[]
  ): Promise<void> {
    const collection = this.getCollection(collectionName);

    try {
      await collection.deleteMany({ id: { $in: alertIds } });

      this.updateVwapRepo();
    } catch (error) {
      console.error(
        `Error removing alerts from collection ${collectionName}:`,
        error
      );
      throw new Error(
        `Failed to remove alerts with given IDs from collection ${collectionName}`
      );
    }
  }

  public static async removeAlert(
    collectionName: string,
    alertId: string
  ): Promise<void> {
    const collection = this.getCollection(collectionName);

    try {
      await collection.deleteOne({ id: alertId });

      // Update cache
      const updatedAlerts =
        this.alertsData
          .get(collectionName)
          ?.filter((vwapAlert) => vwapAlert.id != alertId) || [];
      this.alertsData.set(collectionName, updatedAlerts);
    } catch (error) {
      console.error(
        `Error removing alerts from collection ${collectionName}:`,
        error
      );
      throw new Error(
        `Failed to remove alerts with given IDs from collection ${collectionName}`
      );
    }
  }

  public static async getVwapAlertsBySymbol(
    symbol: string,
    collectionName: string
  ): Promise<VwapAlert[]> {
    const collection = this.getCollection(collectionName);
    return (await collection.find({ symbol }).toArray()) as VwapAlert[];
  }

  // Update VwapAlert in DB and in-memory storage
  public static async updateAlert(
    collectionName: string,
    filter: Partial<VwapAlert>,
    updateData: Partial<VwapAlert>
  ): Promise<void> {
    const collection = this.getCollection(collectionName);
    const res = await collection.updateOne(filter, { $set: updateData });
    console.log("MODIFIED RES: ", res);
    // Update cache
    const alerts = this.alertsData.get(collectionName) || [];
    this.alertsData.set(
      collectionName,
      alerts.map((VwapAlert) =>
        Object.keys(filter).every(
          (key) =>
            VwapAlert[key as keyof VwapAlert] === filter[key as keyof VwapAlert]
        )
          ? { ...VwapAlert, ...updateData }
          : VwapAlert
      )
    );
  }

  public static async removeBySymbolAndOpenTime(
    symbol: string,
    collectionName: AlertsCollection,
    openTime?: number
  ) {
    try {
      // Filter condition based on whether anchorTime is provided
      const filter = openTime
        ? { symbol, anchorTime: Number(openTime) }
        : { symbol };

      // Perform the delete operation
      const result = await this.getCollection(collectionName).deleteMany(
        filter
      );

      // Check if the operation was successful
      await VwapAlertOperator.updateVwapRepo();
      return {
        deletedCount: result, // Accessing deletedCount from result
      };
    } catch (error) {
      // Catch any errors that occur during the delete operation
      console.error("Error deleting VWAP data:", error);
      throw new Error(`Failed to delete VWAP data: ${error}`);
    }
  }
}
