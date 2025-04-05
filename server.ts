import { Application } from "npm:express@4.18.2";
import initializeApp from "./app/initialize-app.ts";
import { DColors } from "./shared/colors.ts";
import { cron15minJob } from "./jobs/cron-15min.ts";

import initializeCoinOperator from "./app/initialize-coin-operator.ts";
import { AlertOperator } from "./global/alert-operator.ts";

import initializeVwapAlertOperator from "./app/initialize-vwap-alert-operator.ts";
import initializeAlertOperator from "./app/initialize-alert-operator.ts";

initializeCoinOperator()
  .then(() => initializeVwapAlertOperator())
  .then(() => initializeAlertOperator())
  .then(() => initializeApp())
  .then((app: Application) => {
    app.listen({ port: 80 }, "0.0.0.0", async () => {
      console.log("%cServer --> running...", DColors.green);
      cron15minJob();
    });
  });
