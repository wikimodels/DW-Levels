import { Alert } from "../../../../models/alert.ts";
import { UnixToNamedTimeRu } from "../../../utils/time-converter.ts";

function formatAlertItem(alert: Alert, index: number): string {
  return `
<b>${index + 1}. <a href="${alert.tvLink}">${alert.symbol}</a> ➡️ <i>${
    alert.alertName
  }</i></b>
`;
}

function formatReportTime(): string {
  return `⏰ <b>Report Generated:</b> ${UnixToNamedTimeRu(
    new Date().getTime()
  )}`;
}

export function formatTriggeredAlertsMsg(
  projectName: string,
  alerts: Alert[]
): string {
  if (!alerts?.length) {
    return `<b>✴️ ${projectName}: NO TRIGGERED ALERTS</b>`;
  }

  const alertItems = alerts.map(formatAlertItem).join("");

  return `
<b>✴️ ${projectName}: TRIGGERED ALERTS</b>
${alertItems}
${formatReportTime()}
`.trim();
}
