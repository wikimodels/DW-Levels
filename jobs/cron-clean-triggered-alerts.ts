import { cleanTriggeredAlerts } from "../functions/utils/clean-triggered-alerts.ts";
import { UnixToNamedTimeRu } from "../functions/utils/time-converter.ts";
import { logger } from "../global/logger.ts";
import { DColors } from "../shared/colors.ts";

export function cronCleanTriggeredAlertsJob() {
  Deno.cron("Cleaning Triggered Alerts", { hour: { every: 2 } }, async () => {
    const timeNow = UnixToNamedTimeRu(new Date().getTime());
    logger.info(
      `Cleaning Triggered Alerts Job is running --> ${timeNow}`,
      DColors.green
    );
    await cleanTriggeredAlerts();
  });
}
