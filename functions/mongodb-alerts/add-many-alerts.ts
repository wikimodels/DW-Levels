import { AlertOperator } from "../../global/alert-operator.ts";
import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";

export async function addManyAlerts(
  collectionName: AlertsCollection,
  alerts: Alert[]
): Promise<{ success: boolean; message: string; error?: unknown }> {
  try {
    await AlertOperator.addManyAlerts(collectionName, alerts);
    return { success: true, message: "Alert added successfully." };
  } catch (error) {
    console.error(`Error adding alert to ${collectionName}:`, error);
    return { success: false, message: "Failed to add alert.", error };
  }
}
