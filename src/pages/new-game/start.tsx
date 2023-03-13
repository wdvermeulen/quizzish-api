import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { TopBar } from "../../sections/top-bar";
import { api } from "../../utils/api";

const Start: NextPage = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { data: games } = api.game.getAll.useQuery();

  useEffect(() => {
    if (!sessionData) {
      void router.push("../");
    }
  });

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
              {games?.map((game) => (
                <div key={game.id}>
                  <Link className="btn-primary btn w-full" href={`../edit/${game.id}`}>
                    {game.name} inladen
                  </Link>
                  <div className="divider">of</div>
                </div>
              ))}
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
