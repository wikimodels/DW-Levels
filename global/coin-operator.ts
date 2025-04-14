import {
  MongoClient,
  Database,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { Coin } from "../models/coin.ts"; // Assuming a Coin model exists
import { DColors } from "../shared/colors.ts";
import { logger } from "./logger.ts";

export class CoinOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly dbName = "general";
  private static readonly collectionName = "working-coins";

  // In-memory storage for the collection
  private static coins: Coin[] = [];

  /**
   * Initialize the CoinOperator with the provided configuration.
   * @param config - The application configuration containing MongoDB connection details.
   */
  public static async initialize(config: { mongoDb: string }) {
    if (!this.dbClient) {
      try {
        this.dbClient = new MongoClient();
        await this.dbClient.connect(config.mongoDb);
        this.db = this.dbClient.database(this.dbName);

        // Load data into memory
        await this.loadCoins();

        logger.success("CoinOperator ---> initialized...", DColors.green);
      } catch (error) {
        logger.error("Failed to initialize CoinOperator:", error);
        throw error;
      }
    }
  }

  /**
   * Get the MongoDB collection for working coins.
   * @returns The MongoDB collection for coins.
   */
  private static getCollection(): Collection<Coin> {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.collection<Coin>(this.collectionName);
  }

  /**
   * Load coins from the database into in-memory storage.
   */
  private static async loadCoins() {
    this.coins = await this.getCoinsFromDB();
  }

  /**
   * Fetch coins from the database.
   * @returns A list of coins from the database.
   */
  private static async getCoinsFromDB(): Promise<Coin[]> {
    const collection = this.getCollection();
    return await collection.find().toArray();
  }

  /**
   * Read coins from in-memory storage.
   * @returns The list of coins stored in memory.
   */
  public static getCoins(): Coin[] {
    return this.coins;
  }

  /**
   * Add a single coin to the database and update in-memory storage.
   * @param coin - The coin to add.
   */
  public static async addCoin(coin: Coin): Promise<void> {
    const collection = this.getCollection();
    await collection.insertOne(coin);

    // Update cache
    this.coins.push(coin);
  }

  /**
   * Add multiple coins to the database and update in-memory storage.
   * @param coins - The list of coins to add.
   */
  public static async addManyCoins(coins: Coin[]): Promise<void> {
    const collection = this.getCollection();
    await collection.insertMany(coins);

    // Update cache
    this.coins.push(...coins);
  }

  /**
   * Remove coins from the database and update in-memory storage.
   * @param symbols - The symbols of the coins to remove.
   */
  public static async removeCoins(symbols: string[]): Promise<void> {
    const collection = this.getCollection();

    try {
      await collection.deleteMany({ symbol: { $in: symbols } });

      // Update cache
      this.coins = this.coins.filter((coin) => !symbols.includes(coin.symbol));
    } catch (error) {
      logger.error(`Error removing coins:`, error);
      throw new Error(`Failed to remove coins with given IDs`);
    }
  }

  /**
   * Update a coin in the database and in-memory storage.
   * @param filter - The filter to identify the coin to update.
   * @param updateData - The data to update.
   */
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
