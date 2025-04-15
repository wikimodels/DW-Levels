import {
  Database,
  MongoClient,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import {
  jwtVerify,
  createRemoteJWKSet,
} from "https://deno.land/x/jose@v4.14.4/index.ts";
import { ConfigOperator } from "./config-operator.ts";
import { GoogleUserData } from "../models/google-user-data.ts";
import { DColors } from "../shared/colors.ts";
import { logger } from "./logger.ts";
import { UserData } from "../models/user-data.ts";
import { Config } from "../models/config.ts";

export class GoogleAuthOperator {
  private static dbClient: MongoClient | null = null;
  private static db: Database | null = null;
  private static readonly dbName = "auth";
  private static readonly collectionName = "whitelist";

  public static async initialize(config: Config) {
    if (this.dbClient) return; // Prevent re-initialization
    try {
      const MONGO_DB_URI = config.mongoDb;

      if (!MONGO_DB_URI) {
        throw new Error("MongoDB URI is not defined in the environment.");
      }

      this.dbClient = new MongoClient();
      await this.dbClient.connect(MONGO_DB_URI);
      this.db = this.dbClient.database(this.dbName);
      logger.success("GoogleAuthOperator ---> initialized...", DColors.magenta);
    } catch (error) {
      console.error("Failed to initialize GoogleAuthOperator:", error);
      throw error;
    }
  }

  /**
   * Validates the JWT token using Google's public keys.
   * @param token - The JWT token to validate.
   * @returns The decoded payload if valid.
   */
  public static async validateJwtToken(token: string): Promise<GoogleUserData> {
    try {
      const config = ConfigOperator.getConfig();
      const GOOGLE_CLIENT_ID = config.googleAuth.clientId;

      const JWKS = createRemoteJWKSet(
        new URL("https://www.googleapis.com/oauth2/v3/certs")
      );

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: "https://accounts.google.com",
        audience: GOOGLE_CLIENT_ID,
      });

      return payload as GoogleUserData;
    } catch (error) {
      logger.error("JWT validation failed:", error);
      throw new Error("Invalid or expired JWT token.");
    }
  }

  /**
   * Checks if the user's email is in the whitelist stored in MongoDB.
   * @param email - The user's email to check.
   * @returns True if the email is whitelisted, false otherwise.
   */
  public static async isEmailWhitelisted(email: string): Promise<boolean> {
    try {
      if (!this.db) {
        throw new Error("Database not initialized. Call initialize() first.");
      }

      const whitelistCollection = this.db.collection(this.collectionName);
      const result = await whitelistCollection.findOne({ email });

      return !!result; // Returns true if the email exists in the whitelist
    } catch (error) {
      console.error("Error checking email whitelist:", error);
      throw new Error("Failed to check email whitelist.");
    }
  }

  /**
   * Extracts and returns user details (name, surname, email, image URL).
   * @param payload - The decoded JWT payload.
   * @returns An object containing user details.
   */
  public static getUserDetails(payload: GoogleUserData): UserData {
    return {
      isWhitelisted: false,
      givenName: payload.given_name || "Unknown",
      familyName: payload.family_name || "Unknown",
      email: payload.email || "Unknown",
      picture: payload.picture || "",
    };
  }

  /**
   * Main method to authenticate a user with a JWT token.
   * @param token - The JWT token to authenticate.
   * @returns User details if authentication is successful.
   */
  public static async authenticateUser(token: string) {
    try {
      // Step 1: Validate the JWT token
      const payload = await this.validateJwtToken(token);
      // Step 2: Check if the user's email is whitelisted
      const isWhitelisted = await this.isEmailWhitelisted(payload.email);

      // Step 4: Return user details
      const user = this.getUserDetails(payload);
      user.isWhitelisted = isWhitelisted;

      return user;
    } catch (error) {
      logger.error("Authentication failed:", error);
      throw error;
    }
  }
}
