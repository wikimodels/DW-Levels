import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { DColors } from "../../shared/colors.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function deleteBySymbolAndOpenTime(
  symbol: string,
  collectionName: AlertsCollection,
  openTime?: number
): Promise<boolean> {
  const config = ConfigOperator.getConfig();

  try {
    // Attempt to remove the alerts using LineAlertOperator
    await VwapAlertOperator.removeBySymbolAndOpenTime(
      symbol,
      collectionName,
      openTime
    );
    logger.success(
      `✅ Successfully deleted  alerts from ${collectionName}`,
      DColors.green
    );
    return true; // Return true on success
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "deleteBySymbolAndOpenTime",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`Failed to delete   alerts from ${collectionName}`, {
      error: err.message,
      collection: collectionName,
      symbol: symbol,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}
