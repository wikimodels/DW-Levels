import { LineAlertOperator } from "../../global/line-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { DColors } from "../../shared/colors.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function deleteMany(
  collectionName: AlertsCollection,
  alertIds: string[]
): Promise<boolean> {
  try {
    // Attempt to remove the alerts using LineAlertOperator
    await LineAlertOperator.removeAlerts(collectionName, alertIds);
    logger.success(
      `✅ Successfully deleted ${alertIds.length} alerts from ${collectionName}`,
      DColors.green
    );
    return true; // Return true on success
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const config = ConfigOperator.getConfig();
    try {
      await sendErrorReport(config.projectName, "deleteMany", err.toString());
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    // Log the error with details for debugging
    logger.error(
      `❌ Error deleting alerts with IDs [${alertIds.join(
        ", "
      )}] from ${collectionName}:`,
      error
    );
    return false; // Return false if an error occurs
  }
}
