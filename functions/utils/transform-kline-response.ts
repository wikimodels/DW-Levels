import { KlineData } from "../../models/kline-data.ts";

export function transformKlineResponse(
  response: Record<string, any[]>
): Record<string, KlineData[]> {
  const result: Record<string, KlineData[]> = {};

  // Extract the timeframe key dynamically (e.g., "klines15min", "klines1h", "klines4h")
  const timeframeKey = Object.keys(response)[0];
  if (!timeframeKey || !Array.isArray(response[timeframeKey])) {
    throw new Error("Invalid response format");
  }

  response[timeframeKey].forEach((item) => {
    if (item.symbol && Array.isArray(item.klineData)) {
      result[item.symbol] = item.klineData;
    }
  });

  return result;
}
