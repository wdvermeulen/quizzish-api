import { TopBar } from "components/top-bar";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Quizzish</title>
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
      <TopBar />
      <main className="hero overflow-auto">
        <div className="hero-body px-2">
          <article className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <label>
                Doe mee
                <input
                  type="text"
                  id="startcode"
                  placeholder="Startcode"
                  className="input-bordered input input-lg mt-1 w-full max-w-xs"
                />
              </label>
              <div className="divider">of</div>
              {sessionData ? (
                <Link href="new-game" className="btn-primary btn">
                  Start een nieuw spel
                </Link>
              ) : (
                <button
                  className="btn"
                  type="button"
                  onClick={() => void signIn()}
                >
                  Log in
                </button>
              )}
            </div>
          </article>
        </div>
      </main>
    </>
  );
};

export default Home;
