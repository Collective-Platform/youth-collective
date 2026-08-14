"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronLeft, ChevronRight, ShieldCheck, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { isProgramParticipantMinor } from "@/lib/program-age";

type PaymentOption = "full" | "installments";

type RegistrationDraft = {
  version: 2;
  currentStep: number;
  paymentOption: PaymentOption | null;
  fields: Record<string, string>;
};

const steps = ["Participant", "Your story", "Consent", "Payment"];
const draftStorageKey = "strictly-students-learning-labs-experience-registration-draft-v1";

const paymentOptions: Array<{
  id: PaymentOption;
  label: string;
  description: string;
}> = [
  {
    id: "full",
    label: "Pay RM699 now",
    description: "One payment today",
  },
  {
    id: "installments",
    label: "Pay RM233 × 3",
    description: "Three monthly card payments",
  },
];

const fieldClassName =
  "min-h-12 w-full border-2 border-black bg-white px-3 text-base font-normal normal-case tracking-normal outline-none transition-colors placeholder:text-black/45 focus:border-[#f45c36]";

const textareaClassName = `${fieldClassName} min-h-28 py-3 leading-relaxed`;

function getTodayDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-bold uppercase tracking-wide">{children}</span>;
}

function SectionHeading({ children, description }: { children: string; description?: string }) {
  return (
    <div className="border-b-2 border-black pb-4">
      <h3 className="font-heading text-3xl leading-[0.9] uppercase sm:text-4xl">{children}</h3>
      {description ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/70">{description}</p> : null}
    </div>
  );
}

function Waiver({ participantType }: { participantType: "parent" | "participant" }) {
  const isParent = participantType === "parent";

  return (
    <div className="space-y-4 border-2 border-black bg-[#fff1ed] p-4 text-sm leading-relaxed text-black/80">
      {isParent ? (
        <>
          <p>
            In consideration of being allowed to participate in Strictly Students Learning Labs: Experience organized by Strictly Students and Collective (hereinafter referred to as &quot;the Experience Lab&quot;) happening on 7 - 13 December 2026, I, the undersigned parent/guardian, do hereby acknowledge and agree as follows:
          </p>
          <p>
            <strong>1. Assumption of Risk:</strong><br />
            I understand that participating in the Experience Lab may involve inherent risks, including but not limited to physical injury, illness, or damage to personal property. I voluntarily assume all risks associated with the participant&apos;s participation in the Experience Lab and hereby release and discharge the Experience Lab, its organizers, staff, volunteers, and any affiliated parties from any liability, claims, demands, actions, or causes of action arising out of or related to any such injuries, illnesses, or damages.
          </p>
          <p>
            <strong>2. Medical Authorization:</strong><br />
            I authorize the Experience Lab staff to seek medical attention, including emergency medical treatment, on my behalf in the event of an injury or illness during the Experience Lab. I understand that every effort will be made to contact the parent/guardian contact listed above before medical treatment is administered, but I agree that the Experience Lab staff may take immediate action if deemed necessary for the participant&apos;s well-being.
          </p>
          <p>
            <strong>3. Responsibility for Personal Property:</strong><br />
            I understand that the participant is responsible for their personal property during the Experience Lab, and Collective is not responsible for any loss, theft, or damage to personal belongings.
          </p>
          <p>
            <strong>4. Code of Conduct:</strong><br />
            I agree to abide by all rules, regulations, and codes of conduct established by Strictly Students and Collective. Failure to do so may result in my dismissal from the Experience Lab without a refund.
          </p>
          <p>
            <strong>5. Use of Likeness:</strong><br />
            I grant the Experience Lab the right to use photographs, video recordings, and/or audio recordings of the participant for promotional and marketing purposes, without compensation, unless I notify the Experience Lab in writing otherwise.
          </p>
          <p>
            I HAVE READ THIS RELEASE AND WAIVER OF LIABILITY, ASSUMPTION OF RISK, AND INDEMNITY AGREEMENT, FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY SIGNING IT, AND SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.
          </p>
        </>
      ) : (
        <>
          <p>
            In consideration of being allowed to participate in the Strictly Students Learning Labs: Experience organized by Strictly Students and Collective (hereinafter referred to as &quot;the Experience Lab&quot;) happening on 7 - 13 December 2026, I, the undersigned participant, do hereby acknowledge and agree as follows:
          </p>
          <p>
            <strong>1. Assumption of Risk:</strong><br />
            I understand that participating in the Experience Lab may involve inherent risks, including but not limited to physical injury, illness, or damage to personal property. I voluntarily assume all risks associated with my participation in the Experience Lab and hereby release and discharge the Experience Lab, its organizers, staff, volunteers, and any affiliated parties from any liability, claims, demands, actions, or causes of action arising out of or related to any such injuries, illnesses, or damages.
          </p>
          <p>
            <strong>2. Medical Authorization:</strong><br />
            I authorize the Experience Lab staff to seek medical attention, including emergency medical treatment, on my behalf in the event of an injury or illness during the Experience Lab. I understand that every effort will be made to contact the emergency contact listed above before medical treatment is administered, but I agree that the Experience Lab staff may take immediate action if deemed necessary for my well-being.
          </p>
          <p>
            <strong>3. Responsibility for Personal Property:</strong><br />
            I understand that I am responsible for my personal property during the Experience Lab, and Collective is not responsible for any loss, theft, or damage to personal belongings.
          </p>
          <p>
            <strong>4. Code of Conduct:</strong><br />
            I agree to abide by all rules, regulations, and codes of conduct established by Strictly Students and Collective. Failure to do so may result in my dismissal from the Experience Lab without a refund.
          </p>
          <p>
            <strong>5. Use of Likeness:</strong><br />
            I grant the Experience Lab the right to use photographs, video recordings, and/or audio recordings of me for promotional and marketing purposes, without compensation, unless I notify the Experience Lab in writing otherwise.
          </p>
          <p>
            I HAVE READ THIS RELEASE AND WAIVER OF LIABILITY, ASSUMPTION OF RISK, AND INDEMNITY AGREEMENT, FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY SIGNING IT, AND SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.
          </p>
        </>
      )}
    </div>
  );
}

function getSavedDraft() {
  try {
    const savedDraft = window.localStorage.getItem(draftStorageKey);
    if (!savedDraft) return null;

    const draft = JSON.parse(savedDraft) as RegistrationDraft;
    if (
      draft.version !== 2 ||
      !Number.isInteger(draft.currentStep) ||
      draft.currentStep < 0 ||
      draft.currentStep >= steps.length ||
      (draft.paymentOption !== null && !["full", "installments"].includes(draft.paymentOption)) ||
      !draft.fields
    ) {
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

function applyDraftToForm(form: HTMLFormElement, fields: Record<string, string>) {
  for (const element of form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]")) {
    const savedValue = fields[element.name];

    if (element instanceof HTMLInputElement && element.type === "radio") {
      element.checked = savedValue === element.value;
    } else if (element instanceof HTMLInputElement && element.type === "checkbox") {
      element.checked = savedValue !== undefined;
    } else if (savedValue !== undefined) {
      element.value = savedValue;
    }
  }
}

type RegistrationDialogProps = {
  triggerClassName?: string;
};

export default function RegistrationDialog({ triggerClassName }: RegistrationDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [todayDate] = useState(getTodayDate);
  const [paymentOption, setPaymentOption] = useState<PaymentOption | null>(null);
  const [saveProgress, setSaveProgress] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registrationIdRef = useRef<string | null>(null);

  const needsGuardian = isProgramParticipantMinor(dateOfBirth);

  function saveDraft({
    nextStep = currentStep,
    nextPaymentOption = paymentOption,
    force = false,
  }: {
    nextStep?: number;
    nextPaymentOption?: PaymentOption | null;
    force?: boolean;
  } = {}) {
    if ((!saveProgress && !force) || !formRef.current) return;

    const fields = Object.fromEntries(
      Array.from(new FormData(formRef.current).entries()).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );

    try {
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ version: 2, currentStep: nextStep, paymentOption: nextPaymentOption, fields } satisfies RegistrationDraft),
      );
    } catch {
      // Storage can be unavailable in private browsing or when the device is full.
    }
  }

  function restoreDraft() {
    const draft = getSavedDraft();
    if (!draft) return;

    setSaveProgress(true);
    setCurrentStep(draft.currentStep);
    setPaymentOption(draft.paymentOption);
    setDateOfBirth(draft.fields.dateOfBirth ?? "");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!formRef.current) return;
        applyDraftToForm(formRef.current, draft.fields);
      });
    });
  }

  function clearSavedDraft() {
    try {
      window.localStorage.removeItem(draftStorageKey);
    } catch {
      // Keep the form usable when browser storage is unavailable.
    }
    setSaveProgress(false);
  }

  function changeStep(nextStep: number) {
    saveDraft({ nextStep });
    setCurrentStep(nextStep);
    requestAnimationFrame(() => {
      dialogContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function validateCurrentStep() {
    const panel = formRef.current?.querySelector<HTMLElement>(`[data-step="${currentStep}"]`);
    const fields = panel?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    );

    if (!fields) return false;

    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }

    return true;
  }

  function validateAllSteps() {
    for (let step = 0; step < steps.length; step += 1) {
      const panel = formRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`);
      const fields = panel?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea",
      );
      if (!fields) return false;

      for (const field of fields) {
        if (field.checkValidity()) continue;

        setCurrentStep(step);
        requestAnimationFrame(() => {
          dialogContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          field.reportValidity();
          field.focus();
        });
        return false;
      }
    }

    return true;
  }

  function goForward() {
    if (validateCurrentStep()) {
      changeStep(Math.min(currentStep + 1, steps.length - 1));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateAllSteps()) return;
    if (!paymentOption) {
      setSubmissionError("Choose a payment option before continuing to Stripe.");
      return;
    }
    if (!formRef.current || isSubmitting) return;

    setSubmissionError("");
    setIsSubmitting(true);
    registrationIdRef.current ??= crypto.randomUUID();

    const fields = Object.fromEntries(
      Array.from(new FormData(formRef.current).entries()).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch("/api/program-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: registrationIdRef.current, paymentOption, fields }),
        signal: controller.signal,
      });
      const body = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !body.checkoutUrl) {
        throw new Error(body.error ?? "We could not begin secure checkout. Please try again.");
      }

      clearSavedDraft();
      window.location.assign(body.checkoutUrl);
    } catch (error) {
      setSubmissionError(
        error instanceof DOMException && error.name === "AbortError"
          ? "Secure checkout took too long to open. Please try again."
          : error instanceof Error
            ? error.message
            : "We could not begin secure checkout. Please try again.",
      );
      setIsSubmitting(false);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function resetDialog() {
    setCurrentStep(0);
    setDateOfBirth("");
    setPaymentOption(null);
    setSubmissionError("");
    setIsSubmitting(false);
    registrationIdRef.current = null;
    formRef.current?.reset();
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      restoreDraft();
    } else if (!saveProgress) {
      resetDialog();
    }
  }

  function handleSaveProgressChange(shouldSaveProgress: boolean) {
    if (!shouldSaveProgress) {
      clearSavedDraft();
      return;
    }

    setSaveProgress(true);
    requestAnimationFrame(() => saveDraft({ force: true }));
  }

  return (
    <Dialog.Root onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={triggerClassName ?? "inline-block border-2 border-[#f45c36] bg-[#f45c36] px-12 py-5 text-xl font-bold uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black"}
        >
          Register now
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content ref={dialogContentRef} className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border-2 border-black bg-white p-6 text-black shadow-[10px_10px_0_0_#f45c36] outline-none sm:p-9 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <Dialog.Title className="mt-4 font-heading text-xl leading-[0.9] uppercase sm:text-5xl">
                Registration
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid size-10 shrink-0 place-items-center border-2 border-black transition-colors hover:bg-black hover:text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f45c36]"
                aria-label="Close registration form"
              >
                <X aria-hidden="true" className="size-5" strokeWidth={2.5} />
              </button>
            </Dialog.Close>
          </div>

          <ol className="mt-7 grid grid-cols-4 gap-1" aria-label="Registration progress">
            {steps.map((step, index) => {
              const isCurrent = currentStep === index;
              const isComplete = currentStep > index;
              return (
                <li key={step} className="min-w-0">
                  <div
                    className={`h-2 ${isComplete || isCurrent ? "bg-[#f45c36]" : "bg-black/15"}`}
                    aria-hidden="true"
                  />
                  <span className={`mt-2 block truncate text-[10px] font-bold uppercase tracking-wide sm:text-xs ${isCurrent ? "text-black" : "text-black/50"}`}>
                    {isComplete ? <Check className="mr-1 inline size-3" aria-hidden="true" /> : null}
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>

          <form ref={formRef} className="mt-8" noValidate onInput={() => saveDraft()} onSubmit={handleSubmit}>
            <section data-step="0" className="space-y-6" hidden={currentStep !== 0}>
                <SectionHeading>
                  Participant information
                </SectionHeading>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 sm:col-span-2">
                    <FieldLabel>Full name</FieldLabel>
                    <input className={fieldClassName} name="fullName" autoComplete="name" required />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>Date of birth</FieldLabel>
                    <input
                      className={fieldClassName}
                      name="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                      required
                    />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>IC number</FieldLabel>
                    <input className={fieldClassName} name="icNumber" inputMode="numeric" required />
                  </label>
                  <fieldset>
                    <legend className="mb-2 text-sm font-bold uppercase tracking-wide">Gender</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {["Male", "Female"].map((gender) => (
                        <label key={gender} className="cursor-pointer">
                          <input className="peer sr-only" type="radio" name="gender" value={gender} required />
                          <span className="block border-2 border-black px-4 py-3 text-center text-sm font-bold transition-colors peer-checked:bg-[#f45c36] peer-checked:text-white hover:bg-black hover:text-white">
                            {gender}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="grid gap-2">
                    <FieldLabel>Citizenship</FieldLabel>
                    <input className={fieldClassName} name="citizenship" required />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>Email</FieldLabel>
                    <input className={fieldClassName} name="email" type="email" autoComplete="email" required />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>WhatsApp contact number</FieldLabel>
                    <input className={fieldClassName} name="whatsAppNumber" type="tel" autoComplete="tel" required />
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <FieldLabel>Current address</FieldLabel>
                    <textarea className={textareaClassName} name="currentAddress" autoComplete="street-address" required />
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <FieldLabel>Allergies (if any)</FieldLabel>
                    <input className={fieldClassName} name="allergies" />
                  </label>
                </div>
            </section>

            <section data-step="1" className="space-y-6" hidden={currentStep !== 1}>
                <SectionHeading
  description={
    "We are excited to learn more about you before you begin the program with us. \n\n Please pray and consider the following questions. Your story is important, and we want to hear it. Thank you!"
  }
>
                  Your story
                </SectionHeading>
                <div className="space-y-5">
                  <label className="grid gap-2">
                    <FieldLabel>Tell us a little about yourself</FieldLabel>
                    <textarea className={textareaClassName} name="aboutYou" placeholder="How would your friends describe you?" required />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>How did you begin following Jesus?</FieldLabel>
                    <textarea className={textareaClassName} name="followingJesus" placeholder="If you’re still figuring this out, that’s okay — feel free to share where you’re at." required />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>How would you describe your relationship with God currently?</FieldLabel>
                    <textarea className={textareaClassName} name="relationshipWithGod" placeholder="It doesn’t have to be perfect; we’re all on a journey." required />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>Why do you want to join this program?</FieldLabel>
                    <textarea className={textareaClassName} name="whyJoin" placeholder="Nothing is off-limits. Seriously." required />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>What are you hoping God might do in you and through you during this program?</FieldLabel>
                    <textarea className={textareaClassName} name="hopesForProgram" placeholder="Take some time to have a conversation with God." required />
                  </label>
                  <label className="grid gap-2">
                    <FieldLabel>Is there anything else you&apos;d like to tell us? <span className="font-normal normal-case tracking-normal text-black/55">(optional)</span></FieldLabel>
                    <textarea className={textareaClassName} name="additionalInformation" />
                  </label>
                </div>

                <div className="border-2 border-[#f45c36] bg-[#fff1ed] p-4 text-sm leading-relaxed">
                  If there is any further help needed due to mental health, the operating location / ministry leader may work with the family / church to arrange for appointments with a health professional or for the applicant to return home. We are not equipped to handle mental health crises. Thanks for your understanding.
                </div>
                <label className="flex cursor-pointer items-start gap-3 text-sm font-bold leading-relaxed">
                  <input className="mt-0.5 size-5 shrink-0 accent-[#f45c36]" type="checkbox" name="mentalHealthAcknowledgement" required />
                  <span>I understand.</span>
                </label>
            </section>

            <section data-step="2" className="space-y-6" hidden={currentStep !== 2}>
                <SectionHeading description={needsGuardian ? "Because the participant is under 18, a parent or guardian needs to complete this section." : "Please provide an emergency contact and complete the participant waiver."}>
                  {needsGuardian ? "Parent / guardian information" : "Emergency contact information"}
                </SectionHeading>

                {needsGuardian ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 sm:col-span-2">
                      <FieldLabel>Full name of parent / guardian</FieldLabel>
                      <input className={fieldClassName} name="guardianName" autoComplete="name" required />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Parent / guardian phone number</FieldLabel>
                      <input className={fieldClassName} name="guardianPhone" type="tel" autoComplete="tel" required />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Today&apos;s date</FieldLabel>
                      <input className={fieldClassName} name="guardianSignatureDate" type="date" defaultValue={todayDate} required />
                    </label>
                    <label className="grid gap-2 sm:col-span-2">
                      <FieldLabel>Address (if different from participant)</FieldLabel>
                      <textarea className={textareaClassName} name="guardianAddress" />
                    </label>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel>Emergency contact name</FieldLabel>
                      <input className={fieldClassName} name="emergencyContactName" autoComplete="name" required />
                    </label>
                    <label className="grid gap-2">
                      <FieldLabel>Emergency contact phone number</FieldLabel>
                      <input className={fieldClassName} name="emergencyContactPhone" type="tel" autoComplete="tel" required />
                    </label>
                    <label className="grid gap-2 sm:col-span-2">
                      <FieldLabel>Today&apos;s date</FieldLabel>
                      <input className={fieldClassName} name="participantSignatureDate" type="date" defaultValue={todayDate} required />
                    </label>
                  </div>
                )}

                <Waiver participantType={needsGuardian ? "parent" : "participant"} />

                <label className="flex cursor-pointer items-start gap-3 border-2 border-black p-4 text-sm font-bold leading-relaxed">
                  <input className="mt-0.5 size-5 shrink-0 accent-[#f45c36]" type="checkbox" name="waiverUnderstood" required />
                  <span>I have read, understood, and agree to this release and waiver of liability.</span>
                </label>
                <label className="grid gap-2">
                  <FieldLabel>{needsGuardian ? "Parent / guardian’s signature" : "Your signature"}</FieldLabel>
                  <input className={fieldClassName} name="signature" autoComplete="name" placeholder="Type your full legal name" required />
                  <span className="text-xs leading-relaxed text-black/60">Typing your name acts as your electronic signature.</span>
                </label>
            </section>

            <section data-step="3" className="space-y-6" hidden={currentStep !== 3}>
                <SectionHeading>
                  Payment
                </SectionHeading>
                <fieldset>
                  <legend className="text-sm font-bold uppercase tracking-wide">Choose a payment option</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {paymentOptions.map((option) => {
                      const isSelected = paymentOption === option.id;
                      return (
                        <label
                          key={option.id}
                          className={`cursor-pointer border-2 p-5 transition-colors ${
                            isSelected
                              ? "border-black bg-[#f45c36] text-white"
                              : "border-black bg-white text-black hover:bg-black hover:text-white"
                          }`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="paymentOption"
                            value={option.id}
                            checked={isSelected}
                            onChange={() => {
                              setPaymentOption(option.id);
                              setSubmissionError("");
                              requestAnimationFrame(() => saveDraft({ nextPaymentOption: option.id }));
                            }}
                          />
                          <span className="block text-lg font-bold">{option.label}</span>
                          <span className={`mt-1 block text-sm ${isSelected ? "text-white/85" : "text-black/65"}`}>
                            {option.description}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="flex gap-3 border-2 border-black bg-black p-4 text-sm leading-relaxed text-white">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#f45c36]" />
                  <p>Payment is processed by Stripe. Your card details are never entered or stored on this website.</p>
                </div>
                {!paymentOption ? (
                  <p className="text-sm font-bold text-[#c53d1d]" role="status">
                    Choose one payment option to continue.
                  </p>
                ) : null}
                {submissionError ? (
                  <p className="border-2 border-[#f45c36] bg-[#fff1ed] p-4 text-sm leading-relaxed text-black" role="status" aria-live="polite">
                    {submissionError}
                  </p>
                ) : null}
            </section>

            <div className="mt-9 flex flex-col gap-3 border-2 border-black bg-[#fff1ed] p-4 sm:flex-row sm:items-start sm:justify-between">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                <input
                  className="mt-0.5 size-5 shrink-0 accent-[#f45c36]"
                  type="checkbox"
                  checked={saveProgress}
                  onChange={(event) => handleSaveProgressChange(event.target.checked)}
                />
                <span>
                  <strong className="block">Save my progress on this device</strong>
                  This browser will keep your unfinished form until you clear it or complete registration.
                </span>
              </label>
              {saveProgress ? (
                <button
                  type="button"
                  onClick={clearSavedDraft}
                  className="shrink-0 text-left text-xs font-bold uppercase tracking-wide underline decoration-2 underline-offset-4 hover:text-[#c53d1d] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f45c36]"
                >
                  Clear saved copy
                </button>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t-2 border-black pt-6 sm:flex-row sm:justify-between">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={() => changeStep(Math.max(currentStep - 1, 0))}
                  className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-black px-5 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-black hover:text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f45c36]"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                  Back
                </button>
              ) : <span />}
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goForward}
                  className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-black bg-black px-6 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#f45c36] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f45c36]"
                >
                  Continue
                  <ChevronRight aria-hidden="true" className="size-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !paymentOption}
                  className="min-h-12 border-2 border-black bg-black px-6 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#f45c36] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f45c36] disabled:cursor-not-allowed disabled:border-black/30 disabled:bg-black/30"
                >
                  {isSubmitting ? "Opening secure checkout…" : "Continue to Stripe"}
                </button>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
