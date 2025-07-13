import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../../theme-provider"; // app/layout.tsx or pages/_app.tsx (depending on your structure)
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // optional for Tailwind integration
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.variable + " font-sans"}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={["light", "dark"]}
      >
        <Component {...pageProps} />
      </ThemeProvider>
    </main>
  );
}
