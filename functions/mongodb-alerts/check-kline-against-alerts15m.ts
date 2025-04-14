import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendTriggeredAlertsReport } from "../tg/notifications/send-triggered-alerts-report.ts";
import { fetchAlerts } from "./fetch-alerts.ts";
import { getMatchingAlerts } from "./get-matching-alerts.ts";
import { addManyAlerts } from "./add-many-alerts.ts";
import { KlineData } from "../../models/kline-data.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { DColors } from "../../shared/colors.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function checkKlineAgainstAlerts15m(
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

    const alerts = (await fetchAlerts(AlertsCollection.WorkingAlerts)).filter(
      (a) => a.isActive
    );

    if (!alerts || alerts.length === 0) {
      logger.info("No alerts found.", DColors.yellow);
      return;
    }

    const matchingAlerts = await getMatchingAlerts(klineData, alerts);
    if (matchingAlerts.length === 0) {
      logger.info("No alerts found.", DColors.yellow);
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
      const config = await ConfigOperator.getConfig();
      await sendErrorReport(
        config.projectName,
        "checkKlineAgainstAlerts15m",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error("Error in checkKlineAgainstAlerts15m:", error);
  }
}
