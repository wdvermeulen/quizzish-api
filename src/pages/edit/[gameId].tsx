import { GameType } from "@prisma/client";
import { useSession } from 'next-auth/react';
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
import EditRounds from "../../sections/edit-rounds";
import GameSettings from "../../sections/game-settings";
import { TopBar } from "../../sections/top-bar";
import { api } from "../../utils/api";

enum View {
  SETTINGS,
  ROUNDS,
  PARTICIPANTS,
  RESULTS,
}

const Edit = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();

  const { gameId } = router.query;

  api.game.getDetail.useQuery(
    { id: gameId as string },
    {
      enabled: typeof gameId === "string" && !!sessionData,
      onSuccess: (data) => {
        if (data) {
          setGameName(data.name);
          setGameType(data.type);
        }
      },
    }
  );

  const { data: rounds, refetch: refetchRounds } =
    api.round.getAllForGame.useQuery(
      { gameId: gameId as string },
      {
        enabled: typeof gameId === "string",
      }
    );

  const [presenterView, setPresenterView] = useState(false);
  const [gameName, setGameName] = useState("");
  const [gameType, setGameType] = useState<GameType>(GameType.REGULAR_QUIZ);
  const [currentView, setCurrentView] = useState<View | {roundId: string}>(View.ROUNDS);

  useEffect( () => {
  if (!sessionData) {
    void router.push("../");
  }})

  return (
    <>
      <Head>
        <title>Quizzish - Nieuw spel bouwen</title>
      </Head>
      <TopBar title={gameName}>
        <label
          htmlFor="settings-drawer"
          className="drawer-button btn-primary btn lg:hidden"
        >
          Open menu
        </label>
      </TopBar>
      {typeof gameId === "string" ? (
        <div className="drawer-mobile drawer h-[initial]">
          <input
            id="settings-drawer"
            type="checkbox"
            className="drawer-toggle"
          />
          <main className="drawer-content overflow-auto px-4">
            {currentView === View.SETTINGS && (
              <GameSettings
                setGameName={setGameName}
                setGameType={setGameType}
                gameName={gameName}
                gameType={gameType}
              />
            )}
            {currentView === View.ROUNDS && (
              <EditRounds
                gameType={gameType}
                gameId={gameId}
                refetchRounds={() => void refetchRounds()}
                rounds={rounds}
                editRound={(roundId) => setCurrentView({roundId})}
              ></EditRounds>
            )}
          </main>
          <aside className="drawer-side">
            <label htmlFor="settings-drawer" className="drawer-overlay"></label>
            <ul className="menu w-60 bg-base-200 p-4 text-base-content">
              <li className="form-control">
                <Link href=".." className="btn-outline btn">
                  Terug naar home
                </Link>
              </li>
              <li className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Presentatie weergave</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={presenterView}
                    onChange={(input) => {
                      setPresenterView(input.target.checked);
                    }}
                  />
                </label>
              </li>
              <div className="divider" />
              <li>
                <button
                  className={currentView === View.SETTINGS ? "active" : ""}
                  onClick={() => setCurrentView(View.SETTINGS)}
                >
                  Spel instellingen
                </button>
              </li>
              <li>
                <button
                  className={currentView === View.ROUNDS ? "active" : ""}
                  onClick={() => setCurrentView(View.ROUNDS)}
                >
                  Rondes
                </button>
              </li>
              {rounds?.map((round) => (
                <li key={round.id}>
                  <button
                    className={typeof currentView === 'object' && ('roundId' in currentView) && currentView.roundId === round.id ? "active" : ""}
                    onClick={() => setCurrentView({ roundId: round.id })}
                  >
                    {round.name || `Ronde ${round.index}`}
                  </button>
                </li>
              ))}
              <li className="disabled">
                <button
                  className={currentView === View.PARTICIPANTS ? "active" : ""}
                  disabled
                  onClick={() => setCurrentView(View.PARTICIPANTS)}
                >
                  Deelnemers
                </button>
              </li>
              <li className="disabled">
                <button
                  className={currentView === View.RESULTS ? "active" : ""}
                  disabled
                  onClick={() => setCurrentView(View.RESULTS)}
                >
                  Eindstand
                </button>
              </li>
            </ul>
          </aside>
        </div>
      ) : (
        "Verkeerde url"
      )}
    </>
  );
};

export default Edit;
