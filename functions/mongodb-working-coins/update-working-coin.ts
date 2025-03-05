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
  } catch (error) {
    console.error(`[CoinOperator] Error updating coin(s):`, error);
    return false;
  }
}
