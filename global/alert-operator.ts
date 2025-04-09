import {
  MongoClient,
  Database,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { Alert } from "../models/alert.ts";
import { DColors } from "../shared/colors.ts";
import { AlertsCollection } from "../models/alerts-collections.ts";
import { sendErrorReport } from "../functions/tg/notifications/send-error-report.ts";
import { AlertBase } from "../models/alert-base.ts";
import { Coin } from "../models/coin.ts";

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

  private static alertsData: Map<string, Alert[]> = new Map(
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
        "%c[DW-Levels] AlertOperator --> initialized...",
        DColors.cyan
      );
    } catch (error) {
      console.error("❌ Failed to initialize AlertOperator:", error);
      this.dbClient = null;
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "AlertOperator:initialize()",
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
            "AlertOperator:loadAllData()",
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
          "%c[DW-Levels] AlertOperator --> Database not initialized. Call initialize() first.",
          DColors.red
        );
        return;
      }

      // Validate collection exists in our storage
      if (!this.alertsData.has(collectionName)) {
        console.error(
          `%c[DW-Levels] AlertOperator --> Invalid collection name: ${collectionName}`,
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
        `%c[DW-Levels] AlertOperator --> Refreshed collection: ${collectionName}`,
        DColors.green
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "AlertOperator:refreashRepo()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      console.error(
        `%c[DW-Levels] AlertOperator --> Failed to refresh collection ${collectionName}:`,
        DColors.red,
        error
      );
      this.alertsData.set(collectionName, []); // Fallback to empty array
    }
  }

  private static getCollection(collectionName: string): Collection<Alert> {
    try {
      if (!this.db) throw new Error("Database not initialized");
      return this.db.collection<Alert>(collectionName);
    } catch (error) {
      console.error(`Error getting collection "${collectionName}":`, error);
      throw error;
    }
  }

  private static async getAlertsFromDB(
    collectionName: string
  ): Promise<Alert[]> {
    try {
      // Attempt to retrieve the collection and fetch alerts
      const collection = this.getCollection(collectionName);
      const alerts = await collection.find().toArray();
      return alerts;
    } catch (error) {
      console.error(
        `Error fetching alerts from collection "${collectionName}":`,
        error
      );
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "AlertOperator:getAlertsFromDB()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      throw error;
    }
  }

  // Read from in-memory storage
  public static getAlerts(collectionName: string): Alert[] {
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

  // Add alert to DB and update in-memory storage
  public static async addAlert(
    collectionName: string,
    alert: Alert
  ): Promise<void> {
    try {
      const collection = this.getCollection(collectionName);
      await collection.insertOne(alert);
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
          "AlertOperator:addAlert()",
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
    alerts: Alert[]
  ): Promise<void> {
    try {
      if (!alerts.length) return; // No alerts to add

      const collection = this.getCollection(collectionName);

      // Insert multiple alerts into the database
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
          "AlertOperator:addmanyAlerts()",
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
          "AlertOperator:removeAlerts()",
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
  // Update alert in DB and in-memory storage
  public static async updateAlert(
    collectionName: string,
    filter: Partial<Alert>,
    updateData: Partial<Alert>
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
          "AlertOperator:updateAlert()",
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

  public static async findDuplicateAlertNames(
    alertsBase: AlertBase[],
    collectionName: AlertsCollection
  ): Promise<string[]> {
    try {
      if (!this.db) {
        console.error(
          "%c[DW-Levels] AlertOperator --> Database not initialized. Call initialize() first.",
          DColors.red
        );
        return [];
      }

      // Extract alert names from the input array
      const alertNames = alertsBase.map((alert) => alert.alertName);

      // Get the 'working' collection
      const workingCollection = this.getCollection(collectionName);

      // Find alerts in the 'working' collection with matching names
      const matchingAlerts = await workingCollection
        .find({ alertName: { $in: alertNames } })
        .toArray();

      console.log(
        `%c[DW-Levels] AlertOperator --> Found ${matchingAlerts.length} matching alerts in 'working' collection.`,
        DColors.green
      );
      const matchingNames = matchingAlerts.map((alert) => alert.alertName);
      return matchingNames;
    } catch (error) {
      console.error(
        "❌ Error finding matching alerts in 'working' collection:",
        error
      );
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          env["PROJECT_NAME"],
          "AlertOperator:findMatchingAlertsInWorking()",
          err.toString()
        );
      } catch (reportError) {
        console.error("Failed to send error report:", reportError);
      }
      throw new Error("Failed to find matching alerts in 'working' collection");
    }
  }

  public static createAlerts(alertBases: AlertBase[], coins: Coin[]): Alert[] {
    try {
      // Validate inputs
      if (!Array.isArray(alertBases)) {
        throw new Error("Invalid input: 'alertBases' must be an array.");
      }
      if (!Array.isArray(coins)) {
        throw new Error("Invalid input: 'coins' must be an array.");
      }

      const readyAlerts: Alert[] = [];

      for (const base of alertBases) {
        try {
          // Find the coin matching the symbol
          const coin = coins.find((coin) => coin.symbol === base.symbol);

          if (coin) {
            // Create a new alert object if the coin is found
            const alert: Alert = {
              action: base.action,
              alertName: base.alertName,
              isActive: true,
              symbol: base.symbol,
              status: "",
              id: crypto.randomUUID(),
              tvScreensUrls: base.tvScreensUrls,
              price: base.price,
              creationTime: new Date().getTime(),
              imageUrl: coin.imageUrl,
              exchanges: coin.exchanges,
              category: coin.category,
              description: "Yet nothing to say",
            };

            // Add the alert to the readyAlerts array
            readyAlerts.push(alert);
          } else {
            console.log(`Coin with symbol ${base.symbol} not found.`);
          }
        } catch (error) {
          // Handle errors for individual alerts
          console.error(
            `Error processing alert with symbol ${base.symbol}:`,
            error
          );
        }
      }

      return readyAlerts;
    } catch (error) {
      // Handle top-level errors
      console.error("Error in createAlerts method:", error);
      throw new Error(
        "[DW-Levels]:createAlerts(): Failed to create alerts due to an unexpected error."
      );
    }
  }

  public static findCorruptedSymbols(
    alerts: AlertBase[],
    coins: Coin[]
  ): string[] {
    try {
      // Extract all coin symbols from the coins array
      const coinSymbols = new Set(coins.map((coin) => coin.symbol));

      // Find symbols in alerts that are not present in the coins array
      const corrupted = alerts
        .filter((alert) => !coinSymbols.has(alert.symbol)) // Filter alerts with missing symbols
        .map((alert) => alert.symbol); // Extract the symbol from the filtered alerts

      return corrupted;
    } catch (error) {
      // Handle unexpected errors
      console.error("Error finding corrupted symbols:", error);
      throw new Error(
        "[DW-Levels]:findCorruptedSymbols(): Failed to find corrupted symbols due to an unexpected error."
      );
    }
  }
}
