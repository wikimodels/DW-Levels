import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";

export async function addVwapAlert(
  collectionName: AlertsCollection,
  vwapAlert: VwapAlert
): Promise<{ success: boolean; message: string; error?: unknown }> {
  try {
    await VwapAlertOperator.addAlert(collectionName, vwapAlert);
    return { success: true, message: "VwapAlert  added successfully." };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
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
