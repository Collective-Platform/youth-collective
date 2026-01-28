"use client";

import * as Accordion from "@radix-ui/react-accordion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

// Episode data - matching original Webstudio content exactly
const episodes = [
  {
    number: 1,
    title: "Welcome to the conversation",
    date: "May 4 | Stage 8 | 1PM - 3PM",
    variant: "blue" as const,
  },
  {
    number: 2,
    title: "Jesus is...",
    date: "May 18 | Stage 8 | 1PM - 3PM",
    variant: "lime" as const,
  },
  {
    number: 3,
    title: "What does real love look like?",
    date: "June 1 | Stage 8 | 1PM - 3PM",
    variant: "blue" as const,
  },
  {
    number: 4,
    title: "Why would I want a relationship with God?",
    date: "June 15 | Stage 8 | 1PM - 3PM",
    variant: "lime" as const,
  },
  {
    number: 5,
    title: "What does a relationship with God look like?",
    date: "june 22 | Stage 8 | 1PM - 3PM",
    variant: "blue" as const,
  },
  {
    number: 6,
    title: "Who is the holy spirit?",
    date: null,
    alphaWeekend: true,
    variant: "lime" as const,
  },
  {
    number: 7,
    title: "how can i be filled with the holy spirit?",
    date: null,
    alphaWeekend: true,
    variant: "blue" as const,
  },
  {
    number: 8,
    title: "how does god help us overcome evil?",
    date: null,
    alphaWeekend: true,
    variant: "lime" as const,
  },
  {
    number: 9,
    title: "does god heal today?",
    date: "July 13 | Stage 8 | 1PM - 3PM",
    variant: "blue" as const,
  },
  {
    number: 10,
    title: "what happens next?",
    date: "July 20 | Stage 8 | 1PM - 3PM",
    variant: "lime" as const,
    isBold: true,
  },
];

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
      "While we encourage you to come for all sessions (since each builds on the last), you&apos;re free to join as many as you can. Just show up, and we&apos;ll be happy to have you!",
  },
  {
    question: "Can my friends join halfway?",
    answer:
      "Yes! We&apos;d love to have them anytime. But it&apos;s best to start early so they don&apos;t miss out on key conversations.",
  },
  {
    question: "Do i have to be Christian to join?",
    answer:
      "Not at all! Alpha Youth is for anyone curious about faith—whether you&apos;re Christian, unsure, or just exploring. It&apos;s a safe space to ask anything—no judgment, just conversation.",
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
    question: "What if I&apos;m shy or don&apos;t know anyone?",
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
    question: "What&apos;s the Alpha Weekend Getaway?",
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

// Episode Card component - matching original blue (#0042FE) and lime (#C1FE01) colors
const EpisodeCard = ({ episode }: { episode: (typeof episodes)[0] }) => {
  const bgColor = episode.variant === "blue" ? "bg-[#0042FE]" : "bg-[#C1FE01]";
  const textColor = episode.variant === "blue" ? "text-white" : "text-black";

  return (
    <div
      className={`${bgColor} ${textColor} flex flex-col items-center justify-center text-center uppercase
        min-w-[325px] px-10 py-5 gap-[10px]`}
      style={{
        fontFamily: "Inter, sans-serif",
        minWidth: "325px",
        minHeight: "325px",
        paddingTop: "20px",
        paddingBottom: "20px",
        paddingLeft: "40px",
        paddingRight: "40px",
        rowGap: "10px",
      }}
    >
      <p
        style={{
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
      >
        Episode {episode.number}
      </p>
      <h3
        style={{
          fontSize: "28px",
          lineHeight: 1,
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        {episode.isBold ? <strong>{episode.title}</strong> : episode.title}
      </h3>
      {episode.date && (
        <p
          style={{
            fontSize: "14px",
            letterSpacing: "0.05em",
            paddingTop: "5px",
            paddingBottom: "5px",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          {episode.date}
        </p>
      )}
      {episode.alphaWeekend && (
        <a
          href="#alpha-weekend"
          style={{
            fontSize: "14px",
            letterSpacing: "0.05em",
            textDecoration: "underline",
            paddingTop: "5px",
            paddingBottom: "5px",
            paddingLeft: "10px",
            paddingRight: "10px",
            color: episode.variant === "lime" ? "black" : "white",
          }}
        >
          Alpha weekend getaway
        </a>
      )}
    </div>
  );
};

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
  <Accordion.Item
    value={value}
    className="w-full"
    style={{ borderBottom: "1px solid rgba(226, 232, 240, 1)" }}
  >
    <Accordion.Header
      className="flex w-full"
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        textTransform: "uppercase",
      }}
    >
      <Accordion.Trigger className="flex flex-1 items-center justify-between py-4 text-left font-medium hover:underline group w-full">
        <span
          className="text-white font-bold uppercase"
          style={{ textAlign: "start" }}
        >
          {question}
        </span>
        <div
          className="flex items-center justify-center transition-transform duration-200"
          style={{
            width: "24px",
            height: "24px",
            rotate: "var(--accordion-trigger-icon-transform, 0deg)",
          }}
        >
          <ChevronDown className="w-4 h-4 text-white group-data-[state=open]:rotate-180 transition-transform duration-200" />
        </div>
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content
      className="overflow-hidden text-white data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up pb-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {answer}
    </Accordion.Content>
  </Accordion.Item>
);

export default function AlphaPage() {
  return (
    <main style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      {/* Hero Section - Purple background #5038E1 */}
      <section
        style={{
          backgroundColor: "rgb(80, 56, 225)",
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "20px 16px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative images */}
        <img
          src="/assets/Icon_1_a-hU9tJFz_p_ks0lpsvkQ.png"
          alt=""
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "300px",
            pointerEvents: "none",
          }}
        />
        <img
          src="/assets/Icon_3_aW_gDKiW0gTfDJErmdojF.png"
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "250px",
            pointerEvents: "none",
          }}
        />
        <img
          src="/assets/Icon_2_EbPOWXD_WcapVhJTZZjdh.png"
          alt=""
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "350px",
            pointerEvents: "none",
          }}
        />
        {/* Main content */}
        <img
          src="/assets/What_s_on_your_mind_aZKPaQ0byEEFmMxIO3VG3.png"
          alt="What's on your mind?"
          style={{
            width: "60%",
            maxWidth: "600px",
            marginBottom: "16px",
          }}
        />
        <p
          style={{
            color: "white",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            width: "60%",
            maxWidth: "600px",
            marginBottom: "16px",
          }}
        >
          An 8 week journey to explore life, faith, and meaning—no judgment, no
          pressure, just real conversations.
        </p>
        <p
          style={{
            color: "rgb(193, 254, 1)",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
          }}
        >
          Sunday | 1pm - 3pm | Stage 8
        </p>
      </section>

      {/* What is Alpha Section */}
      <section
        style={{
          backgroundColor: "black",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 16px 60px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              gap: "60px",
            }}
          >
            {/* Left content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: "16px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <h2
                style={{
                  color: "rgb(193, 254, 1)",
                  textAlign: "start",
                  fontWeight: 900,
                  fontSize: "60px",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                What is Alpha?
              </h2>
              <p
                style={{
                  textAlign: "start",
                  fontWeight: 900,
                  color: "white",
                  margin: 0,
                }}
              >
                Let&apos;s talk.{" "}
                <span style={{ color: "rgb(254, 34, 236)" }}>No judgment,</span>{" "}
                <span style={{ color: "rgb(255, 0, 135)" }}>
                  just real convos.
                </span>
              </p>
              <p
                style={{
                  color: "white",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "start",
                  fontSize: "16px",
                  margin: 0,
                }}
              >
                Alpha is a 8-week journey designed for you to explore big
                questions about life and faith in an open, no-pressure
                environment. Expect food, fun, and open discussions where every
                opinion is welcome.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "16px",
                }}
              >
                <p
                  style={{
                    color: "white",
                    fontFamily: "Inter, sans-serif",
                    textAlign: "start",
                    fontSize: "16px",
                    margin: 0,
                  }}
                >
                  Time:{" "}
                  <span style={{ color: "rgb(193, 254, 1)" }}>1PM-3PM</span>
                </p>
                <p
                  style={{
                    color: "white",
                    fontFamily: "Inter, sans-serif",
                    textAlign: "start",
                    fontSize: "16px",
                    margin: 0,
                  }}
                >
                  Location:{" "}
                  <span style={{ color: "rgb(193, 254, 1)" }}>Stage 8</span>
                </p>
              </div>
              <p
                style={{
                  color: "white",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "start",
                  fontSize: "16px",
                  margin: 0,
                }}
              >
                Dates:{" "}
                <span style={{ color: "rgb(193, 254, 1)" }}>May 4, 18,</span>{" "}
                <span style={{ color: "rgb(254, 34, 236)" }}>
                  June 1, 15, 22,
                </span>{" "}
                <span style={{ color: "rgb(255, 0, 135)" }}>July 13, 20</span>
              </p>
            </div>
            {/* Right content - phone image */}
            <div>
              <img
                src="/assets/Alpha_Phone_5OzpZnWtVovGiIgK4Q2bq.jpg"
                alt="Alpha Youth"
                style={{
                  width: "400px",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>

          {/* Sticker and group photo */}
          <div style={{ position: "relative", marginTop: "32px" }}>
            <img
              src="/assets/Alpha_youth_APpvBuyart-uJ7tTaggeT.png"
              alt="Alpha Youth Sticker"
              id="sticker"
              style={{
                position: "absolute",
                left: "-100px",
                bottom: "-100px",
                width: "300px",
                zIndex: 10,
                transform: "rotate(5deg)",
                objectFit: "contain",
              }}
            />
            <img
              src="/assets/SS_yw0v7rd-kjP80pPAj2fD-.jpg"
              alt="Alpha Youth Group"
              style={{
                width: "100%",
                aspectRatio: "16/9",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          </div>

          {/* What to expect section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "64px",
            }}
          >
            <p
              style={{
                color: "white",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                fontSize: "16px",
                marginBottom: "32px",
              }}
            >
              Here&apos;s what to expect in each session:
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "60px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <img
                  src="/assets/Eat_Together_yLb0B-bZytfZQyPL7UkX_.png"
                  alt="Eat Together"
                  style={{ width: "120px", height: "120px" }}
                />
                <p
                  style={{
                    color: "rgb(193, 254, 1)",
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  Eat Together
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <img
                  src="/assets/Learn_Together_G3V1RjD1RPQhkkdcJFYxO.png"
                  alt="Learn Together"
                  style={{ width: "120px", height: "120px" }}
                />
                <p
                  style={{
                    color: "rgb(254, 34, 236)",
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  Learn Together
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <img
                  src="/assets/Discuss_Together_h9SUQIlfJFNXWRqDjsw9q.png"
                  alt="Discuss Together"
                  style={{ width: "120px", height: "120px" }}
                />
                <p
                  style={{
                    color: "rgb(255, 0, 135)",
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  Discuss Together
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episode List Section */}
      <section
        style={{
          backgroundColor: "black",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 16px 60px",
        }}
      >
        <h2
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: 900,
            fontSize: "60px",
            textTransform: "uppercase",
            lineHeight: 1,
            marginBottom: "32px",
          }}
        >
          Episode List
        </h2>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "16px",
            width: "100%",
            paddingBottom: "16px",
            scrollSnapType: "x",
          }}
        >
          <div
            style={{ minWidth: "40px", pointerEvents: "none" }}
            aria-hidden="true"
          />
          {episodes.map((episode) => (
            <EpisodeCard key={episode.number} episode={episode} />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "32px",
          }}
        >
          <a
            href="#register"
            style={{
              backgroundColor: "rgb(193, 254, 1)",
              color: "rgb(255, 0, 135)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            Sign Up for Alpha Getaway
          </a>
        </div>
      </section>

      {/* Be a Sponsor Section - Purple background */}
      <section
        style={{
          backgroundColor: "rgb(80, 56, 225)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "60px 16px",
        }}
      >
        <h2
          style={{
            color: "rgb(193, 254, 1)",
            textAlign: "center",
            fontWeight: 900,
            fontSize: "60px",
            textTransform: "uppercase",
            lineHeight: 1,
            marginBottom: "32px",
          }}
        >
          Be a Sponsor
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              color: "rgb(80, 56, 225)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "32px",
              maxWidth: "600px",
              width: "100%",
              boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            }}
          >
            <h3
              style={{
                color: "inherit",
                fontWeight: 900,
                textAlign: "center",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Sponsors
            </h3>
            <p
              style={{
                color: "inherit",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                fontSize: "16px",
                margin: 0,
              }}
            >
              Want to make a difference?
              <br />
              <br />
              Become a sponsor to support our youth! Your giving helps provide
              meals for weekly sessions and makes Alpha Weekend Getaway
              accessible to everyone.
              <br />
              <br />
              Every contribution makes a difference.
              <br />
              Thank you for your generosity and heart to invest in the next
              generation!
            </p>
            <a
              href="https://buy.stripe.com/7sI8z98F93yIgtW28t"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "rgb(193, 254, 1)",
                color: "rgb(80, 56, 225)",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "10px 24px",
                borderRadius: "10px",
                textDecoration: "none",
              }}
            >
              Be a Sponsor
            </a>
          </div>
        </div>
      </section>

      {/* FAQs Section - Purple background */}
      <section
        id="faqs"
        style={{
          backgroundColor: "rgb(80, 56, 225)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "60px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <h2
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: 900,
              fontSize: "60px",
              textTransform: "uppercase",
              lineHeight: 1,
              marginBottom: "32px",
              width: "100%",
            }}
          >
            FAQS
          </h2>
          <Accordion.Root
            type="single"
            collapsible
            defaultValue="0"
            style={{ width: "100%", fontFamily: "Inter, sans-serif" }}
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
      <Footer />
    </main>
  );
}
