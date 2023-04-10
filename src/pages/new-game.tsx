import { TopBar } from "components/top-bar";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "utils/api";

const NewGame: NextPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const { data: games } = api.game.getAll.useQuery();
  const createGame = api.game.create.useMutation({
    onSuccess: ({ id }) => {
      void router.push(`/edit/${id}`);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("../");
    }
  }, [status, router]);

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
          <article className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <button
                className="btn-primary btn"
                onClick={() => createGame.mutate()}
              >
                Nieuw spel bouwen
              </button>
              {games?.map((game) => (
                <div key={game.id}>
                  <div className="divider">of</div>
                  <Link
                    className="btn-primary btn w-full"
                    href={`../edit/${game.id}`}
                  >
                    {game.name} inladen
                  </Link>
                </div>
              ))}
            </div>
          </article>
        </div>
      </main>
    </>
  );
};

export default NewGame;
