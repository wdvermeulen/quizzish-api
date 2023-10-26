import { Josefin_Sans } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Toaster } from "react-hot-toast";
import "styles/globals.css";
import { api } from "utils/api";
import Head from "next/head";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    },
  },
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <title>Diaproject</title>
        <meta name="description" content="Quiz-, pubquiz- en puzzelmaker" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/favicon.svg"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
          media="(prefers-color-scheme: light)"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="icon"
          href="/favicon.ico"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-dark-mode.png"
          media="(prefers-color-scheme: dark)"
        />
      </Head>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <div
            className={`${josefin.variable} grid h-full grid-rows-[auto_1fr_auto] overflow-hidden bg-base-200 font-sans`}
          >
            <Component {...pageProps} />
            <Toaster position="bottom-center" />
          </div>
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
