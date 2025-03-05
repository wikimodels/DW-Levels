import {
  MongoClient,
  Database,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { Coin } from "../models/coin.ts"; // Assuming a Coin model exists
import { DColors } from "../shared/colors.ts";

const { MONGO_DB } = await load();

export class CoinOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly dbName = "general";
  private static readonly collectionName = "working-coins";

  // In-memory storage for the collection
  private static coins: Coin[] = [];

  public static async initialize() {
    if (!this.dbClient) {
      this.dbClient = new MongoClient();
      await this.dbClient.connect(MONGO_DB);
      this.db = this.dbClient.database(this.dbName);

      // Load data into memory
      await this.loadCoins();

      console.log("%c[DW-Leves] CoinRepo initialized...", DColors.magenta);
    }
  }

  private static getCollection(): Collection<Coin> {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.collection<Coin>(this.collectionName);
  }

  private static async loadCoins() {
    this.coins = await this.getCoinsFromDB();
  }

  private static async getCoinsFromDB(): Promise<Coin[]> {
    const collection = this.getCollection();
    return await collection.find().toArray();
  }

  // Read from in-memory storage
  public static getCoins(): Coin[] {
    return this.coins;
  }

  // Add coin to DB and update in-memory storage
  public static async addCoin(coin: Coin): Promise<void> {
    const collection = this.getCollection();
    await collection.insertOne(coin);

    // Update cache
    this.coins.push(coin);
  }

  // Remove coins from DB and update in-memory storage
  public static async removeCoins(symbols: string[]): Promise<void> {
    const collection = this.getCollection();

    try {
      await collection.deleteMany({ symbol: { $in: symbols } });

      // Update cache
      this.coins = this.coins.filter((coin) => !symbols.includes(coin.symbol));
    } catch (error) {
      console.error(`Error removing coins:`, error);
      throw new Error(`Failed to remove coins with given IDs`);
    }
  }

  // Update coin in DB and in-memory storage
  public static async updateCoin(
    filter: Partial<Coin>,
    updateData: Partial<Coin>
  ): Promise<void> {
    const collection = this.getCollection();
    await collection.updateOne(filter, { $set: updateData });

    // Update cache
    this.coins = this.coins.map((coin) =>
      Object.keys(filter).every(
        (key) => coin[key as keyof Coin] === filter[key as keyof Coin]
      )
        ? { ...coin, ...updateData }
        : coin
    );
  }
}
