import { Coin } from "../../models/coin.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function refreshProxyCoins(): Promise<Coin[]> {
  const config = ConfigOperator.getConfig();
  try {
    const url = config.coinsStoreApi;

    if (!url) {
      throw new Error("COINS environment variable is missing.");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.coins;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "refreshProxyCoins",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error("Failed to fetch Kline data:", error);
    return [];
  }
}
