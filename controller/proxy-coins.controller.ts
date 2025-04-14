// deno-lint-ignore-file no-explicit-any

import { fetchProxyCoins } from "../functions/http/proxy-coins.ts";
import { refreshProxyCoins } from "../functions/http/refresh-proxy-coins.ts";
import { logger } from "../global/logger.ts";

export const proxyCoinsController = async (_req: any, res: any) => {
  try {
    const coins = await fetchProxyCoins();
    res.send(coins);
  } catch (error) {
    logger.error("Error retrieving get1hRollingVwapData:", error);
    res.status(500).send("Error in proxyCoinsController");
  }
};

export const getProxyCoinsController = async (_req: any, res: any) => {
  try {
    const coins = await fetchProxyCoins();
    res.send(coins);
  } catch (error) {
    logger.error("Error retrieving get1hRollingVwapData:", error);
    res.status(500).send("Error in getProxyCoinsController");
  }
};

export const updateProxyCoinsController = async (_req: any, res: any) => {
  try {
    const coins = await refreshProxyCoins();
    res.send(coins);
  } catch (error) {
    logger.error("Error retrieving get1hRollingVwapData:", error);
    res.status(500).send("Error in updateProxyCoinsController");
  }
};
