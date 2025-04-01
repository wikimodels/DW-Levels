import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function deleteManyVwap(
  collectionName: AlertsCollection,
  alertIds: string[]
): Promise<boolean> {
  try {
    // Attempt to remove the alerts using AlertOperator
    await VwapAlertOperator.removeAlerts(collectionName, alertIds);
    console.log(
      `✅ Successfully deleted ${alertIds.length} alerts from ${collectionName}`
    );
    return true; // Return true on success
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "deleteManyVwap",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(
      `Failed to delete ${alertIds.length} alerts from ${collectionName}`,
      {
        error: err.message,
        collection: collectionName,
        alertIds: alertIds,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      }
    );
    return false;
  }
}
