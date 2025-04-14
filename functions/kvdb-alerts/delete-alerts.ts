import { AlertsCollection } from "../../models/alerts-collections.ts";

export async function deleteMany(
  collectionName: AlertsCollection,
  ids: string[]
): Promise<boolean> {
  const kv = await Deno.openKv();

  try {
    let allDeleted = true;

    for (const id of ids) {
      const alertKey = [collectionName, id];

      // ✅ Check if the alert exists
      const existingAlert = await kv.get(alertKey);
      if (!existingAlert.value) {
        console.warn(`⚠️ Alert with ID ${id} not found in ${collectionName}`);
        allDeleted = false;
        continue;
      }

      // ✅ Delete the alert
      await kv.delete(alertKey);
      console.log(`🗑️ Deleted alert: ${id} from ${collectionName}`);
    }

    return allDeleted;
  } catch (error) {
    logger.error(`❌ Error deleting alerts from ${collectionName}:`, error);
    return false;
  } finally {
    kv.close();
  }
}
