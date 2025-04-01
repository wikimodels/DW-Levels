import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

const env = await load();

export async function refreshProxyCoins(): Promise<Coin[]> {
  try {
    const url = env["COINS_STORE"];

    if (!url) {
      throw new Error("COINS environment variable is missing.");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.coins;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        env["PROJECT_NAME"],
        "refreshProxyCoins",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error("Failed to fetch Kline data:", error);
    return [];
  }
}
