import { ConfigOperator } from "./global/config-operator.ts";
import { LineAlertOperator } from "./global/line-alert-operator.ts";
import { VwapAlertOperator } from "./global/vwap-alert-operator.ts";

await ConfigOperator.initialize();
const config = ConfigOperator.getConfig();
await LineAlertOperator.initialize(config);
await LineAlertOperator.cleanTriggeredAlerts();
