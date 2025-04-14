import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { DColors } from "../../shared/colors.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function deleteOneVwap(
  collectionName: AlertsCollection,
  alertId: string
): Promise<boolean> {
  const config = ConfigOperator.getConfig();
  try {
    // Attempt to remove the alerts using LineAlertOperator
    await VwapAlertOperator.removeAlert(collectionName, alertId);
    logger.success(
      `✅ Successfully deleted VWAP Alert ${alertId} alerts from ${collectionName}`,
      DColors.green
    );
    return true; // Return true on success
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "deleteOneVwap",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(
      `Failed to delete VWAP Alert ${alertId} alerts from ${collectionName}`,
      {
        error: err.message,
        collection: collectionName,
        alertId: alertId,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      }
    );
    return false;
  }
}
