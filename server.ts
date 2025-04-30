import { AuthOperator } from "./global/auth-operator.ts";
import { VwapAlertOperator } from "./global/vwap-alert-operator.ts";
import { TelegramBotOperator } from "./global/tg-bot-operator.ts";
import initializeApp from "./app/initialize-app.ts";
import { CoinOperator } from "./global/coin-operator.ts";
import { ConfigOperator } from "./global/config-operator.ts";
import { logger } from "./global/logger.ts";
import { cron15minJob } from "./jobs/cron-15min.ts";
import { DColors } from "./shared/colors.ts";
import { LineAlertOperator } from "./global/line-alert-operator.ts";
import { cronCleanTriggeredAlertsJob } from "./jobs/cron-clean-triggered-alerts.ts";

async function initializeApplication() {
  try {
    // Step 1: Initialize ConfigOperator first
    await ConfigOperator.initialize();
    const config = ConfigOperator.getConfig();
    await CoinOperator.initialize(config);
    await TelegramBotOperator.initialize(config);
    await VwapAlertOperator.initialize(config);
    await LineAlertOperator.initialize(config);
    await AuthOperator.initialize(config);

    const app = await initializeApp(config);
    app.listen({ port: 80 }, "0.0.0.0", () => {
      logger.success("Server --> started...", DColors.green);
      cron15minJob();
      cronCleanTriggeredAlertsJob();
    });
  } catch (error) {
    logger.error("Application initialization failed:", error);
    Deno.exit(1); // Exit gracefully if initialization fails
  }
}

initializeApplication();
