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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[CoinOperator] Failed to add ${coins.length} coins`, {
      error: err.message,
      failedCoins: coins.map((c) => c.symbol),
      stack: err.stack,
    });
    return false;
  }
}
