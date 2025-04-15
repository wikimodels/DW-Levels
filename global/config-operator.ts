// ConfigOperator.ts
import Doppler, { DownloadResponse } from "npm:@dopplerhq/node-sdk";
import { Config } from "../models/config.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { DColors } from "../shared/colors.ts";
import { logger } from "./logger.ts";

const env = await load();

export class ConfigOperator {
  // Static instance of the class (Singleton pattern)
  private static instance: ConfigOperator | null = null;
  private static dopplerToken: string | undefined = env["DOPPLER_TOKEN"];
  // Static in-memory data structure for Config
  private static config: Config | null = null;

  // Private constructor to prevent direct instantiation [[1]]
  private constructor() {}

  // Method to get the Singleton instance
  public static getInstance(): ConfigOperator {
    if (!ConfigOperator.instance) {
      ConfigOperator.instance = new ConfigOperator();
    }
    return ConfigOperator.instance;
  }

  // Initialize method to populate the static in-memory Config structure
  public static async initialize(): Promise<void> {
    if (ConfigOperator.config) {
      logger.info("Configuration is already initialized.", DColors.yellow);
      return;
    }

    try {
      const doppler = new Doppler({
        accessToken: this.dopplerToken,
      });

      // Fetch secrets from Doppler
      const response = await doppler.secrets.download("dw-levels", "prd");
      const secrets = response as DownloadResponse as Record<string, string>;

      // Validate required variables
      const required = ["TG_USER", "TG_DENO_WS_TECH", "MONGO_DB"];
      required.forEach((key) => {
        if (!secrets[key]) {
          throw new Error(`Missing required secret: ${key}`);
        }
      });

      // Populate the static in-memory Config structure
      ConfigOperator.config = {
        tgUser: secrets["TG_USER"],
        tgDenoWsTech: secrets["TG_DENO_WS_TECH"],
        tgDenoWsBusiness: secrets["TG_DENO_WS_BUSINESS"] || "",
        tgReportsBot: secrets["TG_REPORTS_BOT"] || "",
        ngrok: secrets["NGROK"] || "",
        allowedOrigins: [
          secrets["ALLOWED_ORIGIN_I"],
          secrets["ALLOWED_ORIGIN_II"],
          secrets["ALLOWED_ORIGIN_III"],
          secrets["ALLOWED_ORIGIN_IV"],
        ],
        projectName: secrets["PROJECT_NAME"] || "",
        mongoDb: secrets["MONGO_DB"],
        coinsApi: secrets["COINS"] || "",
        coinsStoreApi: secrets["COINS_STORE"] || "",
        klineApis: {
          m15: secrets["KLINE_15M"] || "",
          h1: secrets["KLINE_1H"] || "",
          h4: secrets["KLINE_4H"] || "",
          symbol: secrets["KLINE_BY_SYMBOL"] || "",
          oi: secrets["OI"] || "",
          fr: secrets["FR"] || "",
        },
        googleAuth: {
          clientId: secrets["GOOGLE_CLIENT_ID"] || "",
          project_id: secrets["GOOGLE_PROJECT_ID"] || "",
          auth_uri: secrets["GOOGLE_AUTH_URI"] || "",
          token_uri: secrets["GOOGLE_TOKEN_URI"] || "",
          auth_provider_x509_cert_url:
            secrets["GOOGLE_AUTH_PROVIDER_X509_CERT_URL"] || "",
          client_secret: secrets["GOOGLE_CLIENT_SECRET"] || "",
          redirect_uris: [secrets["GOOGLE_REDIRECT_URI_I"]],
          javascript_origins: [secrets["GOOGLE_JAVASCRIPT_ORIGIN_I"]],
        },
      };

      logger.info("ConfigOperator ---> initialized...", DColors.cyan);
    } catch (error) {
      logger.error("Failed to initialize configuration:", error);
      throw error;
    }
  }

  // Method to access the static in-memory Config structure
  public static getConfig(): Config {
    if (!ConfigOperator.config) {
      throw new Error(
        "Configuration is not initialized. Call initialize() first."
      );
    }
    return ConfigOperator.config;
  }

  // Method to update the static in-memory Config structure
  public static async reloadConfig(): Promise<void> {
    if (!this.dopplerToken) {
      throw new Error("Doppler token is required to reload the configuration.");
    }

    try {
      logger.info("Reloading configuration from Doppler...", DColors.cyan);
      await ConfigOperator.initialize();
      logger.success("Configuration reloaded successfully.", DColors.green);
    } catch (error) {
      logger.error("Failed to reload configuration:", error);
      throw error;
    }
  }
}
