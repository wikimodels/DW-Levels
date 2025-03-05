import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";

export async function addManyWorkingCoins(coins: Coin[]): Promise<boolean> {
  try {
    if (!coins) {
      console.error(
        `[CoinOperator] Invalid coins data: Missing required properties.`
      );
      return false;
    }

    await CoinOperator.addManyCoins(coins);
    console.log(`[CoinOperator] Successfully added coins: ${coins.length}`);
    return true;
  } catch (error) {
    console.error(`[CoinOperator] Error adding coin:`, error);
    return false;
  }
}
