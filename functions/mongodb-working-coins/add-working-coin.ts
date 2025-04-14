import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { DColors } from "../../shared/colors.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function addWorkingCoin(coin: Coin): Promise<boolean> {
  const config = ConfigOperator.getConfig();

  try {
    if (!coin || !coin.symbol) {
      logger.error(
        `[CoinOperator] Invalid coin data: Missing required properties.`
      );
      return false;
    }

    await CoinOperator.addCoin(coin);
    logger.success(
      `[CoinOperator] Successfully added coin: ${coin.symbol}`,
      DColors.green
    );
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "addWorkingCoin",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`[CoinOperator] Failed to add coin ${coin.symbol}`, {
      error: err.message,
      coin: coin.symbol,
      stack: err.stack,
    });
    return false;
  }
}
