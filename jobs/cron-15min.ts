import { fetchProxyKline15m } from "../functions/http/proxy-alerts-15m.ts";
import { checkKlineAgainstAlerts15m } from "../functions/mongodb-alerts/check-kline-against-alerts15m.ts";
import { checkKlineAgainstVwapAlerts15m } from "../functions/mongodb-vwap-alerts/check-kline-against-vwap-alerts15m.ts";
import { UnixToNamedTimeRu } from "../functions/utils/time-converter.ts";
import { logger } from "../global/logger.ts";
import { DColors } from "../shared/colors.ts";

export function cron15minJob() {
  Deno.cron(
    "Check Kline against Alerts 15m",
    { minute: { every: 15 } },
    async () => {
      const timeNow = UnixToNamedTimeRu(new Date().getTime());
      logger.info(`15min Job is running --> ${timeNow}`, DColors.green);
      const klineData = await fetchProxyKline15m();
      await checkKlineAgainstAlerts15m(klineData);
      await checkKlineAgainstVwapAlerts15m(klineData);
    }
  );
}
