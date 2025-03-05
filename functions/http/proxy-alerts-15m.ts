import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { transformKlineResponse } from "../utils/transform-kline-response.ts";
import { KlineData } from "../../models/kline-data.ts";

const env = await load();

export async function fetchProxyKline15m(): Promise<
  Record<string, KlineData[]>
> {
  try {
    const url = env["ALERTS_15M"];
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const rowData = await response.json();
    const data = transformKlineResponse(rowData);
    return data;
  } catch (error) {
    console.error("Failed to fetch Kline data:", error);
    return {}; // Return null so the caller knows it failed
  }
}
