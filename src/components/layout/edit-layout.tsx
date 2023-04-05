import type { Round } from "@prisma/client";
import { Loader, LoadingPage } from "components/loader";
import { TopBar } from "components/top-bar";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { type PropsWithChildren, useEffect, useState } from "react";
import { api, handleErrorClientSide } from "utils/api";

function Slides({ gameId, roundId }: { gameId: string; roundId: string }) {
  const router = useRouter();
  const slides = api.slide.getForRound.useQuery({
    roundId,
  });

  if (slides.isLoading) {
    return <Loader />;
  }

  return (
    <>
      {slides.data?.map((slide) => (
        <li key={slide.id}>
          <Link
            href={`/edit/${gameId}/${roundId}/${slide.id}`}
            className={
              router.asPath === `/edit/${gameId}/${roundId}/${slide.id}`
                ? "active"
                : ""
            }
          >
            {slide.name || `Slide ${slide.index}`}
          </Link>
        </li>
      ))}
    </>
  );
}

function SidebarRound({
  round,
  gameId,
  isLoading,
}: {
  round: Round;
  gameId: string;
  isLoading: boolean;
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(
    router.asPath.startsWith(`/edit/${gameId}/${round.id}`)
  );
  const createSlide = api.slide.create.useMutation({
    onSuccess: (data) =>
      Promise.all([
        router.push(
          "/edit/[gameId]/[roundId]/[slideId]",
          `/edit/${gameId}/${data.roundId}/${data.id}`
        ),
      ]),
    onError: handleErrorClientSide,
  });

  useEffect(() => {
    setIsExpanded(router.asPath.startsWith(`/edit/${gameId}/${round.id}`));
  }, [router.asPath]);

  if (isLoading) {
    return <Loader />;
  }

  if (!round) {
    return null;
  }

  return (
    <li key={round.id} className="collapse-arrow collapse">
      <input
        type="checkbox"
        className="ml-auto w-12"
        checked={isExpanded}
        onChange={() => setIsExpanded(!isExpanded)}
      />
      <Link
        href={`/edit/${gameId}/${round.id}`}
        className={
          router.asPath === `/edit/${gameId}/${round.id}`
            ? "collapse-title btn-primary active btn"
            : "collapse-title btn-ghost btn"
        }
      >
        {round.name || `Ronde ${round.index}`}
      </Link>
      <ul className="collapse-content relative left-0 block p-0">
        {isExpanded && <Slides roundId={round.id} gameId={gameId} />}
        <li>
          <button
            onClick={() => createSlide.mutate({ roundId: round.id })}
            className="btn-outline btn"
            disabled={createSlide.isLoading}
          >
            Slide toevoegen
          </button>
        </li>
      </ul>
    </li>
  );
}

const Sidebar = ({ gameId }: { gameId: string }) => {
  const router = useRouter();
  const createRound = api.round.create.useMutation({
    onSuccess: (data) =>
      Promise.all([
        router.push("/edit/[gameId]/[roundId]/", `/edit/${gameId}/${data.id}/`),
        refetch(),
      ]),
    onError: handleErrorClientSide,
  });

  const {
    data: rounds,
    refetch,
    isLoading,
  } = api.round.getForGame.useQuery({
    gameId,
  });

  return (
    <nav className="drawer-side">
      <label htmlFor="settings-drawer" className="drawer-overlay"></label>
      <ul className="menu w-60 max-w-[80vw] bg-base-200 p-4 text-base-content">
        <li className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Presentatie weergave</span>
            <input type="checkbox" className="toggle" disabled />
          </label>
        </li>
        <li>
          <Link
            href={`/edit/${gameId}`}
            className={
              router.pathname === `/edit/[gameId]`
                ? "active btn"
                : "btn-ghost btn"
            }
          >
            Spel instellingen
          </Link>
        </li>
        <div className="divider" />

        {rounds ? (
          <>
            {rounds.map((round) => (
              <SidebarRound
                key={round.id}
                round={round}
                gameId={gameId}
                isLoading={isLoading}
              />
            ))}
            <li>
              <button
                onClick={() => createRound.mutate({ gameId })}
                className="btn-outline btn"
                disabled={createRound.isLoading}
              >
                Ronde toevoegen
              </button>
            </li>
            <div className="divider" />
            <li className="disabled">
              <Link
                href={`/edit/${gameId}/participants`}
                className={
                  router.pathname === `/edit/[gameId]/participants`
                    ? "active"
                    : ""
                }
              >
                Deelnemers
              </Link>
            </li>
            <li className="disabled">
              <Link
                href={`/edit/${gameId}/results`}
                className={
                  router.pathname === `/edit/[gameId]/results` ? "active" : ""
                }
              >
                Eindstand
              </Link>
            </li>
          </>
        ) : (
          <li className="disabled">
            <Loader />
          </li>
        )}
      </ul>
    </nav>
  );
};

const EditLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { status } = useSession();
  const { gameId } = router.query;

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("../");
    }
  }, [status]);

  if (status === "loading") return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Quizzish - Nieuw spel bouwen</title>
      </Head>
      <TopBar />
      <div className="grid grid-rows-[auto_1fr] overflow-auto lg:grid-rows-1">
        <div className="navbar lg:hidden">
          <div className="navbar-start">
            <label
              htmlFor="settings-drawer"
              className="btn-primary drawer-button btn"
            >
              Open menu
            </label>
          </div>
        </div>

        {typeof gameId === "string" ? (
          <div className="drawer-mobile drawer h-[initial]">
            <input
              id="settings-drawer"
              type="checkbox"
              className="drawer-toggle"
            />
            <main className="drawer-content overflow-auto px-4">
              {children}
            </main>
            <Sidebar gameId={gameId} />
          </div>
        ) : (
          "Verkeerde url"
        )}
      </div>
    </>
  );
};

export default EditLayout;
