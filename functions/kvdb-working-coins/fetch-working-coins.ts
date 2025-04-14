import { Coin } from "../../models/coin.ts";

export async function fetchWorkingCoins(): Promise<Coin[]> {
  const kv = await Deno.openKv();
  const collectionName = "WorkingCoins";
  try {
    const iter = kv.list<Coin>({ prefix: [collectionName] });
    const coins: Coin[] = [];

    for await (const entry of iter) {
      coins.push(entry.value);
    }

    return coins;
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
