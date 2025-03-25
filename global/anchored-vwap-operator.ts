import {
  MongoClient,
  Database,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { fetchProxyKlineBySymbol } from "../functions/http/proxy-kline-by-symbol.ts";
import { TF } from "../shared/timeframes.ts";
import { DColors } from "../shared/colors.ts";

const env = await load();
const MONGO_DB = env.MONGO_DB;

export class AnchoredVwapOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly DB_NAME = "general";
  private static readonly ANCHORED_VWAPS_COLLECTION = "anchored-vwaps";
  private static readonly VWAP_DATA_COLLECTION = "vwap-data";

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
  public static async saveAnchorPoint(symbol: string, openTime: number) {
    const collection = this.getCollection(this.ANCHORED_VWAPS_COLLECTION);
    await collection.insertOne({
      symbol,
      anchorTime: openTime,
      createdAt: new Date(),
    });
  }

  // Calculate VWAP for a given symbol and anchor time
  public static async calculateVWAP(symbol: string, anchorTime: number) {
    const { data: klineData } = await fetchProxyKlineBySymbol(
      symbol,
      TF.m15,
      1000
    );

    if (!klineData || klineData.length === 0) return null;

    const vwapCollection = this.getCollection(this.VWAP_DATA_COLLECTION);

    // Filter kline data starting from the anchor time
    const vwapKlineData = klineData.filter(
      (kline) => kline.openTime >= anchorTime
    );

    if (!vwapKlineData.length) return null;

    let cumulativeVolume = 0;
    let cumulativeVP = 0;
    const timestamps: number[] = [];
    const vwapValues: number[] = [];

    vwapKlineData.forEach(
      ({ openTime, highPrice, lowPrice, closePrice, baseVolume }) => {
        const typicalPrice = (highPrice + lowPrice + closePrice) / 3;
        cumulativeVP += typicalPrice * baseVolume;
        cumulativeVolume += baseVolume;

        timestamps.push(openTime);
        vwapValues.push(cumulativeVP / cumulativeVolume);
      }
    );

    await vwapCollection.insertOne({
      symbol,
      anchorTime,
      timestamps,
      vwapValues,
    });

    return { symbol, anchorTime, timestamps, vwapValues };
  }

  // Fetch VWAP data for a symbol
  public static async getVWAPData(symbol: string) {
    const collection = this.getCollection(this.VWAP_DATA_COLLECTION);
    return await collection.find({ symbol }).toArray();
  }

  // Delete VWAP data for a symbol
  public static async deleteVWAPData(symbol: string, anchorTime?: number) {
    const filter = anchorTime ? { symbol, anchorTime } : { symbol };
    await this.getCollection(this.ANCHORED_VWAPS_COLLECTION).deleteMany(filter);
    await this.getCollection(this.VWAP_DATA_COLLECTION).deleteMany(filter);
  }
}
