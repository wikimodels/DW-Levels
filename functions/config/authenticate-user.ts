import { sendErrorReport } from "../tg/notifications/send-error-report.ts";
import { logger } from "../../global/logger.ts";
import { ConfigOperator } from "../../global/config-operator.ts";
import { AuthOperator } from "../../global/auth-operator.ts";
import { UserData } from "../../models/user-data.ts";

export async function authenticateUser(token: string): Promise<UserData> {
  const config = ConfigOperator.getConfig();
  try {
    const data = await AuthOperator.authenticateUser(token);
    return data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await sendErrorReport(
        config.projectName,
        "authenticateUser",
        err.toString()
      );
    } catch (reportError) {
      logger.error("Failed to authenticate user", reportError);
    }
    logger.error(`Error refreshing config:`, error);
    return {
      isWhitelisted: false,
      givenName: "Unknown",
      familyName: "Unknown",
      email: "Unknown",
      picture: "",
    };
  }
}
