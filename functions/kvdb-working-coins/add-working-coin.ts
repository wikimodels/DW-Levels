import { Coin } from "../../models/coin.ts";

export async function addWorkingCoin(coin: Coin): Promise<boolean> {
  const kv = await Deno.openKv();
  const collectionName = "WorkingCoins";
  try {
    const coinKey = [collectionName, coin.symbol]; // Unique key using collectionName and alert ID
    const result = await kv.set(coinKey, coin);

    if (result.ok) {
      console.log(
        `✅ Coin added successfully to collection: ${collectionName}`
      );
    } else {
      console.error(`❌ Failed to add coin to collection: ${collectionName}`);
    }

    return result.ok;
  } catch (error) {
    console.error(`❌ Error adding alert to ${collectionName}:`, error);
    return false;
  } finally {
    kv.close();
  }
}
