import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";

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
