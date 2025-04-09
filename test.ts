import { fetchProxyCoins } from "./functions/http/proxy-coins.ts";
import { addAlertsBatch } from "./functions/mongodb-alerts/add-alerts-batch.ts";
import { AlertOperator } from "./global/alert-operator.ts";
import { AlertBase } from "./models/alert-base.ts";

const alertBases: AlertBase[] = [
  {
    symbol: "AAVEUSDT",
    price: 11,
    alertName: "AAV-1",
    action: "test",
    tvScreensUrls: ["wwww.tg.com"],
  },
  {
    symbol: "AAVEUSDT",
    price: 11,
    alertName: "AAV-2",
    action: "test",
    tvScreensUrls: ["wwww.tg.com"],
  },
  {
    symbol: "AAVEUSDT",
    price: 11,
    alertName: "AAV-3",
    action: "test",
    tvScreensUrls: ["wwww.tg.com"],
  },
  {
    symbol: "SHITUSDT",
    price: 11,
    alertName: "AAV-3",
    action: "test",
    tvScreensUrls: ["wwww.tg.com"],
  },
  {
    symbol: "PISSUSDT",
    price: 11,
    alertName: "AAV-3",
    action: "test",
    tvScreensUrls: ["wwww.tg.com"],
  },
];
await AlertOperator.initialize();
