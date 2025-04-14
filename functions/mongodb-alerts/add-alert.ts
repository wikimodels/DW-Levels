import { LineAlertOperator } from "../../global/line-alert-operator.ts";
import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function addAlert(
  collectionName: AlertsCollection,
  alert: Alert
): Promise<{ success: boolean; message: string; error?: unknown }> {
  const config = ConfigOperator.getConfig();
  try {
    await LineAlertOperator.addAlert(collectionName, alert);
    return { success: true, message: "Alert added successfully." };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(config.projectName, "addAlert", err.toString());
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`Error adding alert to ${collectionName}:`, error);
    return { success: false, message: "Failed to add alert.", error };
  }
}
