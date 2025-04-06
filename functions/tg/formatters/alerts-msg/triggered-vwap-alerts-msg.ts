import { VwapAlert } from "../../../../models/vwap-alert.ts";
import { UnixToNamedTimeRu } from "../../../utils/time-converter.ts";

function formatVwapAlertItem(alert: VwapAlert, index: number): string {
  return `
<b>${index + 1}.  ${alert.tvLink}">${alert.symbol}/<i>${
    alert.anchorTimeStr
  }</i></b>
`;
}

function formatReportTime(): string {
  return `⏰ <b>VWAP Report Generated:</b> ${UnixToNamedTimeRu(
    new Date().getTime()
  )}`;
}

export function formatTriggeredVwapAlertsMsg(
  projectName: string,
  alerts: VwapAlert[]
): string {
  if (!alerts?.length) {
    return `<b>✴️ ${projectName}: NO TRIGGERED ALERTS</b>`;
  }

  const alertItems = alerts.map(formatVwapAlertItem).join("");

  return `
<b>✴️ ${projectName}: TRIGGERED VWAP ALERTS</b>
${alertItems}
${formatReportTime()}
`.trim();
}
