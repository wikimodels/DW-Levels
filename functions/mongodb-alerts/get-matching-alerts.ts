import { Alert } from "../../models/alert.ts";
import { KlineData } from "../../models/kline-data.ts";
import { UnixToTime } from "../utils/time-converter.ts";

export async function getMatchingAlerts(
  klinedata: Record<string, KlineData[]>,
  alerts: Alert[]
): Promise<Alert[]> {
  const matchedAlerts: Alert[] = [];

  for (const alert of alerts) {
    // Skip invalid alerts
    if (!alert.price || !alert.symbol || !klinedata[alert.symbol]) {
      continue;
    }

    // Get kline data for the alert's symbol
    const klineData = klinedata[alert.symbol];

    // Use only the last kline
    const lastKline = klineData[klineData.length - 1];
    if (!lastKline) {
      continue; // No kline data available
    }

    // Check if the alert's price matches the last kline's range
    if (
      alert.price >= lastKline.lowPrice &&
      alert.price <= lastKline.highPrice
    ) {
      // Calculate activation time (add 3 hours)
      const activationTime = new Date().getTime() + 3 * 60 * 60 * 1000;

      // Create a new alert object to avoid mutating the original
      const matchedAlert: Alert = {
        ...alert,
        _id: "", // Reset ID
        id: crypto.randomUUID(), // Generate a unique ID
        activationTime: activationTime, // Set activation timestamp
        activationTimeStr: UnixToTime(activationTime), // Convert to human-readable format
        high: lastKline.highPrice, // Add high price
        low: lastKline.lowPrice, // Add low price
      };

      // Add the matched alert to the results
      matchedAlerts.push(matchedAlert);
    }
  }

  return matchedAlerts;
}
