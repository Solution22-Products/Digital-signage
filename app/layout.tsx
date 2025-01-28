import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });

// Parallelize the requests for fetching favicon and app name
const fetchGeneralSettings = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('generalSettings')
    .select('favicon, applicationName') 
    .single();

  if (error) {
    console.error('Error fetching general settings:', error);
    return { favicon: null, applicationName: null };
  }

  return {
    favicon: data?.favicon || null,
    applicationName: data?.applicationName || null,
  };
};

export const generateMetadata = async () => {
  // Fetch general settings once to avoid multiple database requests
  const { favicon, applicationName } = await fetchGeneralSettings();

  const defaultFavicon = '../public/images/cropped-favicon-180x180.png';

  return {
    title: applicationName || "Digital signage",
    description: "Digital signage app",
    icons: {
      icon: favicon || defaultFavicon,
      shortcut: favicon || defaultFavicon,
      apple: favicon || defaultFavicon,
      other: {
        rel: 'apple-touch-icon-precomposed',
        url: favicon || defaultFavicon,
      },
    },
  };
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
