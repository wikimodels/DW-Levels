import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";

export async function fetchWorkingCoins(): Promise<Coin[]> {
  try {
    const coins = await CoinOperator.getCoins();
    if (!Array.isArray(coins)) {
      console.error(
        `[CoinOperator] Unexpected data format: Expected an array.`
      );
      return [];
    }

    console.log(`[CoinOperator] Successfully fetched ${coins.length} coins.`);
    return coins;
  } catch (error) {
    console.error(`[CoinOperator] Error fetching coins:`, error);
    return [];
  }
}
