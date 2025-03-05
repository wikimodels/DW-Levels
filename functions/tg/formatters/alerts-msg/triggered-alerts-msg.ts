import { Alert } from "../../../../models/alert.ts";
import { UnixToNamedTimeRu } from "../../../utils/time-converter.ts";

export function formatTriggeredAlertsMsg(projectName: string, alerts: Alert[]) {
  let msg = `<b>✴️ ${projectName}: TRIGGERED ALERTS</b>\n`;
  alerts.forEach((a, index) => {
    msg += `
<b>${index + 1}. <a href="${a.tvLink}">${a.symbol}</a> ➡️ <i>${
      a.alertName
    }</i></b>
`;
  });

  msg += `
⏰ <b>Report Generated:</b> ${UnixToNamedTimeRu(new Date().getTime())}
`;

  return msg;
}
