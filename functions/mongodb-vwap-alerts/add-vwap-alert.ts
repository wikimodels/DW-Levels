import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function addVwapAlert(
  collectionName: AlertsCollection,
  vwapAlert: VwapAlert
): Promise<{ success: boolean; message: string; error?: unknown }> {
  try {
    await VwapAlertOperator.addAlert(collectionName, vwapAlert);
    return { success: true, message: "VwapAlert  added successfully." };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "addVwapAlert",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(`Failed to add alert to ${collectionName}`, {
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
