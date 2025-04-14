import { AlertsCollection } from "../../models/alerts-collections.ts";
import { Alert } from "../../models/alert.ts";

export async function fetchAlerts(
  collectionName: AlertsCollection
): Promise<Alert[]> {
  const kv = await Deno.openKv();
  try {
    const iter = kv.list<Alert>({ prefix: [collectionName] });
    const alerts: Alert[] = [];

    for await (const entry of iter) {
      alerts.push(entry.value);
    }

    return alerts;
  } catch (error) {
    logger.error(
      `❌ Failed to fetch active alerts from ${collectionName}:`,
      error
    );
    return []; // Return an empty array to avoid breaking the app
  } finally {
    kv.close();
  }
}
