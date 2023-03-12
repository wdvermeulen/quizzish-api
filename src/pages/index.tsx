import { type NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { TopBar } from "../sections/top-bar";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Quizzish</title>
        <meta name="description" content="Quiz-, pubquiz- en puzzelmaker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopBar />
      <main className="hero overflow-auto">
        <div className="hero-body px-2">
          <div className="card bg-base-100 shadow-xl">
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
                <Link href="new-game/start" className="btn-primary btn">
                  Start een nieuw spel
                </Link>
              ) : (
                <button className="btn" onClick={() => void signIn()}>
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
