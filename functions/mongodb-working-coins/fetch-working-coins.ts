import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { CoinOperator } from "../../global/coin-operator.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function fetchWorkingCoins(): Promise<Coin[]> {
  const config = ConfigOperator.getConfig();
  try {
    const coins = CoinOperator.getCoins();
    if (!Array.isArray(coins)) {
      logger.error(`[CoinOperator] Unexpected data format: Expected an array.`);
      return [];
    }

    console.log(`[CoinOperator] Successfully fetched ${coins.length} coins.`);
    return coins;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "fetchWorkingCoins",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`[CoinOperator] Failed to fetch coins`, {
      error: err.message,
      stack: err.stack,
    });
    return [];
  }
}
