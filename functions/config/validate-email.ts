import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";
import { AuthOperator } from "../../global/google-auth-operator.ts";

export async function validateEmail(email: string): Promise<boolean> {
  const config = ConfigOperator.getConfig();
  try {
    const data = await AuthOperator.validateEmail(email);
    return data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "validateEmail",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to validate email", reportError);
    }

    logger.error(`Error refreshing config:`, error);
    return false;
  }
}
