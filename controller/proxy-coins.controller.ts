// deno-lint-ignore-file no-explicit-any

import { fetchProxyCoins } from "../functions/http/proxy-coins.ts";
import { refreshProxyCoins } from "../functions/http/refresh-proxy-coins.ts";

export const ProxyCoins = async (_req: any, res: any) => {
  try {
    const coins = await fetchProxyCoins();
    res.send(coins);
  } catch (error) {
    console.error("Error retrieving get1hRollingVwapData:", error);
    res
      .status(500)
      .send("An error occurred while getting get1hRollingVwapData.");
  }
};

export const getProxyCoins = async (_req: any, res: any) => {
  try {
    const coins = await fetchProxyCoins();
    res.send(coins);
  } catch (error) {
    console.error("Error retrieving get1hRollingVwapData:", error);
    res
      .status(500)
      .send("An error occurred while getting get1hRollingVwapData.");
  }
};

export const updateProxyCoins = async (_req: any, res: any) => {
  try {
    const coins = await refreshProxyCoins();
    res.send(coins);
  } catch (error) {
    console.error("Error retrieving get1hRollingVwapData:", error);
    res
      .status(500)
      .send("An error occurred while getting get1hRollingVwapData.");
  }
};
