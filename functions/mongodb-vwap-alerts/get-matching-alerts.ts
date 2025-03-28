import { KlineData } from "../../models/kline-data.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";
import { UnixToTime } from "../utils/time-converter.ts";

export function getMatchingVwapAlerts(
  klinedata: Record<string, KlineData[]>,
  alerts: VwapAlert[]
) {
  try {
    const matchedAlerts: VwapAlert[] = [];

    for (const vwapAlert of alerts) {
      if (
        !vwapAlert.price ||
        !vwapAlert.symbol ||
        !klinedata[vwapAlert.symbol]
      ) {
        continue;
      }

      for (const kline of klinedata[vwapAlert.symbol]) {
        if (
          vwapAlert.price >= kline.lowPrice &&
          vwapAlert.price <= kline.highPrice
        ) {
          console.log(
            `price ${vwapAlert.price} high ${kline.highPrice} low ${kline.lowPrice}`
          );
          const activationTime = new Date().getTime();
          vwapAlert._id = "";
          vwapAlert.id = crypto.randomUUID();
          vwapAlert.activationTime = activationTime;
          vwapAlert.activationTimeStr = UnixToTime(activationTime);
          vwapAlert.high = kline.highPrice;
          vwapAlert.low = kline.lowPrice;
          matchedAlerts.push(vwapAlert);
        }
      }
    }

    return matchedAlerts;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to match alerts against kline data", {
      error: err.message,
      alertCount: alerts.length,
      symbolCount: Object.keys(klinedata).length,
      stack: err.stack,
    });
    return [];
  }
}
