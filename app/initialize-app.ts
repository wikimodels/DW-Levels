import express, { Application } from "npm:express@4.18.2";
import cors from "npm:cors";

import proxyCoins from "../routes/proxy-coins.route.ts";
import coins from "../routes/working-coins.route.ts";
import alerts from "../routes/alerts.route.ts";
import proxyKline from "../routes/proxy-kline.route.ts";
import vwapAlerts from "../routes/vwap-alerts.route.ts";
import general from "../routes/general.route.ts";
import { Config } from "../models/config.ts";

const initializeApp = (config: Config): Promise<Application> => {
  const allowedOrigins = config.origins;

  if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
    throw new Error("No valid origins found in the configuration");
  }
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: [...allowedOrigins.filter(Boolean)], // Ensure no falsy values
    })
  );
  app.use("/api", proxyCoins);
  app.use("/api", proxyKline);
  app.use("/api", coins);
  app.use("/api", alerts);
  app.use("/api", vwapAlerts);
  app.use("/api", general);

  return app;
};

export default initializeApp;
