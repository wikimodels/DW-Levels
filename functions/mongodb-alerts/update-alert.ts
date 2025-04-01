import { AlertOperator } from "./../../global/alert-operator.ts";
import { Alert } from "../../models/alert.ts";
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function updateAlert(
  collectionName: string,
  filter: Partial<Alert>,
  updateData: Partial<Alert>
): Promise<boolean> {
  try {
    // Attempt to update the alert
    await AlertOperator.updateAlert(collectionName, filter, updateData);
    console.log(
      `✅ Alert in collection ${collectionName} updated successfully`
    );
    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(env["PROJECT_NAME"], "updateAlert", err.toString());
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(
      `❌ Error updating alert in collection ${collectionName}:`,
      error
    );
    return false;
  }
}
