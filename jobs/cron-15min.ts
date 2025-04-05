import { fetchProxyKline15m } from "../functions/http/proxy-alerts-15m.ts";
import { checkKlineAgainstAlerts15m } from "../functions/mongodb-alerts/check-kline-against-alerts15m.ts";
import { checkKlineAgainstVwapAlerts15m } from "../functions/mongodb-vwap-alerts/check-kline-against-vwap-alerts15m.ts";
import { UnixToNamedTimeRu } from "../functions/utils/time-converter.ts";

export function cron15minJob() {
  Deno.cron(
    "Check Kline against Alerts 15m",
    { minute: { every: 15 } },
    async () => {
      const timeNow = UnixToNamedTimeRu(new Date().getTime());
      console.log(`Job is running --> ${timeNow}`);
      const klineData = await fetchProxyKline15m();
      await checkKlineAgainstAlerts15m(klineData);
      await checkKlineAgainstVwapAlerts15m(klineData);
    }
  );
}
