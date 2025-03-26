import {
  MongoClient,
  Database,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { DColors } from "../shared/colors.ts";
import { AnchorPoint } from "../models/anchor-point.ts";

const env = await load();
const MONGO_DB = env.MONGO_DB;

export class AnchoredVwapOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly DB_NAME = "general";
  private static readonly ANCHOR_POINTS_COLLECTION = "anchored-vwaps";
  //private static readonly VWAP_DATA_COLLECTION = "vwap-data";

  // Initialize the static database client and connection
  public static async initialize() {
    if (this.dbClient) return;

    try {
      this.dbClient = new MongoClient();
      await this.dbClient.connect(MONGO_DB);
      this.db = this.dbClient.database(this.DB_NAME);
      console.log(
        "%c[DW-Levels] AnchoredVwapOperator --> initialized...",
        DColors.yellow
      );
    } catch (error) {
      console.error("Failed to initialize AnchoredVwapOperator:", error);
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
  public static async saveAnchoredPoint(symbol: string, openTime: number) {
    const collection = this.getCollection(this.ANCHOR_POINTS_COLLECTION);

    // Check if the record already exists in the database
    const existingAnchorPoint = await collection.findOne({
      symbol,
      anchorTime: openTime,
    });

    if (existingAnchorPoint) {
      console.log(
        "Anchor point already exists for symbol:",
        symbol,
        "at openTime:",
        openTime
      );
      // Optionally return a success message indicating no insert was needed
      return "Anchor point already exists.";
    }

    // If the record does not exist, insert a new anchor point
    const anchorPoint: AnchorPoint = {
      symbol,
      anchorTime: openTime,
      timestamp: new Date().getTime(),
    };

    await collection.insertOne(anchorPoint);
    console.log(
      "New anchor point saved for symbol:",
      symbol,
      "at openTime:",
      openTime
    );
    return "Anchor point saved successfully.";
  }

  // Calculate VWAP for a given symbol and anchor time
  // public static async calculateVWAP(symbol: string, anchorTime: number) {
  //   const { data: klineData } = await fetchProxyKlineBySymbol(
  //     symbol,
  //     TF.m15,
  //     1000
  //   );

  //   if (!klineData || klineData.length === 0) return null;

  //   const vwapCollection = this.getCollection(this.VWAP_DATA_COLLECTION);

  //   // Filter kline data starting from the anchor time
  //   const vwapKlineData = klineData.filter(
  //     (kline) => kline.openTime >= anchorTime
  //   );

  //   if (!vwapKlineData.length) return null;

  //   let cumulativeVolume = 0;
  //   let cumulativeVP = 0;
  //   const timestamps: number[] = [];
  //   const vwapValues: number[] = [];

  //   vwapKlineData.forEach(
  //     ({ openTime, highPrice, lowPrice, closePrice, baseVolume }) => {
  //       const typicalPrice = (highPrice + lowPrice + closePrice) / 3;
  //       cumulativeVP += typicalPrice * baseVolume;
  //       cumulativeVolume += baseVolume;

  //       timestamps.push(openTime);
  //       vwapValues.push(cumulativeVP / cumulativeVolume);
  //     }
  //   );

  //   await vwapCollection.insertOne({
  //     symbol,
  //     anchorTime,
  //     timestamps,
  //     vwapValues,
  //   });

  //   return { symbol, anchorTime, timestamps, vwapValues };
  // }

  // Fetch VWAP data for a symbol
  public static async getAnchoredPointsCollection(
    symbol: string
  ): Promise<AnchorPoint[]> {
    const collection = this.getCollection(this.ANCHOR_POINTS_COLLECTION);
    return (await collection.find({ symbol }).toArray()) as AnchorPoint[];
  }

  // Delete VWAP data for a symbol
  // Delete VWAP data for a symbol
  public static async removeAnchorPoint(symbol: string, anchorTime?: number) {
    try {
      // Filter condition based on whether anchorTime is provided
      const filter = anchorTime ? { symbol, anchorTime } : { symbol };

      // Perform the delete operation
      const result = await this.getCollection(
        this.ANCHOR_POINTS_COLLECTION
      ).deleteMany(filter);

      // Check if the operation was successful
      if (result) {
        return {
          acknowledged: true,
          deletedCount: result, // Accessing deletedCount from result
        };
      } else {
        // If no result is returned, it's likely an issue
        throw new Error("No result returned from delete operation.");
      }
    } catch (error) {
      // Catch any errors that occur during the delete operation
      console.error("Error deleting VWAP data:", error);
      throw new Error(`Failed to delete VWAP data: ${error}`);
    }
  }
}
