import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CUPL - Canadian Universities Padel League",
  description: "For students, by students. Join the Canadian Universities Padel League.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
