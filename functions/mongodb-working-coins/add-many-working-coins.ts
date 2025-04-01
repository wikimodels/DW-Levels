import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function addManyWorkingCoins(coins: Coin[]): Promise<boolean> {
  try {
    if (!coins) {
      console.error(
        `[CoinOperator] Invalid coins data: Missing required properties.`
      );
      return false;
    }

    await CoinOperator.addManyCoins(coins);
    console.log(`[CoinOperator] Successfully added coins: ${coins.length}`);
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "addManyWorkingCoins",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(`[CoinOperator] Failed to add ${coins.length} coins`, {
      error: err.message,
      failedCoins: coins.map((c) => c.symbol),
      stack: err.stack,
    });
    return false;
  }
}
