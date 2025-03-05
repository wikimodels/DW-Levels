import { AlertOperator } from "../../global/alert-operator.ts";
import { Alert } from "../../models/alert.ts";

export async function moveMany(
  sourceCollection: string,
  targetCollection: string,
  ids: string[]
): Promise<{ insertCount: number; deleteCount: number }> {
  let insertCount = 0;
  let deleteCount = 0;

  try {
    const sourceAlerts = await AlertOperator.getAlerts(sourceCollection);

    // ✅ Filter alerts that match the given IDs
    const alertsToMove = sourceAlerts.filter((alert) => ids.includes(alert.id));

    if (alertsToMove.length === 0) {
      console.log(`⚠️ No matching alerts found for moving.`);
      return { insertCount, deleteCount };
    }

    // ✅ Move the alerts to the target collection
    for (const alert of alertsToMove) {
      await AlertOperator.addAlert(targetCollection, alert);
    }

    // ✅ Remove the alerts from the source collection
    await AlertOperator.removeAlerts(sourceCollection, ids);

    insertCount = alertsToMove.length;
    deleteCount = alertsToMove.length;

    console.log(
      `✅ Moved ${insertCount} alerts from ${sourceCollection} to ${targetCollection}`
    );

    return { insertCount, deleteCount };
  } catch (error) {
    console.error(
      `❌ Error moving alerts from ${sourceCollection} to ${targetCollection}:`,
      error
    );
    return { insertCount, deleteCount };
  }
}
