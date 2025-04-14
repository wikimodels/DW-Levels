// import Doppler, { DownloadResponse } from "npm:@dopplerhq/node-sdk";
// import { Config } from "./models/config.ts";
// import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";

// const env = await load();

// export async function ConfigOperator.getConfig();: Promise<Config> {
//   const doppler = new Doppler({
//     accessToken: env["DOPPLER_TOKEN"],
//   });

//   try {
//     // Type assertion for the downloaded secrets
//     const response = await doppler.secrets.download("dw-levels", "prd");
//     const secrets = response as DownloadResponse as Record<string, string>; // Or use proper interface if available

//     // Validate required variables
//     const required = ["TG_USER", "TG_DENO_WS_TECH", "MONGO_DB"];

//     required.forEach((key) => {
//       if (!secrets[key]) {
//         throw new Error(`Missing required secret: ${key}`);
//       }
//     });

//     // Helper function to get values with fallback
//     const getSecret = (key: string, optional = false): string => {
//       const value = secrets[key];
//       if (!value && !optional) {
//         throw new Error(`Missing secret: ${key}`);
//       }
//       return value || "";
//     };

//     return {
//       tgUser: getSecret("TG_USER"),
//       tgDenoWsTech: getSecret("TG_DENO_WS_TECH"),
//       tgDenoWsBusiness: getSecret("TG_DENO_WS_BUSINESS", true),
//       tgReportsBot: getSecret("TG_REPORTS_BOT", true),
//       ngrok: getSecret("NGROK", true),
//       origins: [
//         getSecret("ORIGIN_I", true),
//         getSecret("ORIGIN_II", true),
//         getSecret("ORIGIN_III", true),
//         getSecret("ORIGIN_IV", true),
//       ].filter(Boolean),
//       projectName: getSecret("PROJECT_NAME", true),
//       mongoDb: getSecret("MONGO_DB"),
//       coinsApi: getSecret("COINS", true),
//       coinsStoreApi: getSecret("COINS_STORE", true),
//       klineApis: {
//         m15: getSecret("KLINE_15M", true),
//         h1: getSecret("KLINE_1H", true),
//         h4: getSecret("KLINE_4H", true),
//         symbol: getSecret("KLINE_BY_SYMBOL", true),
//         oi: getSecret("OI", true),
//         fr: getSecret("FR", true),
//       },
//     };
//   } catch (error) {
//     logger.error("Failed to load configuration:", error);
//     throw error;
//   }
// }
