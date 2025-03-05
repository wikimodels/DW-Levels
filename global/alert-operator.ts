import {
  MongoClient,
  Database,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { Alert } from "../models/alert.ts";
import { DColors } from "../shared/colors.ts";

const env = await load();
const MONGO_DB = env.MONGO_DB;

if (!MONGO_DB) {
  throw new Error(
    "[DW-Levels] AlertOperator --> MONGO_DB is not defined in the environment variables."
  );
}

export class AlertOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly dbName = "alerts";

  // In-memory storage for collections
  private static alertsData: Map<string, Alert[]> = new Map([
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
        "%c[DW-Levels] AlertOperator --> initialized...",
        DColors.yellow
      );
    } catch (error) {
      console.error("❌ Failed to initialize AlertOperator:", error);
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

  private static getCollection(collectionName: string): Collection<Alert> {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.collection<Alert>(collectionName);
  }

  private static async getAlertsFromDB(
    collectionName: string
  ): Promise<Alert[]> {
    const collection = this.getCollection(collectionName);
    return await collection.find().toArray();
  }

  // Read from in-memory storage
  public static getAlerts(collectionName: string): Alert[] {
    return this.alertsData.get(collectionName) || [];
  }

  // Add alert to DB and update in-memory storage
  public static async addAlert(
    collectionName: string,
    alert: Alert
  ): Promise<void> {
    const collection = this.getCollection(collectionName);
    await collection.insertOne(alert);

    // Update cache
    this.alertsData.get(collectionName)?.push(alert);
  }

  public static async addManyAlerts(
    collectionName: string,
    alerts: Alert[]
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

      // Update cache
      const updatedAlerts =
        this.alertsData
          .get(collectionName)
          ?.filter((alert) => !alertIds.includes(alert.id)) || [];
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

  // Update alert in DB and in-memory storage
  public static async updateAlert(
    collectionName: string,
    filter: Partial<Alert>,
    updateData: Partial<Alert>
  ): Promise<void> {
    const collection = this.getCollection(collectionName);
    const res = await collection.updateOne(filter, { $set: updateData });
    console.log("MODIFIED RES: ", res);
    // Update cache
    const alerts = this.alertsData.get(collectionName) || [];
    this.alertsData.set(
      collectionName,
      alerts.map((alert) =>
        Object.keys(filter).every(
          (key) => alert[key as keyof Alert] === filter[key as keyof Alert]
        )
          ? { ...alert, ...updateData }
          : alert
      )
    );
  }
}
