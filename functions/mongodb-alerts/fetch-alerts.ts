import { ConfigOperator } from "../../global/config-operator.ts";
import { LineAlertOperator } from "../../global/line-alert-operator.ts";
import { logger } from "../../global/logger.ts";
import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function fetchAlerts(
  collectionName: AlertsCollection
): Promise<Alert[]> {
  const config = ConfigOperator.getConfig();
  try {
    const res = await LineAlertOperator.getAlerts(collectionName);

    return res;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(config.projectName, "fetchAlerts", err.toString());
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(
      `Error fetching alerts from collection ${collectionName}:`,
      error
    );

    // Optionally, you can rethrow the error or handle it more gracefully
    throw new Error(`Failed to fetch alerts from collection ${collectionName}`);
  }
}
