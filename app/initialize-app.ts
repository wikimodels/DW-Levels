// deno-lint-ignore-file require-await
import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import express, { Application } from "npm:express@4.18.2";
import cors from "npm:cors";

import proxyCoins from "../routes/proxy-coins.route.ts";
import coins from "../routes/working-coins.route.ts";
import alerts from "../routes/alerts.route.ts";
import proxyKline from "../routes/proxy-kline.route.ts";
import vwapAlerts from "../routes/vwap-alerts.route.ts";

const { ORIGIN_I, ORIGIN_II, ORIGIN_III } = await load();
const allowedOrigins = [ORIGIN_I, ORIGIN_II, ORIGIN_III];

const initializeApp = async (): Promise<Application> => {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: allowedOrigins,
    })
  );
  app.use("/api", proxyCoins);
  app.use("/api", proxyKline);
  app.use("/api", coins);
  app.use("/api", alerts);
  app.use("/api", vwapAlerts);

  return app;
};

export default initializeApp;
