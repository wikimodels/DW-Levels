import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { CoinOperator } from "../../global/coin-operator.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "deleteWorkingCoins",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(`[CoinOperator] Failed to delete ${symbols.length} coins`, {
      error: err.message,
      symbols: symbols,
      stack: err.stack,
    });
    return false;
  }
}
