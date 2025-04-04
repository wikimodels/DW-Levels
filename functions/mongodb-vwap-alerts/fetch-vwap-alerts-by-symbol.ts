import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";

export async function fetchVwapAlertsBySymbol(
  symbol: string,
  collectionName: AlertsCollection
): Promise<VwapAlert[]> {
  try {
    return await VwapAlertOperator.getVwapAlertsBySymbol(
      symbol,
      collectionName
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "fetchVwapAlertsBySymbol",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(`Failed to fetch alerts from ${collectionName}`, {
      error: err.message,
      collection: collectionName,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    throw new Error(
      `Failed to fetch alerts from ${collectionName}: ${err.message}`
    );
  }
}
