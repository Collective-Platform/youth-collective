import { NextResponse } from "next/server";

import {
  dispatchNotificationDelivery,
  enqueueSessionReminders,
  listPendingNotificationDeliveryIds,
} from "../../../../lib/notifications/email";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Vercel Cron invokes this hourly. It adds 24-hour reminders, then drains
 * queued/retryable transactional email without exposing a public mail relay.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reminderIds = await enqueueSessionReminders();
  const pendingIds = await listPendingNotificationDeliveryIds();
  const deliveryIds = [...new Set([...reminderIds, ...pendingIds])];
  const outcomes = await Promise.all(deliveryIds.map(dispatchNotificationDelivery));

  return NextResponse.json({
    queued: deliveryIds.length,
    sent: outcomes.filter((outcome) => outcome === "sent").length,
    failed: outcomes.filter((outcome) => outcome === "failed").length,
  });
}
