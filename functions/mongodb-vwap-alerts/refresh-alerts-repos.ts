import { ConfigOperator } from "../../global/config-operator.ts";
import { LineAlertOperator } from "../../global/line-alert-operator.ts";
import { logger } from "../../global/logger.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function refreshAlertsRepos() {
  const config = ConfigOperator.getConfig();
  try {
    // Iterate over all collections defined in AlertsCollection
    for (const collectionName of Object.values(AlertsCollection)) {
      try {
        // Refresh LineAlertOperator's repository for the current collection
        await LineAlertOperator.refreshRepo(collectionName);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(
          `Error refreshing LineAlertOperator for collection "${collectionName}":`,
          err
        );

        try {
          const config = await ConfigOperator.getConfig();
          await sendErrorReport(
            config.projectName,
            "LineAlertOperator:refreshAlertsRepos()",
            err.toString()
          );
        } catch (reportError) {
          logger.error("Failed to send error report:", reportError);
        }
      }

      try {
        // Refresh VwapAlertOperator's repository for the current collection
        await VwapAlertOperator.refreshRepo(collectionName);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(
          `Error refreshing VwapAlertOperator for collection "${collectionName}":`,

          err
        );

        try {
          await sendErrorReport(
            config.projectName,
            "VwapAlertOperator:refreshAlertsRepos()",
            err.toString()
          );
        } catch (reportError) {
          logger.error("Failed to send error report:", reportError);
        }
      }
    }
  } catch (error) {
    // Catch any unexpected errors during the overall refresh process
    logger.error(
      `Unexpected error during refreshAlertsRepos execution:`,
      error
    );
  }
}
