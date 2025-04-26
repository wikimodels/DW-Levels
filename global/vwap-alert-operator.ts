// deno-lint-ignore-file no-explicit-any
import {
  MongoClient,
  Database,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { VwapAlert } from "../models/vwap-alert.ts";
import { AlertsCollection } from "../models/alerts-collections.ts";
import { sendErrorReport } from "../functions/tg/notifications/send-error-report.ts";
import { logger } from "./logger.ts";
import { DColors } from "../shared/colors.ts";

export class VwapAlertOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly dbName = "vwap-alerts";
  private static alertsData: Map<string, VwapAlert[]> = new Map(
    Object.values(AlertsCollection).map((key) => [key, []])
  );

  /**
   * Initialize the VwapAlertOperator with the provided configuration.
   * @param config - The application configuration containing MongoDB connection details.
   */
  public static async initialize(config: {
    mongoDb: string;
    projectName: string;
  }): Promise<void> {
    if (this.dbClient) return; // Prevent re-initialization

    try {
      // Validate MongoDB connection string
      if (!config.mongoDb) {
        throw new Error(
          "VwapAlertOperator --> MONGO_DB is not defined in the environment variables."
        );
      }

      // Initialize MongoDB client
      this.dbClient = new MongoClient();
      await this.dbClient.connect(config.mongoDb);
      this.db = this.dbClient.database(this.dbName);

      // Load all data into memory
      await this.loadAllData(config.projectName);

      logger.success("VwapAlertOperator --> initialized...", DColors.magenta);
    } catch (error) {
      logger.error("❌ Failed to initialize VwapAlertOperator:", error);
      this.dbClient = null; // Reset to allow retrying initialization

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          config.projectName,
          "VwapAlertOperator:initialize()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      throw error;
    }
  }

  /**
   * Load all data from the database into in-memory storage.
   * @param projectName - The name of the project for error reporting.
   */
  private static async loadAllData(projectName: string): Promise<void> {
    for (const collectionName of this.alertsData.keys()) {
      try {
        const data = await this.getAlertsFromDB(collectionName);
        this.alertsData.set(collectionName, data);
      } catch (error) {
        logger.error(`❌ Failed to load collection: ${collectionName}`, error);

        const err = error instanceof Error ? error : new Error(String(error));
        try {
          await sendErrorReport(
            projectName,
            "VwapAlertOperator:loadAllData()",
            err.toString()
          );
        } catch (reportError) {
          logger.error("Failed to send error report:", reportError);
        }
        this.alertsData.set(collectionName, []); // Set empty array to avoid undefined issues
      }
    }
  }

  /**
   * Refresh the in-memory repository for a specific collection.
   * @param collectionName - The name of the collection to refresh.
   */
  public static async refreshRepo(collectionName: string): Promise<void> {
    try {
      if (!this.db) {
        logger.error(
          "VwapAlertOperator --> Database not initialized. Call initialize() first.",
          DColors.red
        );
        return;
      }

      // Validate collection exists in our storage
      if (!this.alertsData.has(collectionName)) {
        logger.error(
          `VwapAlertOperator --> Invalid collection name: ${collectionName}`
        );
        return;
      }

      // Fetch fresh data from MongoDB
      const data = await this.getAlertsFromDB(collectionName);

      // Update in-memory storage
      this.alertsData.set(collectionName, []);
      this.alertsData.set(collectionName, data);

      logger.success(
        `VwapAlertOperator --> Refreshed collection: ${collectionName}`,
        DColors.green
      );
    } catch (error) {
      logger.error(
        `VwapAlertOperator --> Failed to refresh collection ${collectionName}:`,
        error
      );

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "VwapAlertOperator",
          "refreshRepo()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      this.alertsData.set(collectionName, []); // Fallback to empty array
    }
  }

  /**
   * Get a MongoDB collection by name.
   * @param collectionName - The name of the collection.
   * @returns The MongoDB collection.
   */
  private static getCollection(collectionName: string): Collection<VwapAlert> {
    try {
      if (!this.db) throw new Error("Database not initialized");
      return this.db.collection<VwapAlert>(collectionName);
    } catch (error) {
      logger.error(`Error getting collection "${collectionName}":`, error);
      throw error;
    }
  }

  /**
   * Fetch alerts from the database for a specific collection.
   * @param collectionName - The name of the collection.
   * @returns A list of alerts from the database.
   */
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
          "VwapAlertOperator",
          "getAlertsFromDB()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      logger.error(
        `Error fetching alerts from collection "${collectionName}":`,
        error
      );
      throw error;
    }
  }

  /**
   * Read alerts from in-memory storage.
   * @param collectionName - The name of the collection.
   * @returns A list of alerts stored in memory.
   */
  public static getAlerts(collectionName: string): VwapAlert[] {
    try {
      return this.alertsData.get(collectionName) || [];
    } catch (error) {
      logger.error(
        `Error retrieving alerts for collection "${collectionName}":`,
        error
      );
      return [];
    }
  }

  /**
   * Add a single alert to the database and update in-memory storage.
   * @param collectionName - The name of the collection.
   * @param vwapAlert - The alert to add.
   */
  public static async addAlert(
    collectionName: string,
    vwapAlert: VwapAlert
  ): Promise<void> {
    try {
      const collection = this.getCollection(collectionName);
      await collection.insertOne(vwapAlert);
      await this.refreshRepo(collectionName);
    } catch (error) {
      logger.error(
        `❌ Error adding alert to collection "${collectionName}":`,
        error
      );

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "VwapAlertOperator",
          "addAlert()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      throw new Error(`Failed to add alert to collection "${collectionName}"`);
    }
  }

  /**
   * Add multiple alerts to the database and update in-memory storage.
   * @param collectionName - The name of the collection.
   * @param alerts - The list of alerts to add.
   */
  public static async addManyAlerts(
    collectionName: string,
    alerts: VwapAlert[]
  ): Promise<void> {
    try {
      if (!alerts.length) return; // No alerts to add
      const collection = this.getCollection(collectionName);
      await collection.insertMany(alerts);
      await this.refreshRepo(collectionName);

      logger.success(
        `✅ Successfully added ${alerts.length} alerts to ${collectionName}`,
        DColors.green
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "VwapAlertOperator",
          "addManyAlerts()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      logger.error(
        `❌ Error adding alerts to collection "${collectionName}":`,
        error
      );
      throw new Error(`Failed to add alerts to collection "${collectionName}"`);
    }
  }

  /**
   * Remove alerts from the database and update in-memory storage.
   * @param collectionName - The name of the collection.
   * @param alertIds - The IDs of the alerts to remove.
   */
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
          "VwapAlertOperator",
          "removeAlerts()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      logger.error(
        `Error removing alerts from collection "${collectionName}":`,
        error
      );
      throw new Error(
        `Failed to remove alerts with given IDs from collection "${collectionName}"`
      );
    }
  }

  /**
   * Remove a single alert from the database and update in-memory storage.
   * @param collectionName - The name of the collection.
   * @param alertId - The ID of the alert to remove.
   */
  public static async removeAlert(
    collectionName: string,
    alertId: string
  ): Promise<void> {
    try {
      const collection = this.getCollection(collectionName);
      await collection.deleteOne({ id: alertId });
      await this.refreshRepo(collectionName);
    } catch (error) {
      logger.error(
        `Error removing alert from collection "${collectionName}":`,
        error
      );

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "VwapAlertOperator",
          "removeAlert()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      throw new Error(
        `Failed to remove alert with ID "${alertId}" from collection "${collectionName}"`
      );
    }
  }

  /**
   * Fetch VWAP alerts by symbol from the database.
   * @param symbol - The symbol to filter by.
   * @param collectionName - The name of the collection.
   * @returns A list of alerts matching the symbol.
   */
  public static async getVwapAlertsBySymbol(
    symbol: string,
    collectionName: string
  ): Promise<VwapAlert[]> {
    try {
      const collection = this.getCollection(collectionName);
      return (await collection.find({ symbol }).toArray()) as VwapAlert[];
    } catch (error) {
      logger.error(
        `Error fetching VWAP alerts for symbol "${symbol}" in collection "${collectionName}":`,
        error
      );

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "VwapAlertOperator",
          "getVwapAlertsBySymbol()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      throw new Error(
        `Failed to fetch VWAP alerts for symbol "${symbol}" in collection "${collectionName}"`
      );
    }
  }

  /**
   * Update an alert in the database and in-memory storage.
   * @param collectionName - The name of the collection.
   * @param filter - The filter to identify the alert to update.
   * @param updateData - The data to update.
   */
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
      logger.error(
        `Error updating alert in collection "${collectionName}":`,
        error
      );

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "VwapAlertOperator",
          "updateAlert()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      throw new Error(
        `Failed to update alert in collection "${collectionName}"`
      );
    }
  }

  /**
   * Remove alerts by symbol and optional open time.
   * @param symbol - The symbol to filter by.
   * @param collectionName - The name of the collection.
   * @param openTime - (Optional) The open time to filter by.
   */
  public static async removeBySymbolAndOpenTime(
    symbol: string,
    collectionName: AlertsCollection,
    openTime?: number
  ) {
    try {
      // Filter condition based on whether openTime is provided
      const filter = openTime
        ? { symbol, anchorTime: Number(openTime) }
        : { symbol };

      // Perform the delete operation
      const result = await this.getCollection(collectionName).deleteMany(
        filter
      );

      // Refresh in-memory storage
      await this.refreshRepo(collectionName);

      return {
        deletedCount: result || 0,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "VwapAlertOperator",
          "removeBySymbolAndOpenTime()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      logger.error(
        `Error deleting VWAP data for symbol "${symbol}" in collection "${collectionName}":`,
        error
      );
      throw new Error(
        `Failed to delete VWAP data for symbol "${symbol}" in collection "${collectionName}"`
      );
    }
  }

  public static async cleanTriggeredAlerts() {
    const collectionName = AlertsCollection.TriggeredAlerts;
    try {
      // Step 1: Aggregate to find the latest alert for each alertName
      const latestAlerts = await this.getCollection(collectionName).aggregate([
        {
          $sort: { anchorTime: 1, activationTime: -1 }, // Sort by alertName and activationTime (descending)
        },
        {
          $group: {
            _id: "$anchorTime", // Group by alertName
            latestAlertId: { $first: "$_id" }, // Keep the _id of the first document (latest activationTime)
          },
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            latestAlertId: 1, // Include only the latestAlertId
          },
        },
      ]);

      // Step 2: Extract the latestAlertId values into an array

      const latestAlertIds = await latestAlerts.map(
        (doc: any) => doc.latestAlertId
      );

      // Step 3: Delete all alerts except those in the latestAlertIds array
      const deleteResult = await this.getCollection(collectionName).deleteMany({
        _id: { $nin: latestAlertIds }, // Delete alerts not in the latestAlertIds array
      });

      console.log(`Deleted ${deleteResult} alerts.`);
      await this.refreshRepo(AlertsCollection.TriggeredAlerts);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "VwapAlertOperator",
          "cleanTriggeredAlerts()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      logger.error(
        `Error cleaning Triggered Alerts in collection "${collectionName}":`,
        error
      );
      throw new Error(
        `Failed to clean VWAP Alerts data in collection "${collectionName}"`
      );
    }
  }
}
