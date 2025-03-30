import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";

import { fetchVwapAlerts } from "./fetch-vwap-alerts.ts";
import { addManyVwapAlerts } from "./add-many-vwap-alerts.ts";
import { getMatchingVwapAlerts } from "./get-matching-vwap-alerts.ts";
import { sendTriggeredVwapAlertsReport } from "../tg/notifications/send-triggered-vwap-alerts-report.ts";
import { KlineData } from "../../models/kline-data.ts";
import { removeDuplicateSymbols } from "../utils/remove-dubplicate-symbols.ts";

export async function checkKlineAgainstVwapAlerts15m(
  klineData: Record<symbol, KlineData[]>
) {
  try {
    const env = await load();
    const projectName = env["PROJECT_NAME"];

    if (!projectName) {
      throw new Error("Missing environment variable: PROJECT_NAME");
    }

    if (!klineData || Object.keys(klineData).length === 0) {
      throw new Error("Failed to fetch Kline data or received empty data.");
    }

    const alerts = (
      await fetchVwapAlerts(AlertsCollection.WorkingAlerts)
    ).filter((a) => a.isActive);
    //TODO
    console.log("VwapAlerts fetched", alerts.length);
    if (!alerts || alerts.length === 0) {
      console.warn("No alerts found.");
      return;
    }

    let matchingAlerts = await getMatchingVwapAlerts(klineData, alerts);
    if (matchingAlerts.length === 0) {
      console.info("No matching alerts found.");
      return;
    }
    matchingAlerts = removeDuplicateSymbols(matchingAlerts);

    await addManyVwapAlerts(AlertsCollection.TriggeredAlerts, matchingAlerts);
    await sendTriggeredVwapAlertsReport(projectName, matchingAlerts);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to check kline against alerts", {
      error: err.message,
      operation: "15m kline check",
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    // Re-throw to ensure the error propagates
    throw err;
  }
}
