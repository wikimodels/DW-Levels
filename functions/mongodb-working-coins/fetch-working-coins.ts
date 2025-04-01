import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function fetchWorkingCoins(): Promise<Coin[]> {
  try {
    const coins = await CoinOperator.getCoins();
    if (!Array.isArray(coins)) {
      console.error(
        `[CoinOperator] Unexpected data format: Expected an array.`
      );
      return [];
    }

    console.log(`[CoinOperator] Successfully fetched ${coins.length} coins.`);
    return coins;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "fetchWorkingCoins",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(`[CoinOperator] Failed to fetch coins`, {
      error: err.message,
      stack: err.stack,
    });
    return [];
  }
}
