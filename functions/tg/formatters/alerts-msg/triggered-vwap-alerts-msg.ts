import { ConfigOperator } from "../../../../global/config-operator.ts";
import { VwapAlert } from "../../../../models/vwap-alert.ts";
import { getTradingViewLink } from "../../../utils/get-tv-link.ts";
import { UnixToNamedTimeRu } from "../../../utils/time-converter.ts";

function formatVwapAlertItem(alert: VwapAlert, index: number): string {
  const tvLink = getTradingViewLink(alert.symbol, alert.exchanges || []);
  return `<a href="${tvLink}"><b>${index + 1}. ${alert.symbol}/<i>${
    alert.anchorTimeStr
  }</i></b></a>`;
}

function formatReportTime(): string {
  const config = ConfigOperator.getConfig();
  const currentTime = UnixToNamedTimeRu(Date.now() + 3 * 60 * 60 * 1000);
  return `${currentTime}  <a href="${config.alerts_mobile}" title="View Alerts on Mobile">🈯️🈯️🈯️</a>`;
}

export function formatTriggeredVwapAlertsMsg(
  projectName: string,
  alerts: VwapAlert[]
): string {
  if (!alerts?.length) {
    return `<b>✴️ ${projectName}: NO TRIGGERED ALERTS</b>`;
  }

  const alertItems = alerts.map(formatVwapAlertItem).join("\n");

  return `
<b>💹 VWAP ALERTS</b>
${alertItems}
${formatReportTime()}
`.trim();
}
