import { AlertOperator } from "./../../global/alert-operator.ts";
import { Alert } from "../../models/alert.ts";

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
    // Log the error with details for debugging
    console.error(
      `❌ Error updating alert in collection ${collectionName}:`,
      error
    );
    return false;
  }
}
