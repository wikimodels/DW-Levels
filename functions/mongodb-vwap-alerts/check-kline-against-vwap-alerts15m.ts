import { DColors } from "./../../shared/colors.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { fetchVwapAlerts } from "./fetch-vwap-alerts.ts";
import { addManyVwapAlerts } from "./add-many-vwap-alerts.ts";
import { getMatchingVwapAlerts } from "./get-matching-vwap-alerts.ts";
import { sendTriggeredVwapAlertsReport } from "../tg/notifications/send-triggered-vwap-alerts-report.ts";
import { KlineData } from "../../models/kline-data.ts";
import { removeDuplicateSymbols } from "../utils/remove-dubplicate-symbols.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function checkKlineAgainstVwapAlerts15m(
  klineData: Record<symbol, KlineData[]>
) {
  const config = ConfigOperator.getConfig();

  try {
    const projectName = config.projectName;
    if (!projectName) {
      throw new Error("Missing environment variable: PROJECT_NAME");
    }
    if (!klineData || Object.keys(klineData).length === 0) {
      throw new Error("Failed to fetch Kline data or received empty data.");
    }

    const alerts = (
      await fetchVwapAlerts(AlertsCollection.WorkingAlerts)
    ).filter((a) => a.isActive);

    if (!alerts || alerts.length === 0) {
      logger.info("No alerts found.", DColors.yellow);
      return;
    }

    let matchingAlerts = await getMatchingVwapAlerts(klineData, alerts);
    if (matchingAlerts.length === 0) {
      logger.info("No matching alerts found.", DColors.yellow);
      return;
    }
    matchingAlerts = removeDuplicateSymbols(matchingAlerts);

    await addManyVwapAlerts(AlertsCollection.TriggeredAlerts, matchingAlerts);
    await sendTriggeredVwapAlertsReport(projectName, matchingAlerts);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "checkKlineAgainstVwapAlerts15m",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error("Failed to check kline against alerts", {
      error: err.message,
      operation: "15m kline check",
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    // Re-throw to ensure the error propagates
    throw err;
  }
}
