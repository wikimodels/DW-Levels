import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { AlertOperator } from "../../global/alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function deleteMany(
  collectionName: AlertsCollection,
  alertIds: string[]
): Promise<boolean> {
  try {
    // Attempt to remove the alerts using AlertOperator
    await AlertOperator.removeAlerts(collectionName, alertIds);
    console.log(
      `✅ Successfully deleted ${alertIds.length} alerts from ${collectionName}`
    );
    return true; // Return true on success
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(env["PROJECT_NAME"], "deleteMany", err.toString());
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    // Log the error with details for debugging
    console.error(
      `❌ Error deleting alerts with IDs [${alertIds.join(
        ", "
      )}] from ${collectionName}:`,
      error
    );
    return false; // Return false if an error occurs
  }
}
