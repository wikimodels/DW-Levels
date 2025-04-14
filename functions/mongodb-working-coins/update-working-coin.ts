import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { DColors } from "../../shared/colors.ts";
import { ConfigOperator } from "../../global/config-operator.ts";
import { logger } from "../../global/logger.ts";

export async function updateWorkingCoin(
  filter: Partial<Coin>,
  updateData: Partial<Coin>
): Promise<boolean> {
  try {
    if (!filter || Object.keys(filter).length === 0) {
      logger.error(`[CoinOperator] Invalid filter: Filter cannot be empty.`);
      return false;
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      logger.error(
        `[CoinOperator] Invalid update data: No fields provided for update.`
      );
      return false;
    }

    await CoinOperator.updateCoin(filter, updateData);
    logger.success(
      `[CoinOperator] Successfully updated coin(s) matching filter: ${filter}`,
      DColors.green
    );
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const config = ConfigOperator.getConfig();
      await sendErrorReport(
        config.projectName,
        "updateWorkingCoin",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`[CoinOperator] Failed to update coin(s)`, {
      error: err.message,
      filter: filter,
      updateData: updateData,
      stack: err.stack,
    });
    return false;
  }
}
