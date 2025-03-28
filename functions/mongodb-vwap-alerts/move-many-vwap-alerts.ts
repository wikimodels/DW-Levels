import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";

export async function moveManyVwap(
  sourceCollection: string,
  targetCollection: string,
  ids: string[]
): Promise<{ insertCount: number; deleteCount: number }> {
  let insertCount = 0;
  let deleteCount = 0;

  try {
    const sourceAlerts = await VwapAlertOperator.getAlerts(sourceCollection);

    // ✅ Filter alerts that match the given IDs
    const alertsToMove = sourceAlerts.filter((alert) => ids.includes(alert.id));

    if (alertsToMove.length === 0) {
      console.log(`⚠️ No matching alerts found for moving.`);
      return { insertCount, deleteCount };
    }

    // ✅ Move the alerts to the target collection
    for (const alert of alertsToMove) {
      await VwapAlertOperator.addAlert(targetCollection, alert);
    }

    // ✅ Remove the alerts from the source collection
    await VwapAlertOperator.removeAlerts(sourceCollection, ids);

    insertCount = alertsToMove.length;
    deleteCount = alertsToMove.length;

    console.log(
      `✅ Moved ${insertCount} alerts from ${sourceCollection} to ${targetCollection}`
    );

    return { insertCount, deleteCount };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`Failed to move alerts between collections`, {
      error: err.message,
      sourceCollection,
      targetCollection,
      attemptedCount: ids.length,
      insertedCount: insertCount,
      deletedCount: deleteCount,
      stack: err.stack,
    });
    return { insertCount, deleteCount };
  }
}
