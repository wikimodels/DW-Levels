import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { AlertOperator } from "../../global/alert-operator.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function refreshRepos() {
  try {
    // Iterate over all collections defined in AlertsCollection
    for (const collectionName of Object.values(AlertsCollection)) {
      try {
        // Refresh AlertOperator's repository for the current collection
        await AlertOperator.refreshRepo(collectionName);
      } catch (error) {
        console.error(
          `%c[DW-Levels] Error refreshing AlertOperator for collection "${collectionName}":`,
          "color: red;",
          error
        );
        const err = error instanceof Error ? error : new Error(String(error));
        try {
          const env = await load();
          await sendErrorReport(
            env["PROJECT_NAME"],
            "AlertOperator:refreshRepos()",
            err.toString()
          );
        } catch (reportError) {
          console.error("Failed to send error report:", reportError);
        }
      }

      try {
        // Refresh VwapAlertOperator's repository for the current collection
        await VwapAlertOperator.refreshRepo(collectionName);
      } catch (error) {
        console.error(
          `%c[DW-Levels] Error refreshing VwapAlertOperator for collection "${collectionName}":`,
          "color: red;",
          error
        );
        const err = error instanceof Error ? error : new Error(String(error));
        try {
          const env = await load();
          await sendErrorReport(
            env["PROJECT_NAME"],
            "VwapAlertOperator:refreshRepos()",
            err.toString()
          );
        } catch (reportError) {
          console.error("Failed to send error report:", reportError);
        }
      }
    }
  } catch (error) {
    // Catch any unexpected errors during the overall refresh process
    console.error(
      `%c[DW-Levels] Unexpected error during refreshRepos execution:`,
      "color: red;",
      error
    );
  }
}
