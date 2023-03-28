import { Josefin_Sans } from "@next/font/google";
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

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div
        className={`${josefin.variable} grid h-full grid-rows-[auto_1fr_auto] bg-base-200 font-sans`}
      >
        <Component {...pageProps} />
        <Toaster position="bottom-center" />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
