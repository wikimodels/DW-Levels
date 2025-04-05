import {
  MongoClient,
  Database,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { VwapAlert } from "../models/vwap-alert.ts";
import { DColors } from "../shared/colors.ts";
import { AlertsCollection } from "../models/alerts-collections.ts";
import { sendErrorReport } from "../functions/tg/notifications/send-error-report.ts";

const env = await load();
const MONGO_DB = env.MONGO_DB;

if (!MONGO_DB) {
  throw new Error(
    "[DW-Levels] VwapAlertOperator --> MONGO_DB is not defined in the environment variables."
  );
}

export class VwapAlertOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly dbName = "vwap-alerts";

  private static alertsData: Map<string, VwapAlert[]> = new Map(
    Object.values(AlertsCollection).map((key) => [key, []])
  );

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
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:initialize()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
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
        const err = error instanceof Error ? error : new Error(String(error));
        try {
          await sendErrorReport(
            env["PROJECT_NAME"],
            "VwapAlertOperator:loadAllData()",
            err.toString()
          );
        } catch (reportError) {
          console.error("Failed to send error report:", reportError);
        }
        this.alertsData.set(collectionName, []); // Set empty array to avoid undefined issues
      }
    }
  }

  public static async refreshRepo(collectionName: string): Promise<void> {
    try {
      if (!this.db) {
        console.error(
          "%c[DW-Levels] VwapAlertOperator --> Database not initialized. Call initialize() first.",
          DColors.red
        );
        return;
      }

      // Validate collection exists in our storage
      if (!this.alertsData.has(collectionName)) {
        console.error(
          `%c[DW-Levels] VwapAlertOperator --> Invalid collection name: ${collectionName}`,
          DColors.red
        );
        return;
      }

      // Fetch fresh data from MongoDB
      const data = await this.getAlertsFromDB(collectionName);

      // Update in-memory storage
      this.alertsData.set(collectionName, []);
      this.alertsData.set(collectionName, data);

      console.log(
        `%c[DW-Levels] VwapAlertOperator --> Refreshed collection: ${collectionName}`,
        DColors.green
      );
    } catch (error) {
      console.error(
        `%c[DW-Levels] VwapAlertOperator --> Failed to refresh collection ${collectionName}:`,
        DColors.red,
        error
      );
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:refreashRepo()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      this.alertsData.set(collectionName, []); // Fallback to empty array
    }
  }

  private static getCollection(collectionName: string): Collection<VwapAlert> {
    try {
      if (!this.db) throw new Error("Database not initialized");
      return this.db.collection<VwapAlert>(collectionName);
    } catch (error) {
      console.error(`Error getting collection "${collectionName}":`, error);
      throw error;
    }
  }

  private static async getAlertsFromDB(
    collectionName: string
  ): Promise<VwapAlert[]> {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.find().toArray();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:getAlertsFromDB()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      console.error(
        `Error fetching alerts from collection "${collectionName}":`,
        error
      );
      throw error;
    }
  }

  // Read from in-memory storage
  public static getAlerts(collectionName: string): VwapAlert[] {
    try {
      return this.alertsData.get(collectionName) || [];
    } catch (error) {
      console.error(
        `Error retrieving alerts for collection "${collectionName}":`,
        error
      );
      return [];
    }
  }

  // Add VwapAlert to DB and update in-memory storage
  public static async addAlert(
    collectionName: string,
    vwapAlert: VwapAlert
  ): Promise<void> {
    try {
      const collection = this.getCollection(collectionName);
      await collection.insertOne(vwapAlert);
      await this.refreshRepo(collectionName);
    } catch (error) {
      console.error(
        `❌ Error adding alert to collection "${collectionName}":`,
        error
      );
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:addAlert()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      throw new Error(`Failed to add alert to collection "${collectionName}"`);
    }
  }

  public static async addManyAlerts(
    collectionName: string,
    alerts: VwapAlert[]
  ): Promise<void> {
    try {
      if (!alerts.length) return; // No alerts to add

      const collection = this.getCollection(collectionName);
      await collection.insertMany(alerts);
      await this.refreshRepo(collectionName);

      console.log(
        `✅ Successfully added ${alerts.length} alerts to ${collectionName}`
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:addManyAlerts()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      console.error(
        `❌ Error adding alerts to collection "${collectionName}":`,
        error
      );
      throw new Error(`Failed to add alerts to collection "${collectionName}"`);
    }
  }

  // Remove alerts from DB and update in-memory storage
  public static async removeAlerts(
    collectionName: string,
    alertIds: string[]
  ): Promise<void> {
    try {
      const collection = this.getCollection(collectionName);
      await collection.deleteMany({ id: { $in: alertIds } });
      await this.refreshRepo(collectionName);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:removeAlerts()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      console.error(
        `Error removing alerts from collection "${collectionName}":`,
        error
      );
      throw new Error(
        `Failed to remove alerts with given IDs from collection "${collectionName}"`
      );
    }
  }

  public static async removeAlert(
    collectionName: string,
    alertId: string
  ): Promise<void> {
    try {
      const collection = this.getCollection(collectionName);
      await collection.deleteOne({ id: alertId });
      await this.refreshRepo(collectionName);
    } catch (error) {
      console.error(
        `Error removing alert from collection "${collectionName}":`,
        error
      );
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:removeAlert()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      throw new Error(
        `Failed to remove alert with ID "${alertId}" from collection "${collectionName}"`
      );
    }
  }

  public static async getVwapAlertsBySymbol(
    symbol: string,
    collectionName: string
  ): Promise<VwapAlert[]> {
    try {
      const collection = this.getCollection(collectionName);
      return (await collection.find({ symbol }).toArray()) as VwapAlert[];
    } catch (error) {
      console.error(
        `Error fetching VWAP alerts for symbol "${symbol}" in collection "${collectionName}":`,
        error
      );
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:getVwapAlertsBySymbol()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      throw new Error(
        `Failed to fetch VWAP alerts for symbol "${symbol}" in collection "${collectionName}"`
      );
    }
  }

  // Update VwapAlert in DB and in-memory storage
  public static async updateAlert(
    collectionName: string,
    filter: Partial<VwapAlert>,
    updateData: Partial<VwapAlert>
  ): Promise<void> {
    try {
      const collection = this.getCollection(collectionName);
      await collection.updateOne(filter, { $set: updateData });
      await this.refreshRepo(collectionName);
    } catch (error) {
      console.error(
        `Error updating alert in collection "${collectionName}":`,
        error
      );
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:updateAlert()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      throw new Error(
        `Failed to update alert in collection "${collectionName}"`
      );
    }
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
      await this.refreshRepo(collectionName);
      return {
        deletedCount: result, // Accessing deletedCount from result
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "VwapAlertOperator:removeBySymbolAndOpenTime()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      console.error(
        `Error deleting VWAP data for symbol "${symbol}" in collection "${collectionName}":`,
        error
      );
      throw new Error(
        `Failed to delete VWAP data for symbol "${symbol}" in collection "${collectionName}"`
      );
    }
  }
}
