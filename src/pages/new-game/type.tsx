import { GameType } from '@prisma/client';
import { type NextPage } from "next";
import { useSession } from 'next-auth/react';
import Head from "next/head";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import GameSettings from '../../sections/game-settings';
import { TopBar } from "../../sections/top-bar";
import { api } from '../../utils/api';

const Type: NextPage = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [gameName, setGameName] = useState("");
  const [gameType, setGameType] = useState<GameType | undefined>(undefined);
  const createGame = api.game.create.useMutation()

  useEffect( () => {
    if (!sessionData) {
      void router.push("../");
    }})

  async function saveGame() {
    if (gameType) {
      return createGame.mutateAsync({
        name: gameName,
        type: gameType,
      }, {
        onSuccess: ({id}) => {
          router.push(`/edit/${id}`);
        },
        onError: (error) => {
          console.error(error);
        }
      });
    }
  }

  return (
    <>
      <Head>
        <title>Quizzish - Nieuw spel bouwen</title>
      </Head>
      <TopBar title={gameName} />
      <main className="hero overflow-auto">
        <div className="hero-body px-2">
          {createGame.isLoading ? (
            "Laden..."
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveGame();
              }}
            >
              <GameSettings
                setGameName={setGameName}
                setGameType={setGameType}
                gameName={gameName}
                gameType={gameType}
              />
              <footer className="mt-10">
              <Link className="btn-outline btn" href="..">
                Annuleren
              </Link>
              <button
                role="submit"
                className="btn btn-primary float-right"
                disabled={!(gameName && gameType)}
              >
                Volgende
              </button>
              </footer>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default Type;
