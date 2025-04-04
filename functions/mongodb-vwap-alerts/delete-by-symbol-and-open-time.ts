import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function deleteBySymbolAndOpenTime(
  symbol: string,
  collectionName: AlertsCollection,
  openTime?: number
): Promise<boolean> {
  try {
    // Attempt to remove the alerts using AlertOperator
    await VwapAlertOperator.removeBySymbolAndOpenTime(
      symbol,
      collectionName,
      openTime
    );
    console.log(`✅ Successfully deleted  alerts from ${collectionName}`);
    return true; // Return true on success
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "deleteBySymbolAndOpenTime",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error(`Failed to delete   alerts from ${collectionName}`, {
      error: err.message,
      collection: collectionName,
      symbol: symbol,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}
