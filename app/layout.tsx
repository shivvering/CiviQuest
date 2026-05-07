import type { Metadata } from "next";
import { Montserrat, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.civiquest.in"),
  title: "CiviQuest",
  description: "CiviQuest helps kids practice civic sense through fun quizzes.",
  openGraph: {
    title: "CiviQuest",
    description: "CiviQuest helps kids practice civic sense through fun quizzes.",
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
    title: "CiviQuest",
    description: "CiviQuest helps kids practice civic sense through fun quizzes.",
    images: ["/cq-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
