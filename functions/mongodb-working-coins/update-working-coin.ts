import { CoinOperator } from "../../global/coin-operator.ts";
import { Coin } from "../../models/coin.ts";

export async function updateWorkingCoin(
  filter: Partial<Coin>,
  updateData: Partial<Coin>
): Promise<boolean> {
  try {
    if (!filter || Object.keys(filter).length === 0) {
      console.error(`[CoinOperator] Invalid filter: Filter cannot be empty.`);
      return false;
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      console.error(
        `[CoinOperator] Invalid update data: No fields provided for update.`
      );
      return false;
    }

    await CoinOperator.updateCoin(filter, updateData);
    console.log(
      `[CoinOperator] Successfully updated coin(s) matching filter:`,
      filter
    );
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[CoinOperator] Failed to update coin(s)`, {
      error: err.message,
      filter: filter,
      updateData: updateData,
      stack: err.stack,
    });
    return false;
  }
}
