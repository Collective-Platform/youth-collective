import CheckInControl from "./CheckInControl";
import EmailOtpForm from "../../dashboard/EmailOtpForm";
import ProfileForm from "../../dashboard/ProfileForm";
import { getCurrentUser } from "../../../lib/auth/user";
import { getSessionForCheckInToken } from "../../../lib/db/repositories/check-in";
import { findPersonProfileForUserAccount } from "../../../lib/db/repositories/people";
import { SESSION_TIME_ZONE } from "../../../lib/session-time";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: SESSION_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: SESSION_TIME_ZONE,
});

/**
 * THESIS: A QR scan should turn into one calm, unmistakable confirmation — never a roster or a menu.
 * OWN-WORLD: Strictly Students’ black field, lime pulse of readiness, purple time marker, and human-scale display type.
 * STORY: A member confirms they are in the right Session, signs in only if needed, and checks in exactly once.
 * FIRST VIEWPORT: The Session name and time sit above one full-width action, making the next physical move immediate.
 * FORM: Focused check-in ticket extending the existing member-booking interface.
 */
export default async function CheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getSessionForCheckInToken(token);
  if (!session) {
    return <main className="flex min-h-screen items-center bg-[#f7f6f1] px-5 py-10"><section className="mx-auto w-full max-w-xl rounded-2xl bg-black px-7 py-10 text-center text-white shadow-[10px_10px_0_#c1fe01]"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#c1fe01]">Check-in</p><h1 className="mt-4 font-heading text-5xl leading-[0.9] tracking-[-0.045em]">This check-in link isn&apos;t valid.</h1><p className="mt-5 text-white/70">Please scan the Session QR again, or ask a team member if you&apos;re unsure.</p></section></main>;
  }

  const returnTo = `/check-in/${token}`;
  const user = await getCurrentUser();
  const profile = user ? await findPersonProfileForUserAccount(user.id) : null;
  const windowText = session.checkInOpensAt && session.checkInClosesAt
    ? `Check-in is open ${timeFormatter.format(session.checkInOpensAt)}–${timeFormatter.format(session.checkInClosesAt)}.`
    : "Check-in timing has not been configured yet.";

  return (
    <main className="flex min-h-screen items-center bg-[#f7f6f1] px-5 py-10">
      <section className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-black text-white shadow-[10px_10px_0_#c1fe01]">
        <div className="bg-[#5038e1] px-7 py-5 text-sm font-bold uppercase tracking-[0.16em]">Session check-in</div>
        <div className="px-7 py-10 md:px-10 md:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#c1fe01]">You’re in the right place</p>
          <h1 className="mt-4 font-heading text-5xl leading-[0.9] tracking-[-0.045em] md:text-6xl">{session.className}</h1>
          <p className="mt-6 text-lg font-semibold leading-7 text-white/75">{dateFormatter.format(session.startsAt)} · {timeFormatter.format(session.startsAt)}–{timeFormatter.format(session.endsAt)}{session.location ? ` · ${session.location}` : ""}</p>
          <p className="mt-3 text-sm font-semibold text-white/65">{windowText}</p>

          {!user ? <div className="mt-8 rounded-xl bg-white p-5 text-black"><p className="font-bold">Sign in to check in.</p><EmailOtpForm returnTo={returnTo} /></div> : null}
          {user && !profile ? <div className="mt-8 rounded-xl bg-[#c1fe01] p-5 text-black"><p className="font-bold">Add your booking details first.</p><ProfileForm next={returnTo} /></div> : null}
          {profile ? <CheckInControl token={token} /> : null}
        </div>
      </section>
    </main>
  );
}
