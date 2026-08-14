"use client";

import * as Accordion from "@radix-ui/react-accordion";

// ChevronDown SVG component (no lucide-react dependency)
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

// FAQ data - matching original Webstudio content exactly
const faqs = [
  {
    question: "What are the dates?",
    answer: (
      <>
        Alpha Youth kicks off on <strong>May 4</strong> and runs for{" "}
        <strong>8 weeks</strong>. The highlight will be our{" "}
        <strong>Alpha Weekend Getaway</strong>—more details coming soon!
      </>
    ),
  },
  {
    question: "Do I have to commit to all the sessions?",
    answer:
      "While we encourage you to come for all sessions (since each builds on the last), you're free to join as many as you can. Just show up, and we'll be happy to have you!",
  },
  {
    question: "Can my friends join halfway?",
    answer:
      "Yes! We'd love to have them anytime. But it's best to start early so they don't miss out on key conversations.",
  },
  {
    question: "Do i have to be Christian to join?",
    answer:
      "Not at all! Alpha Youth is for anyone curious about faith—whether you're Christian, unsure, or just exploring. It's a safe space to ask anything—no judgment, just conversation.",
  },
  {
    question: "What will we be talking about?",
    answer: (
      <>
        Alpha Youth is all about real, honest conversations on faith, life, and
        meaning. Some of the topics include:
        <br />
        <br />
        <strong>- Who is Jesus?</strong>
        <br />
        <strong>- Why did Jesus die?</strong>
        <br />
        <strong>- Why do I need a relationship with God?</strong>
        <br />
        <strong>- How do I develop a relationship with God?</strong>
        <br />
        <strong>- Why does evil exist, and how can I overcome it</strong>?
        <br />
        <br />
        No question is off-limits, and everyone is free to share their thoughts
        (or just listen!).
      </>
    ),
  },
  {
    question: "What happens at Alpha Youth?",
    answer:
      "Every session includes food, a short video, and an open discussion where you can ask anything. No preaching, no pressure—just real talk.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes! The weekly Alpha Youth sessions are completely free. However, our Alpha Weekend Getaway will have a fee to cover meals, accommodation, and transportation. Financial assistance may be available—just ask!",
  },
  {
    question: "What if I'm shy or don't know anyone?",
    answer: (
      <>
        No worries! Alpha Youth is all about{" "}
        <strong>friendship and open conversations.</strong> You won&apos;t be
        put on the spot, and our team will make sure you feel welcome from day
        one.
      </>
    ),
  },
  {
    question: "What's the Alpha Weekend Getaway?",
    answer: (
      <>
        It&apos;s a <strong>special getaway experience</strong> where we take a
        break from our usual routine, have fun, go deeper in conversations, and
        explore faith in a relaxed setting. It&apos;s the highlight of Alpha
        Youth! More details on location, schedule, and cost coming soon.
      </>
    ),
  },
  {
    question: "Who can I talk to if I have more questions?",
    answer: (
      <>
        You can reach out to{" "}
        <a
          href="https://www.instagram.com/strictlystudents/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C1FE01] font-bold"
        >
          @strictlystudents
        </a>{" "}
        on Instagram.
      </>
    ),
  },
];

// Accordion Item component
const FAQItem = ({
  question,
  answer,
  value,
}: {
  question: string;
  answer: React.ReactNode;
  value: string;
}) => (
  <Accordion.Item value={value} className="w-full border-b border-slate-200">
    <Accordion.Header className="flex w-full font-[Inter,sans-serif] font-medium uppercase">
      <Accordion.Trigger className="flex flex-1 items-center justify-between py-4 text-left font-medium hover:underline group w-full">
        <span className="text-white font-bold uppercase text-start">
          {question}
        </span>
        <div className="flex items-center justify-center transition-transform duration-200 w-6 h-6">
          <ChevronDown className="w-4 h-4 text-white group-data-[state=open]:rotate-180 transition-transform duration-200" />
        </div>
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content className="overflow-hidden text-white data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up pb-4 font-[Inter,sans-serif]">
      {answer}
    </Accordion.Content>
  </Accordion.Item>
);

export default function FAQSection() {
  return (
    <section
      id="faqs"
      className="bg-[rgb(80,56,225)] flex flex-col items-center py-15 px-4"
    >
      <div className="w-full max-w-200 flex flex-col items-start">
        <h2 className="text-white text-center font-black text-[60px] uppercase leading-none mb-8 w-full">
          FAQS
        </h2>
        <Accordion.Root
          type="single"
          collapsible
          defaultValue="0"
          className="w-full font-[Inter,sans-serif]"
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
      </div>
    </section>
  );
}
