import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../../theme-provider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark", "violet", "violet-light"]}
    >
      <Component {...pageProps} />;
    </ThemeProvider>
  );
}
