import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../../theme-provider"; // app/layout.tsx or pages/_app.tsx (depending on your structure)
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { UserType } from "@/lib/types";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // optional for Tailwind integration
});

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const loggedUserJSON = localStorage.getItem("loggedNoteappUser");
    if (loggedUserJSON) {
      setUser(JSON.parse(loggedUserJSON));
    }
  }, []);

  return (
    <main className={inter.variable + " font-sans"}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={["light", "dark"]}
      >
        <Navbar user={user} />
        <Toaster closeButton duration={3000} expand />

        <Component {...pageProps} user={user} setUser={setUser} />
      </ThemeProvider>
    </main>
  );
}
