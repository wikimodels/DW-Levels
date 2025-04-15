import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";

export async function refreashConfig(): Promise<{
  success: boolean;
  message: string;
  error?: unknown;
}> {
  const config = ConfigOperator.getConfig();
  try {
    await ConfigOperator.reloadConfig();
    return { success: true, message: "Config reloaded successfully." };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "refreashConfig",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to refresh config", reportError);
    }
    logger.error(`Error refreshing config:`, error);
    return { success: false, message: "Failed refreshing config.", error };
  }
}
