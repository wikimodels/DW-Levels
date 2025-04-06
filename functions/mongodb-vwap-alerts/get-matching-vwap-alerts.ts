import { KlineData } from "../../models/kline-data.ts";
import { VwapAlert } from "../../models/vwap-alert.ts";
import { UnixToTime } from "../utils/time-converter.ts";

export function getMatchingVwapAlerts(
  klinedata: Record<string, KlineData[]>,
  alerts: VwapAlert[]
): VwapAlert[] {
  const triggeredAlerts: VwapAlert[] = [];

  try {
    for (const vwapAlert of alerts) {
      // Skip invalid alerts
      if (
        !vwapAlert.anchorTime ||
        !vwapAlert.symbol ||
        !klinedata[vwapAlert.symbol]
      ) {
        continue;
      }

      const klineData = klinedata[vwapAlert.symbol];

      // Get the last kline's openTime
      const lastKline = klineData[klineData.length - 1];
      if (!lastKline) {
        continue; // No kline data available
      }

      // Filter kline data to include only entries between anchorTime and lastKline.openTime
      const filteredKlines = klineData.filter(
        (kline) =>
          kline.openTime >= vwapAlert.anchorTime! &&
          kline.openTime <= lastKline.openTime
      );

      if (filteredKlines.length === 0) {
        continue; // No kline data in the specified range
      }

      // Calculate anchored VWAP
      let cumulativePriceVolume = 0;
      let cumulativeVolume = 0;

      for (const kline of filteredKlines) {
        const typicalPrice =
          (kline.highPrice + kline.lowPrice + kline.closePrice) / 3;
        const priceVolume = typicalPrice * kline.baseVolume;

        cumulativePriceVolume += priceVolume;
        cumulativeVolume += kline.baseVolume;
      }

      const vwap = cumulativePriceVolume / cumulativeVolume;

      // Check if VWAP is within the latest kline's high and low price range
      if (vwap > lastKline.lowPrice && vwap < lastKline.highPrice) {
        const activationTime = new Date().getTime() + 3 * 60 * 60 * 1000;
        // Create a triggered alert
        vwapAlert._id = "";
        vwapAlert.id = crypto.randomUUID();
        vwapAlert.activationTime = activationTime;
        vwapAlert.activationTimeStr = UnixToTime(activationTime);
        vwapAlert.high = lastKline.highPrice;
        vwapAlert.low = lastKline.lowPrice;
        vwapAlert.anchorPrice = vwap;
        triggeredAlerts.push(vwapAlert);
      }
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to match alerts against kline data", {
      error: err.message,
      alertCount: alerts.length,
      symbolCount: Object.keys(klinedata).length,
      stack: err.stack,
    });
  }

  return triggeredAlerts;
}
