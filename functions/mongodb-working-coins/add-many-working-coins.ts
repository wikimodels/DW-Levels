import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { DColors } from "../../shared/colors.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function addManyWorkingCoins(coins: Coin[]): Promise<boolean> {
  const config = ConfigOperator.getConfig();

  try {
    if (!coins) {
      logger.error(
        `[CoinOperator] Invalid coins data: Missing required properties.`
      );
      return false;
    }

    await CoinOperator.addManyCoins(coins);
    logger.success(
      `[CoinOperator] Successfully added coins: ${coins.length}`,
      DColors.green
    );
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "addManyWorkingCoins",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`[CoinOperator] Failed to add ${coins.length} coins`, {
      error: err.message,
      failedCoins: coins.map((c) => c.symbol),
      stack: err.stack,
    });
    return false;
  }
}
