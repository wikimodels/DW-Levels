import { ConfigOperator } from "../../global/config-operator.ts";
import { LineAlertOperator } from "../../global/line-alert-operator.ts";
import { logger } from "../../global/logger.ts";
import { DColors } from "../../shared/colors.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function moveMany(
  sourceCollection: string,
  targetCollection: string,
  ids: string[]
): Promise<{ insertCount: number; deleteCount: number }> {
  let insertCount = 0;
  let deleteCount = 0;
  const config = ConfigOperator.getConfig();
  try {
    const sourceAlerts = await LineAlertOperator.getAlerts(sourceCollection);

    // ✅ Filter alerts that match the given IDs
    const alertsToMove = sourceAlerts.filter((alert) => ids.includes(alert.id));

    if (alertsToMove.length === 0) {
      logger.info(`⚠️ No matching alerts found for moving.`, DColors.yellow);
      return { insertCount, deleteCount };
    }

    // ✅ Move the alerts to the target collection
    for (const alert of alertsToMove) {
      await LineAlertOperator.addAlert(targetCollection, alert);
    }

    // ✅ Remove the alerts from the source collection
    await LineAlertOperator.removeAlerts(sourceCollection, ids);

    insertCount = alertsToMove.length;
    deleteCount = alertsToMove.length;

    logger.success(
      `✅ Moved ${insertCount} alerts from ${sourceCollection} to ${targetCollection}`,
      DColors.green
    );

    return { insertCount, deleteCount };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(config.projectName, "moveMany", err.toString());
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(
      `❌ Error moving alerts from ${sourceCollection} to ${targetCollection}:`,
      error
    );
    return { insertCount, deleteCount };
  }
}
