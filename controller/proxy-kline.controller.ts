// deno-lint-ignore-file no-explicit-any

import { fetchProxyKlineBySymbol } from "../functions/http/proxy-kline-by-symbol.ts";
import { logger } from "../global/logger.ts";

export const getProxyKlineBySymbolController = async (req: any, res: any) => {
  try {
    const symbol = req.query.symbol;
    const timeframe = req.query.timeframe;
    const limit = req.query.limit;

    const data = await fetchProxyKlineBySymbol(symbol, timeframe, limit);

    res.send(data);
  } catch (error) {
    logger.error("Error retrieving get1hRollingVwapData:", error);
    res.status(500).send("Error in getProxyKlineBySymbolController");
  }
};
