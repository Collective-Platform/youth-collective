import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { getCurrentUser } from "../../lib/auth/user";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <>
      <header className="flow-root bg-white">
        <Navbar userEmail={user?.email} />
      </header>
      {children}
      <div className="bg-white">
        <Footer />
      </div>
    </>
  );
}
