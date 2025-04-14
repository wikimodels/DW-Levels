export async function deleteWorkingCoins(symbols: string[]): Promise<boolean> {
  const collectionName = "WorkingCoins";
  const kv = await Deno.openKv();

  try {
    let allDeleted = true;

    for (const symbol of symbols) {
      const coinKey = [collectionName, symbol];

      // ✅ Check if the alert exists
      const existingCoin = await kv.get(coinKey);
      if (!existingCoin.value) {
        console.warn(
          `⚠️ Alert with symbol ${symbol} not found in ${collectionName}`
        );
        allDeleted = false;
        continue;
      }

      // ✅ Delete the alert
      await kv.delete(coinKey);
      console.log(`🗑️ Deleted alert: ${symbol} from ${collectionName}`);
    }

    return allDeleted;
  } catch (error) {
    logger.error(`❌ Error deleting alerts from ${collectionName}:`, error);
    return false;
  } finally {
    kv.close();
  }
}
