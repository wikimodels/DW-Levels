import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { fetchProxyKline15m } from "../http/proxy-alerts-15m.ts";
import { sendTriggeredAlertsReport } from "../tg/notifications/send-triggered-alerts-report.ts";
import { fetchAlerts } from "./fetch-alerts.ts";
import { getMatchingAlerts } from "./get-matching-alerts.ts";

export async function checkKlineAgainstAlerts15m() {
  try {
    const env = await load();
    const projectName = env["PROJECT_NAME"];

    if (!projectName) {
      throw new Error("Missing environment variable: PROJECT_NAME");
    }

    const klineData = await fetchProxyKline15m();
    if (!klineData || Object.keys(klineData).length === 0) {
      throw new Error("Failed to fetch Kline data or received empty data.");
    }

    const alerts = (await fetchAlerts(AlertsCollection.WorkingAlerts)).filter(
      (a) => a.isActive
    );

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
    await sendTriggeredAlertsReport(projectName, matchingAlerts);
  } catch (error) {
    console.error("Error in checkKlineAgainstAlerts15m:", error);
  }
}
