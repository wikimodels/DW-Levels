import { LineAlertOperator } from "../../global/line-alert-operator.ts";
import { Alert } from "../../models/alert.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function updateAlert(
  collectionName: string,
  filter: Partial<Alert>,
  updateData: Partial<Alert>
): Promise<boolean> {
  const config = ConfigOperator.getConfig();

  try {
    // Attempt to update the alert
    await LineAlertOperator.updateAlert(collectionName, filter, updateData);
    console.log(
      `✅ Alert in collection ${collectionName} updated successfully`
    );
    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(config.projectName, "updateAlert", err.toString());
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(
      `❌ Error updating alert in collection ${collectionName}:`,
      error
    );
    return false;
  }
}
