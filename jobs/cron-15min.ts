import { checkKlineAgainstAlerts15m } from "../functions/mongodb-alerts/check-kline-against-alerts15m.ts";
import { UnixToNamedTimeRu } from "../functions/utils/time-converter.ts";

export function cron15minJob() {
  Deno.cron(
    "Check Kline against Alerts 15m",
    { minute: { every: 1 } },
    async () => {
      const timeNow = UnixToNamedTimeRu(new Date().getTime());
      console.log(`Job is running --> ${timeNow}`);
      await checkKlineAgainstAlerts15m();
    }
  );
}
