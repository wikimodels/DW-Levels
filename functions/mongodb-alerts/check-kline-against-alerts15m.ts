import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendTriggeredAlertsReport } from "../tg/notifications/send-triggered-alerts-report.ts";
import { fetchAlerts } from "./fetch-alerts.ts";
import { getMatchingAlerts } from "./get-matching-alerts.ts";
import { addManyAlerts } from "./add-many-alerts.ts";
import { KlineData } from "../../models/kline-data.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";

export async function checkKlineAgainstAlerts15m(
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

    const alerts = (await fetchAlerts(AlertsCollection.WorkingAlerts)).filter(
      (a) => a.isActive
    );
    //TODO
    console.log("Alerts fetched", alerts.length);
    if (!alerts || alerts.length === 0) {
      console.warn("No alerts found.");
      return;
    }

    const matchingAlerts = await getMatchingAlerts(klineData, alerts);
    if (matchingAlerts.length === 0) {
      console.info("No matching alerts found.");
      return;
    }
    console.log(matchingAlerts);
    await addManyAlerts(AlertsCollection.TriggeredAlerts, matchingAlerts);

    setTimeout(async () => {
      await sendTriggeredAlertsReport(projectName, matchingAlerts);
    }, 10 * 1000);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      const env = await load();
      await sendErrorReport(
        env["PROJECT_NAME"],
        "checkKlineAgainstAlerts15m",
        err.toString()
      );
    } catch (reportError) {
      console.error("Failed to send error report:", reportError);
    }
    console.error("Error in checkKlineAgainstAlerts15m:", error);
  }
}
