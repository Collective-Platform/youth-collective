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

const faqs = [
  {
    question: "Where will the program be held?",
    answer:
      "The program will take place primarily at Collective's premises and at the Airbnb accommodation. Travel between destinations and the stay at the Airbnb will always be supervised by a staff member.",
  },
  {
    question: "What does the fee include?",
    answer:
      "RM599 is inclusive of your stay, transportation, activities, breakfasts, and dinners. Please prepare extra pocket money for your lunch meals and any other miscellaneous items.",
  },
  {
    question: "Do you offer any discounts?",
    answer:
      "If you're unable to afford the full fee upfront, we offer an installment payment option. If cost is still a concern, please reach out to us. We're open to discussing other support options where possible!",
  },
  {
    question: "If I'm younger or older than 16-18, can I still join?",
    answer:
      "If you are 15 years old, you may still be considered on a case-by-case basis, subject to recommendation and management approval. If you are above 18, we encourage you to consider our internship program instead.",
  },
  {
    question: "What are the dates?",
    answer:
      "Arrival date: 23 March, 8:30AM. Departure date: 29 March, 12PM (after Sunday service).",
  },
  {
    question: "How will I know if I'm accepted?",
    answer:
      "After you have submitted the form, we will review and contact you within one week.",
  },
  {
    question: "What will a typical day look like?",
    answer:
      "A typical day will begin with breakfast and devotions followed by teaching, training, and workshop sessions, with breaks for lunch and dinner in between. There will be a variety of other activities throughout the week as well to shake things up such as bouldering and hiking.",
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
      <Accordion.Trigger className="w-full flex justify-between items-center py-6 bg-transparent border-none cursor-pointer text-black text-base font-bold text-left tracking-wide group hover:text-[#FF6B35] transition-colors">
        {question}
        <ChevronDown className="w-6 h-6 transition-transform duration-300 group-data-[state=open]:rotate-180 text-[#FF6B35]" />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content className="overflow-hidden text-black/80 text-sm leading-relaxed data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
      <div className="pb-6">{answer}</div>
    </Accordion.Content>
  </Accordion.Item>
);

export default function InternshipFAQ() {
  return (
    <section id="faqs" className="bg-[#ecebe4] text-black py-24 px-4">
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
        <p className="mt-8 text-center text-black text-sm">
          Questions? Reach out to{" "}
          <a className="text-[#FF6B35]" href="mailto:carinalau@collective.my">
            carinalau@collective.my
          </a>{" "}
          — we&apos;d love to hear from you.
        </p>
      </div>
    </section>
  );
}
