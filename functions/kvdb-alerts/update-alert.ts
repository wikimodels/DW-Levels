import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";

export async function updateAlert(
  collectionName: AlertsCollection,
  alert: Alert
): Promise<boolean> {
  const kv = await Deno.openKv();
  const alertKey = [collectionName, alert.id]; // Unique key

  try {
    // ✅ Step 1: Check if the alert exists
    const existingAlert = await kv.get<Alert>(alertKey);
    if (!existingAlert.value) {
      console.warn(`⚠️ Alert with ID ${alert.id} not found in ${collectionName}`);
      return false;
    }

    // ✅ Step 2: Delete the existing alert
    await kv.delete(alertKey);
    console.log(`🗑️ Deleted existing alert: ${alert.id}`);

    // ✅ Step 3: Insert the new alert
    await kv.set(alertKey, alert);
    console.log(`✅ Updated alert in ${collectionName}:`, alert);

    return true;
  } catch (error) {
    console.error(`❌ Error updating alert in ${collectionName}:`, error);
    return false;
  } finally {
    kv.close();
  }
}
