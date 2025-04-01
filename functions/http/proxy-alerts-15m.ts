import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { transformKlineResponse } from "../utils/transform-kline-response.ts";
import { KlineData } from "../../models/kline-data.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

const env = await load();

export async function fetchProxyKline15m(): Promise<
  Record<string, KlineData[]>
> {
  try {
    const url = env["KLINE_15M"];
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
        env["PROJECT_NAME"],
        "fetchProxyKline15m",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }

    console.error("Failed to fetch Kline data:", error);
    return {}; // Return null so the caller knows it failed
  }
}
