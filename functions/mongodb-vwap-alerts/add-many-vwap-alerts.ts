import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function addManyVwapAlerts(
  collectionName: AlertsCollection,
  alerts: VwapAlert[]
): Promise<{ success: boolean; message: string; error?: unknown }> {
  const config = ConfigOperator.getConfig();
  try {
    await VwapAlertOperator.addManyAlerts(collectionName, alerts);
    return { success: true, message: "VwapAlert  added successfully." };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "addManyVwapAlerts",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`Failed to add ${alerts.length} alerts to ${collectionName}`, {
      error: err.message,
      collection: collectionName,
      alertCount: alerts.length,
      stack: err.stack,
    });
    return {
      success: false,
      message: `Failed to add ${alerts.length} alerts to ${collectionName}`,
      error: err,
    };
  }
}
