import { AlertsCollection } from "../../models/alerts-collections.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";
import { ConfigOperator } from "../../global/config-operator.ts";
import { logger } from "../../global/logger.ts";

export async function fetchVwapAlertsBySymbol(
  symbol: string,
  collectionName: AlertsCollection
): Promise<VwapAlert[]> {
  const config = ConfigOperator.getConfig();
  try {
    return await VwapAlertOperator.getVwapAlertsBySymbol(
      symbol,
      collectionName
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "fetchVwapAlertsBySymbol",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to send error report:", reportError);
    }
    logger.error(`Failed to fetch alerts from ${collectionName}`, {
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
