import { Coin } from "../../models/coin.ts";

export async function updateWorkingCoin(coin: Coin): Promise<boolean> {
  const collectionName = "WorkingCoins";
  const kv = await Deno.openKv();
  const coinKey = [collectionName, coin.symbol]; // Unique key

  try {
    // ✅ Step 1: Check if the alert exists
    const existingCoin = await kv.get<Coin>(coinKey);
    if (!existingCoin.value) {
      console.warn(`⚠️ Coin ${coin.symbol} not found in ${collectionName}`);
      return false;
    }

    // ✅ Step 2: Delete the existing alert
    await kv.delete(coinKey);
    console.log(`🗑️ Deleted existing alert: ${coin.symbol}`);

    // ✅ Step 3: Insert the new alert
    await kv.set(coinKey, coin);
    console.log(`✅ Updated alert in ${collectionName}:`, coin);

    return true;
  } catch (error) {
    console.error(`❌ Error updating alert in ${collectionName}:`, error);
    return false;
  } finally {
    kv.close();
  }
}
