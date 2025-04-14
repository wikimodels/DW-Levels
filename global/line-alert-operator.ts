import {
  MongoClient,
  Database,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { Alert } from "../models/alert.ts";
import { DColors } from "../shared/colors.ts";
import { AlertsCollection } from "../models/alerts-collections.ts";
import { sendErrorReport } from "../functions/tg/notifications/send-error-report.ts";
import { AlertBase } from "../models/alert-base.ts";
import { logger } from "./logger.ts";
import { Coin } from "../models/coin.ts";

export class LineAlertOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly dbName = "alerts";
  private static alertsData: Map<string, Alert[]> = new Map(
    Object.values(AlertsCollection).map((key) => [key, []])
  );

  /**
   * Initialize the AlertOperator with the provided configuration.
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
          "[DW-Levels] AlertOperator --> MONGO_DB is not defined in the environment variables."
        );
      }

      // Initialize MongoDB client
      this.dbClient = new MongoClient();
      await this.dbClient.connect(config.mongoDb);
      this.db = this.dbClient.database(this.dbName);

      // Load all data into memory
      await this.loadAllData(config.projectName);

      logger.success("LineAlertOperator ---> initialized...", DColors.cyan);
    } catch (error) {
      logger.error("❌ Failed to initialize AlertOperator:", error);
      this.dbClient = null; // Reset to allow retrying initialization

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          config.projectName,
          "AlertOperator:initialize()",
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
            "AlertOperator:loadAllData()",
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
          "AlertOperator --> Database not initialized. Call initialize() first.",
          DColors.red
        );
        return;
      }

      // Validate collection exists in our storage
      if (!this.alertsData.has(collectionName)) {
        logger.error(
          `AlertOperator --> Invalid collection name: ${collectionName}`,
          DColors.red
        );
        return;
      }

      // Fetch fresh data from MongoDB
      const data = await this.getAlertsFromDB(collectionName);

      // Update in-memory storage
      this.alertsData.set(collectionName, []);
      this.alertsData.set(collectionName, data);

      logger.success(
        `AlertOperator --> Refreshed collection: ${collectionName}`,
        DColors.green
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport("AlertOperator", "refreshRepo()", err.toString());
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      logger.error(
        `AlertOperator --> Failed to refresh collection ${collectionName}:`,
        error
      );
      this.alertsData.set(collectionName, []); // Fallback to empty array
    }
  }

  /**
   * Get a MongoDB collection by name.
   * @param collectionName - The name of the collection.
   * @returns The MongoDB collection.
   */
  private static getCollection(collectionName: string): Collection<Alert> {
    try {
      if (!this.db) throw new Error("Database not initialized");
      return this.db.collection<Alert>(collectionName);
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
  ): Promise<Alert[]> {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.find().toArray();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "AlertOperator",
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
  public static getAlerts(collectionName: string): Alert[] {
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
   * Add an alert to the database and update in-memory storage.
   * @param collectionName - The name of the collection.
   * @param alert - The alert to add.
   */
  public static async addAlert(
    collectionName: string,
    alert: Alert
  ): Promise<void> {
    try {
      const collection = this.getCollection(collectionName);
      await collection.insertOne(alert);
      await this.refreshRepo(collectionName);
    } catch (error) {
      logger.error(
        `❌ Error adding alert to collection "${collectionName}":`,
        error
      );

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport("AlertOperator", "addAlert()", err.toString());
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
    alerts: Alert[]
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
          "AlertOperator",
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
          "AlertOperator",
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
   * Update an alert in the database and in-memory storage.
   * @param collectionName - The name of the collection.
   * @param filter - The filter to identify the alert to update.
   * @param updateData - The data to update.
   */
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
      logger.error(
        `Error updating alert in collection "${collectionName}":`,
        error
      );

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport("AlertOperator", "updateAlert()", err.toString());
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      throw new Error(
        `Failed to update alert in collection "${collectionName}"`
      );
    }
  }

  /**
   * Find duplicate alert names in the 'working' collection.
   * @param alertsBase - The list of alert bases to check.
   * @param collectionName - The name of the collection.
   * @returns A list of matching alert names.
   */
  public static async findDuplicateAlertNames(
    alertsBase: AlertBase[],
    collectionName: AlertsCollection
  ): Promise<string[]> {
    try {
      if (!this.db) {
        logger.error(
          "AlertOperator --> Database not initialized. Call initialize() first."
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

      logger.info(
        `AlertOperator --> Found ${matchingAlerts.length} matching alerts in 'working' collection.`,
        DColors.yellow
      );

      const matchingNames = matchingAlerts.map((alert) => alert.alertName);
      return matchingNames;
    } catch (error) {
      logger.error(
        "❌ Error finding matching alerts in 'working' collection:",
        error
      );

      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "AlertOperator",
          "findDuplicateAlertNames()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      throw new Error("Failed to find matching alerts in 'working' collection");
    }
  }

  /**
   * Create alerts based on alert bases and coins.
   * @param alertBases - The list of alert bases.
   * @param coins - The list of coins.
   * @returns A list of created alerts.
   */
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
            logger.info(
              `Coin with symbol ${base.symbol} not found.`,
              DColors.yellow
            );
          }
        } catch (error) {
          // Handle errors for individual alerts
          logger.error(
            `Error processing alert with symbol ${base.symbol}:`,
            error
          );
        }
      }
      return readyAlerts;
    } catch (error) {
      // Handle top-level errors
      logger.error("Error in createAlerts method:", error);
      throw new Error(
        "[DW-Levels]:createAlerts(): Failed to create alerts due to an unexpected error."
      );
    }
  }

  /**
   * Find corrupted symbols in alerts that don't exist in the coins list.
   * @param alerts - The list of alerts to check.
   * @param coins - The list of coins.
   * @returns A list of corrupted symbols.
   */
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
      logger.error("Error finding corrupted symbols:", error);
      throw new Error(
        "[DW-Levels]:findCorruptedSymbols(): Failed to find corrupted symbols due to an unexpected error."
      );
    }
  }

  /**
   * Fetch alerts by symbol from the database.
   * @param symbol - The symbol to filter by.
   * @param collectionName - The name of the collection.
   * @returns A list of alerts matching the symbol.
   */
  public static async getAlertsBySymbol(
    symbol: string,
    collectionName: string
  ): Promise<Alert[]> {
    try {
      const collection = this.getCollection(collectionName);
      return (await collection.find({ symbol }).toArray()) as Alert[];
    } catch (error) {
      logger.error(
        `Error fetching alerts for symbol "${symbol}" in collection "${collectionName}":`,
        error
      );
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        await sendErrorReport(
          "AlertOperator",
          "getAlertsBySymbol()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      throw new Error(
        `Failed to fetch alerts for symbol "${symbol}" in collection "${collectionName}"`
      );
    }
  }

  /**
   * Remove alerts by symbol and optional price.
   * @param symbol - The symbol to filter by.
   * @param collectionName - The name of the collection.
   * @param price - (Optional) The price to filter by.
   * @returns The result of the deletion operation.
   */
  public static async removeBySymbolAndPrice(
    symbol: string,
    collectionName: AlertsCollection,
    price?: number
  ) {
    try {
      // Filter condition based on whether price is provided
      const filter = price
        ? { symbol, price: Number(price) }
        : { symbol, price: { $exists: true } };

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
          "AlertOperator",
          "removeBySymbolAndPrice()",
          err.toString()
        );
      } catch (reportError) {
        logger.error("Failed to send error report:", reportError);
      }
      logger.error(
        `Error deleting alerts for symbol "${symbol}" in collection "${collectionName}":`,
        error
      );
      throw new Error(
        `Failed to delete alerts for symbol "${symbol}" in collection "${collectionName}"`
      );
    }
  }
}
