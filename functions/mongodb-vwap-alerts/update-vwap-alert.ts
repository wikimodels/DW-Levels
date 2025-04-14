import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";

import { VwapAlert } from "../../models/vwap-alert.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { DColors } from "../../shared/colors.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function updateVwapAlert(
  collectionName: string,
  filter: Partial<VwapAlert>,
  updateData: Partial<VwapAlert>
): Promise<boolean> {
  const config = ConfigOperator.getConfig();

  try {
    // Attempt to update the VwapAlert
    await VwapAlertOperator.updateAlert(collectionName, filter, updateData);
    logger.success(
      `✅ VwapAlert  in collection ${collectionName} updated successfully`,
      DColors.green
    );
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "updateVwapAlert",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`Failed to update alert in ${collectionName}`, {
      error: err.message,
      collection: collectionName,
      filter: filter,
      updateData: updateData,
      stack: err.stack,
    });
    return false;
  }
}
