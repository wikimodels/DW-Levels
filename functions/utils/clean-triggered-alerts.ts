import { LineAlertOperator } from "../../global/line-alert-operator.ts";
import { VwapAlertOperator } from "../../global/vwap-alert-operator.ts";

export async function cleanTriggeredAlerts(): Promise<void> {
  try {
    await LineAlertOperator.cleanTriggeredAlerts();
    await VwapAlertOperator.cleanTriggeredAlerts();
    console.log("✅ Successfully cleaned triggered alerts.");
  } catch (error) {
    console.error("❌ Failed to clean triggered alerts:", error);
  }
}
