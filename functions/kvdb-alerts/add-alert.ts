import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";

export async function addAlert(
  collectionName: AlertsCollection,
  alert: Alert
): Promise<boolean> {
  const kv = await Deno.openKv();

  try {
    const alertKey = [collectionName, alert.id]; // Unique key using collectionName and alert ID
    const result = await kv.set(alertKey, alert);

    if (result.ok) {
      console.log(
        `✅ Alert added successfully to collection: ${collectionName}`
      );
    } else {
      console.error(`❌ Failed to add alert to collection: ${collectionName}`);
    }

    return result.ok;
  } catch (error) {
    console.error(`❌ Error adding alert to ${collectionName}:`, error);
    return false;
  } finally {
    kv.close();
  }
}
