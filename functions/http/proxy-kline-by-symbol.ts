import { KlineData } from "../../models/kline-data.ts";
import { TF } from "../../shared/timeframes.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function fetchProxyKlineBySymbol(
  symbol: string,
  timeframe: TF,
  limit: number
): Promise<{
  symbol: string;
  timeframe: string;
  limit: number;
  data: KlineData[];
}> {
  const config = ConfigOperator.getConfig();
  try {
    const baseUrl = config.klineApis.symbol;
    if (!baseUrl) {
      throw new Error("KLINE_BY_SYMBOL env variable is not defined");
    }

    const url = new URL(baseUrl);
    url.searchParams.append("symbol", symbol);
    url.searchParams.append("timeframe", timeframe);
    url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data: {
      symbol: string;
      timeframe: string;
      limit: number;
      data: KlineData[];
    } = await response.json();
    return data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    try {
      await sendErrorReport(
        config.projectName,
        "fetchProxyKlineBySymbol",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }

    logger.error("Failed to fetch Kline data:", error);
    return { symbol, timeframe, limit, data: [] }; // Ensure return type consistency
  }
}
