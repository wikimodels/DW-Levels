import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";

export async function addManyVwapAlerts(
  collectionName: AlertsCollection,
  alerts: VwapAlert[]
): Promise<{ success: boolean; message: string; error?: unknown }> {
  try {
    await VwapAlertOperator.addManyAlerts(collectionName, alerts);
    return { success: true, message: "VwapAlert  added successfully." };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
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
