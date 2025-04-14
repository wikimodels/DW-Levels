import { ConfigOperator } from "../../global/config-operator.ts";
import { logger } from "../../global/logger.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function addVwapAlert(
  collectionName: AlertsCollection,
  vwapAlert: VwapAlert
): Promise<{ success: boolean; message: string; error?: unknown }> {
  const config = ConfigOperator.getConfig();

  try {
    await VwapAlertOperator.addAlert(collectionName, vwapAlert);
    return { success: true, message: "VwapAlert  added successfully." };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(config.projectName, "addVwapAlert", err.toString());
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`Failed to add alert to ${collectionName}`, {
      error: err.message,
      collection: collectionName,
      alertSymbol: vwapAlert.symbol,
      stack: err.stack,
    });
    return {
      success: false,
      message: `Failed to add alert to ${collectionName}`,
      error: err,
    };
  }
}
