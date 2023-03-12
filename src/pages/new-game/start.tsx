import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { TopBar } from "../../sections/top-bar";

const Start: NextPage = () => {
  return (
    <>
      <Head>
        <title>Quizzish - Nieuw spel starten</title>
      </Head>
      <TopBar />
      <main className="hero overflow-auto">
        <div className="hero-body px-2">
          <h2 className="mb-5 text-center text-2xl font-bold">
            Start een nieuw spel
          </h2>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <Link className="btn-primary btn" href="type">
                Nieuw spel bouwen
              </Link>
              <div className="divider">of</div>
              <Link className="btn-disabled btn" href="load">
                Opgeslagen spel inladen
              </Link>
              <i>Nog geen spellen opgeslagen</i>
              <div className="divider">of</div>
              <Link className="btn-disabled btn" href="store">
                Winkel openen
              </Link>
              <i>Winkel opent binnenkort</i>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Start;
