import { Josefin_Sans } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Toaster } from "react-hot-toast";
import "styles/globals.css";
import { api } from "utils/api";

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
  );
};

export default api.withTRPC(MyApp);
