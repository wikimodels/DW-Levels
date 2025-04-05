import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { AlertOperator } from "../../global/alert-operator.ts";
import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function fetchAlerts(
  collectionName: AlertsCollection
): Promise<Alert[]> {
  try {
    const res = await AlertOperator.getAlerts(collectionName);

    return res;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(env["PROJECT_NAME"], "fetchAlerts", err.toString());
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(
      `Error fetching alerts from collection ${collectionName}:`,
      error
    );

    // Optionally, you can rethrow the error or handle it more gracefully
    throw new Error(`Failed to fetch alerts from collection ${collectionName}`);
  }
}
