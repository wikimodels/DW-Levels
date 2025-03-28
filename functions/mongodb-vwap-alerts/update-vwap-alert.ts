import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";

export async function updateVwapAlert(
  collectionName: string,
  filter: Partial<VwapAlert>,
  updateData: Partial<VwapAlert>
): Promise<boolean> {
  try {
    // Attempt to update the VwapAlert
    await VwapAlertOperator.updateAlert(collectionName, filter, updateData);
    console.log(
      `✅ VwapAlert  in collection ${collectionName} updated successfully`
    );
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`Failed to update alert in ${collectionName}`, {
      error: err.message,
      collection: collectionName,
      filter: filter,
      updateData: updateData,
      stack: err.stack,
    });
    return false;
  }
}
