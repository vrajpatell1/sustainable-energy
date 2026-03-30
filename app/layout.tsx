import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Sustainable Energy Intelligence Hub",
  description:
    "A full-stack sustainable energy platform for cloud cost calculation, AI token efficiency, and cloud provider comparison."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
