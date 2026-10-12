import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="flow-root bg-white">
        <Navbar />
      </header>
      {children}
      <div className="bg-white">
        <Footer />
      </div>
    </>
  );
}
