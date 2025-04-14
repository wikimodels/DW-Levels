import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { DColors } from "../../shared/colors.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function deleteManyVwap(
  collectionName: AlertsCollection,
  alertIds: string[]
): Promise<boolean> {
  const config = ConfigOperator.getConfig();
  try {
    // Attempt to remove the alerts using LineAlertOperator
    await VwapAlertOperator.removeAlerts(collectionName, alertIds);
    logger.success(
      `✅ Successfully deleted ${alertIds.length} alerts from ${collectionName}`,
      DColors.green
    );
    return true; // Return true on success
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "deleteManyVwap",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(
      `Failed to delete ${alertIds.length} alerts from ${collectionName}`,
      {
        error: err.message,
        collection: collectionName,
        alertIds: alertIds,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      }
    );
    return false;
  }
}
