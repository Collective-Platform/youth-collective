"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type OtpResponse = { ok: boolean; message?: string };
type AuthMode = "login" | "signup";

export default function EmailOtpForm({ returnTo = "/dashboard" }: { returnTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(() => Array.from({ length: 6 }, () => ""));
  const [mode, setMode] = useState<AuthMode>("login");
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const verificationInFlight = useRef(false);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const isClassBooking = returnTo.startsWith("/classes");

  function requestCode() {
    startTransition(async () => {
      setMessage(null);
      try {
        const response = await fetch("/api/auth/otp/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, mode }),
        });
        const result = (await response.json()) as OtpResponse;
        if (!response.ok || !result.ok) {
          setMessage(result.message ?? "We could not send a verification code.");
          return;
      }
      setCodeSent(true);
      } catch {
        setMessage("We could not send a verification code.");
      }
    });
  }

  function verifyCode(code = otp.join("")) {
    if (verificationInFlight.current) return;

    verificationInFlight.current = true;
    startTransition(async () => {
      setMessage(null);
      try {
        const response = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: code, mode, privacyConsent: mode === "signup" ? hasAcceptedPolicies : undefined }),
        });
        const result = (await response.json()) as OtpResponse;
        if (!response.ok || !result.ok) {
          setMessage(result.message ?? "That code could not be verified.");
          return;
        }
        router.push(returnTo);
        router.refresh();
      } catch {
        setMessage("That code could not be verified.");
      } finally {
        verificationInFlight.current = false;
      }
    });
  }

  function submitVerification() {
    verifyCode();
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage(null);
  }

  function setOtpAndVerifyIfComplete(nextOtp: string[]) {
    setOtp(nextOtp);
    const code = nextOtp.join("");
    if (nextOtp.every(Boolean)) verifyCode(code);
  }

  function handleOtpChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      handleOtpPaste(index, digits);
      return;
    }

    const digit = digits;
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtpAndVerifyIfComplete(nextOtp);

    if (digit && index < nextOtp.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(index: number, value: string) {
    const digits = value.replace(/\D/g, "").slice(0, otp.length - index);
    if (!digits) return;

    const nextOtp = [...otp];
    digits.split("").forEach((digit, offset) => {
      nextOtp[index + offset] = digit;
    });
    setOtpAndVerifyIfComplete(nextOtp);

    const nextEmptyIndex = nextOtp.findIndex((digit) => !digit);
    if (nextEmptyIndex !== -1) otpInputRefs.current[nextEmptyIndex]?.focus();
  }

  function handleOtpKeyDown(index: number, key: string) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (key === "ArrowLeft" && index > 0) otpInputRefs.current[index - 1]?.focus();
    if (key === "ArrowRight" && index < otp.length - 1) otpInputRefs.current[index + 1]?.focus();
  }

  return (
    <>
    <h2 className="font-heading text-center text-3xl leading-[0.98] tracking-[-0.03em] text-black md:text-4xl">
      {codeSent ? "Check your email" : (mode === "signup" ? (isClassBooking ? "Sign up to join a class." : "Create an account") : (isClassBooking ? "Login to join a class." : "Welcome to Strictly Students"))}
    </h2>
    {codeSent ? <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-black/55">We’ve just sent a 6-digit verification code to <span className="block break-words font-semibold text-black/75">{email}</span></p> : null}
    <form
      action={codeSent ? submitVerification : requestCode}
      className="mx-auto mt-8 max-w-md text-left"
    >
      {!codeSent ? <>
        <label className="sr-only" htmlFor="booking-email">
          Your email address
        </label>
        <div>
          <input
            autoComplete="email"
            className="min-h-12 w-full rounded-full border border-black/15 bg-white px-5 text-black outline-none placeholder:text-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            id="booking-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email..."
            required
            type="email"
            value={email}
          />
        </div>
      </> : null}
      {!codeSent ? (
        <>
          {mode === "signup" ? <label className="mt-5 flex items-start gap-3 text-sm leading-5 text-black/65"><input checked={hasAcceptedPolicies} className="mt-0.5 size-4 shrink-0 accent-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" onChange={(event) => setHasAcceptedPolicies(event.target.checked)} required type="checkbox" /><span>By signing up, I agree to Collective&apos;s <a className="font-bold no-underline hover:underline decoration-2 underline-offset-3 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black" href="https://collective.my/terms/" rel="noreferrer" target="_blank">Terms of Use</a>, <a className="font-bold no-underline hover:underline decoration-2 underline-offset-3 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black" href="https://collective.my/privacy/" rel="noreferrer" target="_blank">Privacy Policy</a> and <a className="font-bold no-underline hover:underline decoration-2 underline-offset-3 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black" href="https://collective.my/refund/" rel="noreferrer" target="_blank">Refund Policy</a>.</span></label> : null}
          <button className="mt-5 min-h-12 w-full rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-black/75 disabled:cursor-not-allowed disabled:bg-black/40" disabled={isPending || (mode === "signup" && !hasAcceptedPolicies)} type="submit">
            {isPending ? (mode === "login" ? "Logging in…" : "Signing up…") : (mode === "login" ? "Login" : "Sign Up")}
          </button>
        </>
      ) : null}
      {codeSent ? (
        <>
          <fieldset className="mt-1">
            <legend className="w-full text-center text-sm font-bold text-black">Six-digit code</legend>
            <div className="mx-auto mt-3 flex w-[16.5rem] justify-center sm:w-72">
              {otp.map((digit, index) => <input
                aria-label={`Digit ${index + 1} of 6`}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                autoFocus={index === 0}
                className="aspect-square min-w-0 flex-1 border border-l-0 border-black bg-white text-center font-mono text-lg text-black outline-none first:rounded-l-xl first:border-l last:rounded-r-xl focus-visible:ring-4 focus-visible:ring-black/30"
                inputMode="numeric"
                key={index}
                maxLength={1}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event.key)}
                onPaste={(event) => { event.preventDefault(); handleOtpPaste(index, event.clipboardData.getData("text")); }}
                pattern="[0-9]"
                ref={(element) => { otpInputRefs.current[index] = element; }}
                required
                type="text"
                value={digit}
              />)}
            </div>
          </fieldset>
          <button className="mx-auto mt-5 block min-h-12 w-[16.5rem] rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-black/75 disabled:cursor-not-allowed disabled:bg-black/40 sm:w-72" disabled={isPending || otp.some((digit) => !digit)} type="submit">
            {isPending ? "Checking…" : "Verify code"}
          </button>
        </>
      ) : null}
      {message ? <p className="mt-4 text-sm font-semibold text-black/75" role="status">{message}</p> : null}
    </form>
    {!codeSent ? <p className="mx-auto mt-6 max-w-md text-center text-sm text-black/65">
      {mode === "login" ? "Don’t have an account?" : "Already have an account?"}{" "}
      <button className="font-bold no-underline hover:underline decoration-2 underline-offset-4 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black" onClick={() => switchMode(mode === "login" ? "signup" : "login")} type="button">
        {mode === "login" ? "Sign Up" : "Log In"}
      </button>
    </p> : null}
    </>
  );
}
