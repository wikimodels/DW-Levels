import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";

export async function moveMany(
  sourceCollection: AlertsCollection,
  targetCollection: AlertsCollection,
  alerts: Alert[]
): Promise<{ insertCount: number; deleteCount: number }> {
  const kv = await Deno.openKv();
  let insertCount = 0;
  let deleteCount = 0;

  try {
    const symbolsToMove = new Set(alerts.map((alert) => alert.symbol));
    const movedAlerts: Alert[] = [];

    // ✅ Start KV atomic transaction
    const atomic = kv.atomic();

    // ✅ Iterate over alerts in the source collection
    for await (const entry of kv.list<Alert>({ prefix: [sourceCollection] })) {
      const alert = entry.value;

      if (symbolsToMove.has(alert.symbol)) {
        const targetKey = [targetCollection, alert.id];
        atomic.set(targetKey, alert);
        atomic.delete(entry.key);
        movedAlerts.push(alert);
      }
    }

    // ✅ Commit atomic operation
    const result = await atomic.commit();

    if (result.ok) {
      insertCount = movedAlerts.length;
      deleteCount = movedAlerts.length;
      console.log(
        `✅ Moved ${insertCount} alerts from ${sourceCollection} to ${targetCollection}`
      );
    } else {
      logger.error("❌ Failed to move some alerts");
    }

    return { insertCount, deleteCount };
  } catch (error) {
    logger.error(
      `❌ Error moving alerts from ${sourceCollection} to ${targetCollection}:`,
      error
    );
    return { insertCount, deleteCount };
  } finally {
    kv.close();
  }
}
