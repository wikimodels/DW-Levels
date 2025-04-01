import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function addWorkingCoin(coin: Coin): Promise<boolean> {
  try {
    if (!coin || !coin.symbol) {
      console.error(
        `[CoinOperator] Invalid coin data: Missing required properties.`
      );
      return false;
    }

    await CoinOperator.addCoin(coin);
    console.log(`[CoinOperator] Successfully added coin: ${coin.symbol}`);
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "addWorkingCoin",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(`[CoinOperator] Failed to add coin ${coin.symbol}`, {
      error: err.message,
      coin: coin.symbol,
      stack: err.stack,
    });
    return false;
  }
}
