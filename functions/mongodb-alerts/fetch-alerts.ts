import { AlertOperator } from "../../global/alert-operator.ts";
import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";

export async function fetchAlerts(
  collectionName: AlertsCollection
): Promise<Alert[]> {
  try {
    return await AlertOperator.getAlerts(collectionName);
  } catch (error) {
    // Log the error with details for debugging
    console.error(
      `Error fetching alerts from collection ${collectionName}:`,
      error
    );

    // Optionally, you can rethrow the error or handle it more gracefully
    throw new Error(`Failed to fetch alerts from collection ${collectionName}`);
  }
}
