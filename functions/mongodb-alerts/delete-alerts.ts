import { AlertOperator } from "../../global/alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";

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
