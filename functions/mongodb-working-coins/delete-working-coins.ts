import { CoinOperator } from "../../global/coin-operator.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { DColors } from "../../shared/colors.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function deleteWorkingCoins(symbols: string[]): Promise<boolean> {
  const config = ConfigOperator.getConfig();

  try {
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      logger.error(
        `[CoinOperator] Invalid input: Symbols array is empty or not provided.`
      );
      return false;
    }

    await CoinOperator.removeCoins(symbols);
    logger.success(
      `[CoinOperator] Successfully removed coins: ${symbols.join(", ")}`,
      DColors.green
    );
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "deleteWorkingCoins",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`[CoinOperator] Failed to delete ${symbols.length} coins`, {
      error: err.message,
      symbols: symbols,
      stack: err.stack,
    });
    return false;
  }
}
