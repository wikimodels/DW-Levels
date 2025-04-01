import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function deleteOneVwap(
  collectionName: AlertsCollection,
  alertId: string
): Promise<boolean> {
  try {
    // Attempt to remove the alerts using AlertOperator
    await VwapAlertOperator.removeAlert(collectionName, alertId);
    console.log(
      `✅ Successfully deleted VWAP Alert ${alertId} alerts from ${collectionName}`
    );
    return true; // Return true on success
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "deleteOneVwap",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(
      `Failed to delete VWAP Alert ${alertId} alerts from ${collectionName}`,
      {
        error: err.message,
        collection: collectionName,
        alertId: alertId,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      }
    );
    return false;
  }
}
