import { Alert } from "../../models/alert.ts";
import { KlineData } from "../../models/kline-data.ts";
import { UnixToTime } from "../utils/time-converter.ts";

export async function getMatchingAlerts(
  klinedata: Record<string, KlineData[]>,
  alerts: Alert[]
): Promise<Alert[]> {
  const matchedAlerts: Alert[] = [];

  for (const alert of alerts) {
    if (!alert.price || !alert.symbol || !klinedata[alert.symbol]) {
      continue;
    }
    // Add a dummy await to satisfy the async requirement
    await Promise.resolve();

    for (const kline of klinedata[alert.symbol]) {
      if (alert.price >= kline.lowPrice && alert.price <= kline.highPrice) {
        console.log(
          `price ${alert.price} high ${kline.highPrice} low ${kline.lowPrice}`
        );
        const activationTime = new Date().getTime();
        alert._id = "";
        alert.id = crypto.randomUUID();
        alert.activationTime = activationTime;
        alert.activationTimeStr = UnixToTime(activationTime);
        alert.high = kline.highPrice;
        alert.low = kline.lowPrice;
        matchedAlerts.push(alert);
      }
    }
  }

  return matchedAlerts;
}
