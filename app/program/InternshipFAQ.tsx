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
      "RM699 is inclusive of your stay, transportation, activities, and meals.",
  },
  {
    question: "Do you offer any discounts?",
    answer:
      "If you're unable to afford the full fee upfront, we offer an installment payment option. If cost is still a concern, please reach out to us. We're open to discussing other support options where possible!",
  },
  {
    question: "If I'm younger or older than 13-17, can I still join?",
    answer:
      "If you are 12 years old, you may still be considered on a case-by-case basis, subject to recommendation and management approval. If you are above 17, we encourage you to consider our internship program instead. You can email us at carinalau@collective.my for more information on the internship program.",
  },
  {
    question: "What will a typical day look like?",
    answer:
      "A typical day will begin with breakfast and devotions followed by teaching, training, and workshop sessions, with breaks for lunch and dinner in between. There will be a variety of other activities throughout the week as well to shake things up.",
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

export default function InternshipFAQ({
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
          <p className="text-sm text-black">
            Questions? Reach out to us — we&apos;d love to hear from you.
          </p>
          <a
            className="mt-4 inline-flex bg-[#f45c36] px-5 py-3 text-sm font-bold text-[#edeae5] transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f45c36]"
            href="https://wa.me/601123646715"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Up
          </a>
        </div>
      </div>
    </section>
  );
}
