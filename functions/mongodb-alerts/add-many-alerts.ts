import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { AlertOperator } from "../../global/alert-operator.ts";
import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function addManyAlerts(
  collectionName: AlertsCollection,
  alerts: Alert[]
): Promise<{ success: boolean; message: string; error?: unknown }> {
  try {
    await AlertOperator.addManyAlerts(collectionName, alerts);
    return { success: true, message: "Alert added successfully." };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "addManyAlerts",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(`Error adding alert to ${collectionName}:`, error);
    return { success: false, message: "Failed to add alert.", error };
  }
}
