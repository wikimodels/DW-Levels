import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function addManyVwapAlerts(
  collectionName: AlertsCollection,
  alerts: VwapAlert[]
): Promise<{ success: boolean; message: string; error?: unknown }> {
  try {
    await VwapAlertOperator.addManyAlerts(collectionName, alerts);
    return { success: true, message: "VwapAlert  added successfully." };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "addManyVwapAlerts",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(
      `Failed to add ${alerts.length} alerts to ${collectionName}`,
      {
        error: err.message,
        collection: collectionName,
        alertCount: alerts.length,
        stack: err.stack,
      }
    );
    return {
      success: false,
      message: `Failed to add ${alerts.length} alerts to ${collectionName}`,
      error: err,
    };
  }
}
