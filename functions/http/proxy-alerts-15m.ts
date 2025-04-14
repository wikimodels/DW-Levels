import { transformKlineResponse } from "../utils/transform-kline-response.ts";
import { KlineData } from "../../models/kline-data.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function fetchProxyKline15m(): Promise<
  Record<string, KlineData[]>
> {
  const config = ConfigOperator.getConfig();
  try {
    const url = config.klineApis.m15;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const rowData = await response.json();
    const data = transformKlineResponse(rowData);
    return data;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    try {
      await sendErrorReport(
        config.projectName,
        "fetchProxyKline15m",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }

    logger.error("Failed to fetch Kline data:", error);
    return {}; // Return null so the caller knows it failed
  }
}
