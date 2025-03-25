// deno-lint-ignore-file no-explicit-any

import { fetchProxyKlineBySymbol } from "../functions/http/proxy-kline-by-symbol.ts";

export const getProxyKlineBySymbol = async (req: any, res: any) => {
  try {
    const symbol = req.query.symbol;
    const timeframe = req.query.timeframe;
    const limit = req.query.limit;

    const data = await fetchProxyKlineBySymbol(symbol, timeframe, limit);

    res.send(data);
  } catch (error) {
    console.error("Error retrieving get1hRollingVwapData:", error);
    res
      .status(500)
      .send("An error occurred while getting get1hRollingVwapData.");
  }
};
