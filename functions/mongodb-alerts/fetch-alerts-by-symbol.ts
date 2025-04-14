import { AlertsCollection } from "../../models/alerts-collections.ts";
import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { LineAlertOperator } from "../../global/line-alert-operator.ts";
import { Alert } from "../../models/alert.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function fetchAlertsBySymbol(
  symbol: string,
  collectionName: AlertsCollection
): Promise<Alert[]> {
  const config = ConfigOperator.getConfig();
  try {
    return await LineAlertOperator.getAlertsBySymbol(symbol, collectionName);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "fetchAlertsBySymbol",
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
