import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizIt AI - Generate Quizzes from Any URL",
  description: "Transform any web page into an interactive quiz using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}


