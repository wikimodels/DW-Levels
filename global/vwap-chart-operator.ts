import {
  MongoClient,
  Database,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { DColors } from "../shared/colors.ts";

import { VwapAlert } from "../models/vwap-alert.ts";
import { VwapAlertOperator } from "./vwap-alert-operator.ts";

const env = await load();
const MONGO_DB = env.MONGO_DB;

export class VwapChartOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly DB_NAME = "vwap-alerts";
  private static readonly WORKING_VWAP_COLLECTION = "working";
  //private static readonly VWAP_DATA_COLLECTION = "vwap-data";

  // Initialize the static database client and connection
  public static async initialize() {
    if (this.dbClient) return;

    try {
      this.dbClient = new MongoClient();
      await this.dbClient.connect(MONGO_DB);
      this.db = this.dbClient.database(this.DB_NAME);
      console.log(
        "%c[DW-Levels] VwapChartOperator --> initialized...",
        DColors.yellow
      );
    } catch (error) {
      console.error("Failed to initialize VwapChartOperator:", error);
      this.dbClient = null;
      throw error;
    }
  }

  // Get the collection from the database
  private static getCollection(name: string) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.collection(name);
  }

  // Save an anchor point
  public static async saveAnchoredPoint(alert: VwapAlert) {
    const collection = this.getCollection(this.WORKING_VWAP_COLLECTION);

    // Check if the record already exists in the database
    const existingAnchorPoint = await collection.findOne({
      symbol: alert.symbol,
      anchorTime: alert.anchorTime,
    });

    if (existingAnchorPoint) {
      console.log(
        "Anchor point already exists for symbol:",
        alert.symbol,
        "at openTime:",
        alert.anchorTime
      );
      // Optionally return a success message indicating no insert was needed
      return "Anchor point already exists.";
    }

    await collection.insertOne(alert);
    console.log(
      "New anchor point saved for symbol:",
      alert.symbol,
      "at openTime:",
      alert.anchorTime
    );
    await VwapAlertOperator.updateVwapRepo();
    return "Anchor point saved successfully.";
  }

  public static async fetchAllAnchoredPoints(): Promise<VwapAlert[]> {
    const collection = this.getCollection(this.WORKING_VWAP_COLLECTION);
    return (await collection.find({}).toArray()) as VwapAlert[];
  }
  // Fetch VWAP data for a symbol
  public static async getAnchoredPointsCollection(
    symbol: string
  ): Promise<VwapAlert[]> {
    const collection = this.getCollection(this.WORKING_VWAP_COLLECTION);
    return (await collection.find({ symbol }).toArray()) as VwapAlert[];
  }

  // Delete VWAP data for a symbol
  public static async removeAnchorPoint(symbol: string, anchorTime?: number) {
    try {
      // Filter condition based on whether anchorTime is provided
      const filter = anchorTime ? { symbol, anchorTime } : { symbol };

      // Perform the delete operation
      const result = await this.getCollection(
        this.WORKING_VWAP_COLLECTION
      ).deleteMany(filter);
      console.log("result", result);
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
