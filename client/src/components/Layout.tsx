import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PreLaunchBanner from "./PreLaunchBanner";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <PreLaunchBanner />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
