"use client";

import * as Accordion from "@radix-ui/react-accordion";

const ChevronDown = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4 6 4 4 4-4"
    />
  </svg>
);

const defaultFaqs = [
  {
    question: "What does the fee include?",
    answer:
      "The fee is inclusive of your stay, transportation, activities, and meals.",
  },
  {
    question: "Do you offer any discounts?",
    answer: (
      <>
        If you&apos;re unable to afford the full fee upfront, we offer an installment payment option. If cost is still a concern, please{" "}
        <a
          href="https://wa.me/601123646715?text=Hi%20I%27m%20%5BYour%20Name%5D%2C%20I%20would%20like%20to%20request%20financial%20aid%20for%20Learning%20Labs%3A%20Experience%20because%20%5BYour%20Reason%5D"
          target="_blank"
          rel="noreferrer"
          className="text-[#f45c36] underline underline-offset-4"
        >
          reach out to us
        </a>
        . We&apos;re open to discussing other support options where possible!
      </>
    ),
  },
  {
    question: "If I'm younger or older than 13-17, can I still join?",
    answer: (
      <>
        <p>
          Yes! If you&apos;re above 17, you can join the program as a <strong>helper</strong> instead of a participant. As a helper, you&apos;ll take on additional roles and responsibilities, including helping with planning and execution, and potentially facilitating group discussions.
        </p>
        <p className="mt-4">
          If you&apos;re interested in joining as a helper, please reach out to us via{" "}
          <a
            href="https://wa.me/601123646715"
            target="_blank"
            rel="noreferrer"
            className="text-[#f45c36] underline underline-offset-4"
          >
            WhatsApp
          </a>
          .
        </p>
        <p className="mt-4">
          Alternatively you can also consider our internship program. You can email us at{" "}
          <a
            href="mailto:carinalau@collective.my"
            className="text-[#f45c36] underline underline-offset-4"
          >
            carinalau@collective.my
          </a>{" "}
          for more information on the internship program.
        </p>
      </>
    ),
  },
  {
    question: "What will a typical day look like?",
    answer:
      "A typical day will begin with breakfast and devotions followed by teaching, training, and workshop sessions, with breaks for lunch and dinner in between. There will be a variety of other activities throughout the week as well to shake things up.",
  },
  {
    question: "Is there a refund policy?",
    answer: (
      <div className="max-w-sm">
        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2">
          <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 border-b border-black/20 pb-2">
            <dt className="font-bold">Cancellation Date</dt>
            <dd className="text-right font-bold">Refund</dd>
          </div>
          <dt className="font-bold">On or before 31 Oct</dt>
          <dd className="text-right">100% refund*</dd>
          <dt className="font-bold">1–15 Nov</dt>
          <dd className="text-right">50% refund*</dd>
          <dt className="font-bold">After 15 Nov</dt>
          <dd className="text-right">No refund</dd>
        </dl>
        <p className="mt-4">*Minus RM25 processing fee.</p>
      </div>
    ),
  },
];

const FAQItem = ({
  value,
  question,
  answer,
}: {
  value: string;
  question: string;
  answer: React.ReactNode;
}) => (
  <Accordion.Item value={value} className="border-b border-black/80 w-full">
    <Accordion.Header>
      <Accordion.Trigger className="w-full flex justify-between items-center py-6 bg-transparent border-none cursor-pointer text-black text-base font-bold text-left tracking-wide group hover:text-[#f45c36] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#f45c36]">
        {question}
        <ChevronDown className="w-6 h-6 transition-transform duration-300 group-data-[state=open]:rotate-180 text-[#f45c36]" />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content className="overflow-hidden text-black/80 text-sm leading-relaxed data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
      <div className="pb-6">{answer}</div>
    </Accordion.Content>
  </Accordion.Item>
);

export default function FAQ({
  enquiryFirst = false,
  surfaceClassName = "bg-white",
}: {
  enquiryFirst?: boolean;
  surfaceClassName?: string;
}) {
  const faqs = enquiryFirst
    ? defaultFaqs.map((faq) =>
        faq.question === "Can I pay by instalment?"
          ? {
              ...faq,
              answer:
                "Yes. Message us to check availability and ask about the payment options, including instalments.",
            }
          : faq,
      )
    : defaultFaqs;

  return (
    <section id="faqs" className={`${surfaceClassName} px-4 py-20 text-black md:py-24`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-[clamp(32px,6vw,56px)] font-heading text-center leading-tight mb-8">
          We know you&apos;ve got questions (FAQ)
        </h2>

        <Accordion.Root
          type="single"
          collapsible
          defaultValue="0"
          className="w-full"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              value={String(index)}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </Accordion.Root>
        <div className="mt-8 text-center">
          <p className="text-sm text-balance text-black">
            Questions? Reach out to us — we&apos;d love to hear from you.
          </p>
          <a
            className="mt-4 inline-flex bg-[#f45c36] px-5 py-3 text-sm font-bold text-[#edeae5] transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f45c36]"
            href="https://wa.me/601123646715"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}
