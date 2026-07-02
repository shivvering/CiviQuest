import type { Metadata } from "next";
import { Baloo_2, Montserrat, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

// Sora/Montserrat have no Devanagari glyphs; Baloo 2 keeps Hindi mode
// looking playful instead of falling back to the system font.
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "devanagari"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.civiquest.in"),
  title: "CiviQuest — civic sense, the fun way",
  description:
    "A Duolingo-style civic sense adventure for Indian kids in classes 5–8. Play levels, earn badges, and grow habits that build a better India.",
  openGraph: {
    title: "CiviQuest — civic sense, the fun way",
    description:
      "A Duolingo-style civic sense adventure for Indian kids in classes 5–8, guided by Civvy the dolphin.",
    url: "https://www.civiquest.in",
    siteName: "CiviQuest",
    images: [
      {
        url: "/cq-logo.png",
        width: 112,
        height: 112,
        alt: "CiviQuest logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CiviQuest — civic sense, the fun way",
    description:
      "A Duolingo-style civic sense adventure for Indian kids in classes 5–8, guided by Civvy the dolphin.",
    images: ["/cq-logo.png"],
  },
};

// Applies the saved theme and language before first paint — no flash of
// wrong colors or wrong font.
const themeInitScript = `
try {
  var t = localStorage.getItem("cq-theme");
  if (t === "dark") document.documentElement.dataset.theme = "dark";
  var l = localStorage.getItem("cq-lang");
  if (l === "hi") document.documentElement.lang = "hi";
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${montserrat.variable} ${baloo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
