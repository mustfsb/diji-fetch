import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Dijidemi Test Fetcher",
  description: "Dijidemi testlerini görüntüleme aracı",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <SpeedInsights/>
      <body className={outfit.className}>
        <div className="background-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
