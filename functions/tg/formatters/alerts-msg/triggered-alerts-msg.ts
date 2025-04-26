import { ConfigOperator } from "../../../../global/config-operator.ts";
import { Alert } from "../../../../models/alert.ts";
import { getTradingViewLink } from "../../../utils/get-tv-link.ts";
import { UnixToNamedTimeRu } from "../../../utils/time-converter.ts";

function formatAlertItem(alert: Alert, index: number): string {
  const tvLink = getTradingViewLink(alert.symbol, alert.exchanges || []);
  return `<a href="${tvLink}"><b>${index + 1}. <i>${
    alert.alertName
  }</i></b></a>`;
}

function formatReportTime(): string {
  const config = ConfigOperator.getConfig();
  const currentTime = UnixToNamedTimeRu(Date.now() + 3 * 60 * 60 * 1000);
  return `${currentTime}  <a href="${config.alerts_mobile}" title="View Alerts on Mobile">🈸🈸🈸</a>`;
}

export function formatTriggeredAlertsMsg(
  projectName: string,
  alerts: Alert[]
): string {
  if (!alerts?.length) {
    return `<b>✴️ ${projectName}: NO TRIGGERED ALERTS</b>`;
  }

  const alertItems = alerts.map(formatAlertItem).join("\n");

  return `
<b>✴️ LINE ALERTS</b>
${alertItems}
${formatReportTime()}
`.trim();
}
