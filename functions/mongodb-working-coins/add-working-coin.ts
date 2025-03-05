import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";

export async function addWorkingCoin(coin: Coin): Promise<boolean> {
  try {
    if (!coin || !coin.symbol) {
      console.error(
        `[CoinOperator] Invalid coin data: Missing required properties.`
      );
      return false;
    }

    await CoinOperator.addCoin(coin);
    console.log(`[CoinOperator] Successfully added coin: ${coin.symbol}`);
    return true;
  } catch (error) {
    console.error(`[CoinOperator] Error adding coin:`, error);
    return false;
  }
}
