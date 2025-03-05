import { CoinOperator } from "../../global/coin-operator.ts";

export async function deleteWorkingCoins(symbols: string[]): Promise<boolean> {
  try {
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      console.error(
        `[CoinOperator] Invalid input: Symbols array is empty or not provided.`
      );
      return false;
    }

    await CoinOperator.removeCoins(symbols);
    console.log(
      `[CoinOperator] Successfully removed coins: ${symbols.join(", ")}`
    );
    return true;
  } catch (error) {
    console.error(`[CoinOperator] Error removing coins:`, error);
    return false;
  }
}
