"use client";

import * as Accordion from "@radix-ui/react-accordion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    question: "What should I bring?",
    answer: "Placeholder answer - details coming soon.",
  },
  {
    question: "Is food provided?",
    answer: "Placeholder answer - details coming soon.",
  },
  {
    question: "What if I can't afford the fee?",
    answer: "Placeholder answer - details coming soon.",
  },
  {
    question: "Can I join with friends?",
    answer: "Placeholder answer - details coming soon.",
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
  <Accordion.Item
    value={value}
    style={{
      borderBottom: "1px solid rgba(255,255,255,0.2)",
      width: "100%",
    }}
  >
    <Accordion.Header>
      <Accordion.Trigger
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "white",
          fontSize: "18px",
          fontWeight: 600,
          textAlign: "left",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {question}
        <ChevronDown className="w-5 h-5 transition-transform duration-200 data-[state=open]:rotate-180" />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content
      style={{
        overflow: "hidden",
        color: "rgba(255,255,255,0.8)",
        fontSize: "16px",
        lineHeight: 1.6,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ paddingBottom: "20px" }}>{answer}</div>
    </Accordion.Content>
  </Accordion.Item>
);

export default function ProgramPage() {
  return (
    <main style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          backgroundColor: "#0a1628",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "100px 16px 60px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(40px, 8vw, 72px)",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 1,
            marginBottom: "24px",
          }}
        >
          Collective Youth
          <br />
          Summer Program
        </h1>
        <p
          style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            maxWidth: "700px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.9)",
            marginBottom: "40px",
          }}
        >
          A 1 week program designed to help you discover more about yourself and
          God, learn essential life skills, and connect meaningfully with the
          world beyond you.
        </p>

        {/* Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            maxWidth: "800px",
            width: "100%",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FF6B35",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: "4px" }}>When</p>
            <p style={{ fontSize: "14px" }}>March 23 - 29, 2026</p>
          </div>
          <div
            style={{
              backgroundColor: "#FF6B35",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: "4px" }}>Where</p>
            <p style={{ fontSize: "14px" }}>Collective Church + Airbnb</p>
          </div>
          <div
            style={{
              backgroundColor: "#FF6B35",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: "4px" }}>Fee</p>
            <p style={{ fontSize: "14px" }}>RM599 (all inclusive)</p>
          </div>
          <div
            style={{
              backgroundColor: "#FF6B35",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: "4px" }}>Age</p>
            <p style={{ fontSize: "14px" }}>16-18 years old</p>
          </div>
        </div>

        <p style={{ color: "#FF6B35", fontWeight: 600 }}>
          Deadline to register: March 8, 2026
        </p>

        {/* Hero Image Placeholder */}
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            height: "400px",
            backgroundColor: "#1a2a44",
            borderRadius: "16px",
            marginTop: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.4)",
            fontSize: "18px",
          }}
        >
          [Hero Image Placeholder]
        </div>
      </section>

      {/* Best School Break Section */}
      <section
        style={{
          backgroundColor: "black",
          color: "white",
          padding: "80px 16px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Get Ready for the Best
          <br />
          School Break Week
        </h2>
        <p
          style={{
            fontSize: "24px",
            color: "#FF6B35",
            fontWeight: 600,
            marginBottom: "48px",
          }}
        >
          Step into a life worth living
        </p>

        <p
          style={{
            fontSize: "20px",
            marginBottom: "32px",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Does this sound like you?
        </p>

        {/* Pain Points */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {[
            "You're tired of going through the motions or feeling stuck, but not sure how to get out of it",
            "You're seeking to discover more about who God is and who He is calling you to be",
            "You're eager and ready to learn, grow, and step out of your comfort zone",
            "You're searching for answers to questions about life, culture, faith, etc., but are not sure what to believe",
          ].map((text, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#0a1628",
                padding: "24px",
                borderRadius: "10px",
                borderLeft: "4px solid #FF6B35",
                textAlign: "left",
                fontSize: "16px",
                lineHeight: 1.5,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* You Were Created for More Section */}
      <section
        style={{
          backgroundColor: "#0a1628",
          color: "white",
          padding: "80px 16px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: "48px",
          }}
        >
          You were created for more 💥
        </h2>

        {/* 3 Column Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            maxWidth: "1000px",
            margin: "0 auto 60px",
          }}
        >
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              style={{
                backgroundColor: "white",
                color: "black",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "200px",
                  backgroundColor: "#1a2a44",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                [Image {num}]
              </div>
              <div style={{ padding: "24px" }}>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  Headline {num}
                </h3>
                <p style={{ color: "rgba(0,0,0,0.7)", fontSize: "14px" }}>
                  Placeholder description text goes here.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "40px",
            borderTop: "2px solid #FF6B35",
            borderBottom: "2px solid #FF6B35",
          }}
        >
          <p
            style={{
              fontSize: "clamp(18px, 3vw, 24px)",
              fontStyle: "italic",
              marginBottom: "16px",
              lineHeight: 1.5,
            }}
          >
            "Sometimes a calling is staring us in the face, we just need to make
            eye contact."
          </p>
          <p style={{ color: "#FF6B35", fontWeight: 600 }}>— John Mark Comer</p>
        </div>

        <a
          href="#register"
          style={{
            display: "inline-block",
            marginTop: "48px",
            backgroundColor: "#FF6B35",
            color: "white",
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "16px 32px",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "18px",
          }}
        >
          Register Here
        </a>
      </section>

      {/* What's In Store Section */}
      <section
        style={{
          backgroundColor: "black",
          color: "white",
          padding: "80px 16px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: "48px",
          }}
        >
          What's in store 👀
        </h2>

        {/* 4 Quadrant Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
            maxWidth: "900px",
            margin: "0 auto 48px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FF6B35",
              padding: "32px",
              borderRadius: "16px",
            }}
          >
            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
              GROW
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.6 }}>
              Scripture Workshops
              <br />
              Skills Training
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#0a1628",
              padding: "32px",
              borderRadius: "16px",
              border: "2px solid #FF6B35",
            }}
          >
            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
              BE IN COMMUNITY
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.6 }}>
              Worship + Pray Together
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#0a1628",
              padding: "32px",
              borderRadius: "16px",
              border: "2px solid #FF6B35",
            }}
          >
            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
              EXPLORE
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.6 }}>
              Placeholder activities
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#FF6B35",
              padding: "32px",
              borderRadius: "16px",
            }}
          >
            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
              SERVE
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.6 }}>
              Placeholder activities
            </p>
          </div>
        </div>

        {/* Image Placeholder */}
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            height: "400px",
            backgroundColor: "#1a2a44",
            borderRadius: "16px",
            margin: "0 auto 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.4)",
            fontSize: "18px",
          }}
        >
          [Program Image Placeholder]
        </div>

        <a
          href="#register"
          style={{
            display: "inline-block",
            backgroundColor: "#FF6B35",
            color: "white",
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "16px 32px",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "18px",
          }}
        >
          I Want In!!
        </a>
      </section>

      {/* Not Just Another Camp */}
      <section
        style={{
          backgroundColor: "#0a1628",
          color: "white",
          padding: "80px 16px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 600,
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Not just another camp or program.
        </p>
      </section>

      {/* FAQ Section */}
      <section
        id="faqs"
        style={{
          backgroundColor: "black",
          color: "white",
          padding: "80px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 900,
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            We Know You've Got Questions
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

      {/* Contact Section */}
      <section
        style={{
          backgroundColor: "#0a1628",
          color: "white",
          padding: "80px 16px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "24px",
          }}
        >
          For any inquiries, please contact:
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <p>[Contact Person]</p>
          <p>[Email Address]</p>
          <p>[Website]</p>
          <p>[YouTube]</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
