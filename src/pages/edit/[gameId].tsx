import { GameType } from "@prisma/client";
import { Loader, LoadingPage } from "components/loader";
import { TopBar } from "components/top-bar";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api, handleErrorClientSide } from "utils/api";
import { minutesToString } from "utils/time";

const EditAnswerOption = ({
  id,
  numberOfAnswerOptions,
  refetch,
}: {
  id: string;
  numberOfAnswerOptions: number;
  refetch: () => void;
}) => {
  const [description, setDescription] = useState("");
  const updateAnswerOption = api.answerOption.update.useMutation({
    onError: handleErrorClientSide,
  });

  const { data: answerOption } = api.answerOption.get.useQuery(
    { id },
    {
      onSuccess: (data) => {
        if (data) {
          setDescription(data.description || "");
        }
      },
    }
  );

  function changeIndex(index: number, id: string) {
    updateAnswerOption.mutate(
      {
        id,
        index,
      },
      { onSuccess: () => refetch() }
    );
  }

  function storeAnswerOption(id: string) {
    updateAnswerOption.mutate({
      id,
      description,
    });
  }

  return (
    <article className="card flex-1 bg-base-100 shadow-xl">
      <div className="card-body">
        <header className="card-title">
          Antwoord{" "}
          {answerOption && (
            <select
              className="select-bordered select"
              onChange={(event) =>
                changeIndex(parseInt(event.target.value), answerOption.id)
              }
              defaultValue={answerOption.index}
            >
              {[...Array(numberOfAnswerOptions).keys()].map((index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          )}
        </header>
        <div className="form-control">
          <label className="input-group mt-4">
            <span>Tekst</span>
            <input
              type="text"
              placeholder="Antwoord"
              className="input-bordered input"
              name="round-name"
              value={description}
              onChange={({ target: { value } }) => setDescription(value)}
            />
          </label>
        </div>
        <div className="card-actions mt-2 justify-end">
          <button
            className="btn-primary btn"
            onClick={() => answerOption && storeAnswerOption(answerOption.id)}
            disabled={!answerOption}
          >
            Antwoord bewerken
          </button>
        </div>
      </div>
    </article>
  );
};

const slideRangeToSeconds = [3, 5, 10, 15, 30, 45, 60, 90, 120, 180, 300, null];

const EditSlide = ({ slideId }: { slideId: string }) => {
  const ctx = api.useContext();
  const [slideName, setSlideName] = useState("");
  const [description, setDescription] = useState("");
  const [rawTimeLimit, setRawTimeLimit] = useState(
    slideRangeToSeconds.length - 1
  );
  const updateSlide = api.slide.update.useMutation({
    onSuccess: () => {
      void ctx.game.getDetail.invalidate();
    },
    onError: handleErrorClientSide,
  });
  const deleteSlide = api.slide.delete.useMutation({
    onSuccess: () => {
      void ctx.game.getDetail.invalidate();
    },
    onError: handleErrorClientSide,
  });
  const createAnswerOption = api.answerOption.create.useMutation({
    onSuccess: () => void refetch(),
    onError: handleErrorClientSide,
  });

  const { data: slide, refetch } = api.slide.get.useQuery(
    { slideId },
    {
      onSuccess: (data) => {
        if (data) {
          setSlideName(data.name || "");
          setDescription(data.description || "");
          data.timeLimitInSeconds
            ? setRawTimeLimit(
                slideRangeToSeconds.findIndex(
                  (m) => m === data.timeLimitInSeconds
                )
              )
            : setRawTimeLimit(slideRangeToSeconds.length - 1);
        }
      },
    }
  );

  return (
    <div className="flex flex-wrap gap-4">
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <header className="card-title">
            Slide {slide?.index} {slide?.name && `: ${slide.name}`}
          </header>
          <div className="form-control">
            <label className="input-group mt-4">
              <span>Naam</span>
              <input
                type="text"
                className="input-bordered input"
                name="round-name"
                value={slideName || ""}
                onChange={({ target: { value } }) => setSlideName(value)}
              />
            </label>
          </div>
        </div>
      </article>
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label" htmlFor="description">
              <span className="label-text">Omschrijving of vraag</span>
            </label>
            <textarea
              maxLength={1024}
              className="textarea-bordered textarea h-24"
              value={description}
              id="description"
              name="description"
              onChange={({ target: { value } }) => setDescription(value)}
            ></textarea>
          </div>
        </div>
      </article>
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label" htmlFor="time-limit">
              <span className="label-text">Tijdslimiet</span>
            </label>
            <input
              id="time-limit"
              type="range"
              min="0"
              max={slideRangeToSeconds.length - 1}
              className="range"
              step="1"
              onChange={({ target: { value } }) =>
                setRawTimeLimit(parseInt(value))
              }
              value={rawTimeLimit}
            />
            <p className="text-center">
              {minutesToString(slideRangeToSeconds[rawTimeLimit])}
            </p>
          </div>
        </div>
      </article>
      {slide?.answerOptions.map((answerOption) => (
        <EditAnswerOption
          key={answerOption.id}
          id={answerOption.id}
          numberOfAnswerOptions={slide.answerOptions.length}
          refetch={() => void refetch()}
        />
      ))}
      <button
        className="btn-primary btn"
        onClick={() =>
          updateSlide.mutate({
            id: slideId,
            name: slideName,
            description,
            // description: description.length > 0 ? description : undefined,
            timeLimitInSeconds: slideRangeToSeconds[rawTimeLimit],
          })
        }
      >
        Bewerkingen opslaan
      </button>

      <button
        className="btn-primary btn"
        onClick={() => createAnswerOption.mutate({ slideId })}
      >
        Nieuw antwoord
      </button>

      <button
        className="btn-primary btn"
        onClick={() => deleteSlide.mutate({ slideId })}
      >
        Slide verwijderen
      </button>
    </div>
  );
};

const roundRangeToMinutes = [1, 3, 5, 10, 15, 30, 45, 60, 90, 120, 180, null];

const EditRound = ({ roundId }: { roundId: string }) => {
  const ctx = api.useContext();
  const [roundName, setRoundName] = useState("");
  const [description, setDescription] = useState("");
  const [rawTimeLimit, setRawTimeLimit] = useState(
    roundRangeToMinutes.length - 1
  );
  let storedName: string | null = null;

  const updateRound = api.round.update.useMutation({
    onSuccess: (_, variables) => {
      void ctx.round.get.invalidate();
      if (storedName !== variables.name) {
        void ctx.game.getDetail.invalidate();
      }
    },
  });

  api.round.get.useQuery(
    { roundId },
    {
      onSuccess: (data) => {
        if (data) {
          storedName = data.name;
          setRoundName(data.name || "");
          setDescription(data.description || "");
          data.timeLimitInMinutes
            ? setRawTimeLimit(
                roundRangeToMinutes.findIndex(
                  (m) => m === data.timeLimitInMinutes
                )
              )
            : setRawTimeLimit(roundRangeToMinutes.length - 1);
        }
      },
    }
  );

  function saveRound() {
    updateRound.mutate({
      id: roundId,
      name: roundName,
      description,
      timeLimitInMinutes: roundRangeToMinutes[rawTimeLimit],
    });
  }

  return (
    <div className="flex flex-wrap gap-4">
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <header className="card-title">Naam</header>
          <div className="form-control">
            <label className="input-group mt-4">
              <span>Naam</span>
              <input
                type="text"
                className="input-bordered input"
                name="round-name"
                value={roundName || ""}
                onChange={({ target: { value } }) => setRoundName(value)}
              />
            </label>
          </div>
        </div>
      </article>
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Omschrijving</span>
            </label>
            <textarea
              maxLength={1024}
              className="textarea-bordered textarea h-24"
              value={description}
              onChange={({ target: { value } }) => setDescription(value)}
            ></textarea>
          </div>
        </div>
      </article>
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label" htmlFor="time-limit">
              <span className="label-text">Tijdslimiet</span>
            </label>
            <input
              id="time-limit"
              type="range"
              min="0"
              max={roundRangeToMinutes.length - 1}
              className="range"
              step="1"
              onChange={({ target: { value } }) =>
                setRawTimeLimit(parseInt(value))
              }
              value={rawTimeLimit}
            />
            <p className="text-center">
              {minutesToString(roundRangeToMinutes[rawTimeLimit])}
            </p>
          </div>
        </div>
      </article>
      <button className="btn-primary btn" onClick={saveRound}>
        Bewerkingen opslaan
      </button>
    </div>
  );
};

const gameRangeToMinutes = [15, 30, 45, 60, 90, 120, 180, 360, 480, 960, 1440];

const GameSettings = ({
  id,
  ...defaultValues
}: {
  id: string;
  name: string | null;
  type: GameType | null;
  rawTimeLimit: number;
}) => {
  const router = useRouter();
  const ctx = api.useContext();
  const updateGame = api.game.update.useMutation({
    onSuccess: () => {
      void ctx.game.getDetail.invalidate();
    },
    onError: handleErrorClientSide,
  });
  const deleteGame = api.game.delete.useMutation({
    onSuccess: () => {
      void router.push("../new-game");
    },
    onError: handleErrorClientSide,
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const rawTimeLimit = watch("rawTimeLimit");

  return (
    <form
      className="flex min-h-full flex-col justify-between gap-4 pb-4"
      onSubmit={handleSubmit((data) => {
        updateGame.mutate({ ...data, id });
      })}
    >
      <div className="flex flex-wrap gap-4">
        <article className="card flex-1 bg-base-100 shadow-xl">
          <fieldset className="card-body">
            <div className="form-control">
              <legend className="card-title">Naam van dit spel</legend>
              <label className="input-group mt-4">
                <span>Naam</span>
                <input
                  type="text"
                  placeholder="Quizzish"
                  className="input-bordered input"
                  maxLength={64}
                  {...register("name", {
                    maxLength: {
                      value: 64,
                      message: "Mag niet langer zijn dan 64 karakters",
                    },
                  })}
                />
              </label>
              <p className="text-error">{errors.name?.message}</p>
            </div>
          </fieldset>
        </article>
        <article className="card flex-1 bg-base-100 shadow-xl">
          <fieldset className="card-body">
            <legend className="card-title float-left">Speltype</legend>
            <label className="label cursor-pointer">
              <span className="label-text mr-4">Quiz</span>
              <input
                type="radio"
                className="radio"
                value={GameType.REGULAR_QUIZ}
                {...register("type")}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text mr-4">Pubquiz</span>
              <input
                type="radio"
                className="radio"
                value={GameType.PUBQUIZ}
                {...register("type")}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text mr-4">Escape Room</span>
              <input
                type="radio"
                className="radio"
                value={GameType.ESCAPE_ROOM}
                {...register("type")}
              />
            </label>
          </fieldset>
        </article>
        <article className="card flex-1 bg-base-100 shadow-xl">
          <fieldset className="card-body">
            <div className="form-control">
              <label className="card-title" htmlFor="time-limit">
                Tijdslimiet
              </label>
              <input
                id="time-limit"
                type="range"
                min="0"
                max={gameRangeToMinutes.length - 1}
                className="range mt-4"
                step="1"
                {...register("rawTimeLimit")}
              />
              <p className="text-center">
                {minutesToString(gameRangeToMinutes[rawTimeLimit])}
              </p>
            </div>
          </fieldset>
        </article>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          className="btn-outline btn"
          onClick={() => deleteGame.mutate({ id })}
          disabled={updateGame.isLoading}
        >
          Spel verwijderen
        </button>
        <button
          type="submit"
          className="btn-primary btn ml-auto"
          disabled={updateGame.isLoading}
        >
          Bewerkingen opslaan
        </button>
      </div>
    </form>
  );
};

enum View {
  SETTINGS,
  PARTICIPANTS,
  RESULTS,
}

const Edit = () => {
  const router = useRouter();
  const { status } = useSession();
  const { gameId } = router.query;
  const [rawTimeLimit, setRawTimeLimit] = useState(0);
  const [presenterView, setPresenterView] = useState(false);
  const [currentView, setCurrentView] = useState<
    View | { roundId: string } | { slideId: string }
  >(View.SETTINGS);
  const createSlide = api.slide.create.useMutation({
    onSuccess: () => void refetch(),
    onError: handleErrorClientSide,
  });
  const createRound = api.round.create.useMutation({
    onSuccess: () => void refetch(),
    onError: handleErrorClientSide,
  });

  const { data: game, refetch } = api.game.getDetail.useQuery(
    { id: gameId as string },
    {
      enabled: typeof gameId === "string" && status === "authenticated",
      onSuccess: (data) => {
        if (data) {
          setRawTimeLimit(
            gameRangeToMinutes.findIndex(
              (item) => item === data.timeLimitInMinutes
            )
          );
        } else {
          void router.push("../");
        }
      },
    }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("../");
    }
  }, [status, router]);

  if (status === "loading") return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Quizzish - Nieuw spel bouwen</title>
      </Head>
      <TopBar title={game?.name}>
        <label
          htmlFor="settings-drawer"
          className="btn-primary drawer-button btn lg:hidden"
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
            {game && currentView === View.SETTINGS && (
              <GameSettings
                id={game.id}
                name={game.name}
                type={game.type}
                rawTimeLimit={rawTimeLimit}
              />
            )}
            {game &&
              typeof currentView === "object" &&
              "roundId" in currentView && (
                <EditRound roundId={currentView.roundId} />
              )}
            {game &&
              typeof currentView === "object" &&
              "slideId" in currentView && (
                <EditSlide slideId={currentView.slideId} />
              )}
          </main>
          <aside className="drawer-side">
            <label htmlFor="settings-drawer" className="drawer-overlay"></label>
            <ul className="menu w-60 max-w-[80vw] bg-base-200 p-4 text-base-content">
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
                    disabled
                  />
                </label>
              </li>
              <li>
                <button
                  className={currentView === View.SETTINGS ? "active" : ""}
                  onClick={() => setCurrentView(View.SETTINGS)}
                >
                  Spel instellingen
                </button>
              </li>
              <div className="divider" />

              {game ? (
                <>
                  {game.rounds.map((round) => (
                    <div key={round.id} className="collapse-arrow collapse">
                      <input type="checkbox" className="ml-auto w-12" />
                      <div className="collapse-title py-2 pl-0">
                        <button
                          className={
                            typeof currentView === "object" &&
                            "roundId" in currentView &&
                            currentView.roundId === round.id
                              ? "active btn"
                              : "btn"
                          }
                          onClick={() => setCurrentView({ roundId: round.id })}
                        >
                          {round.name || `Ronde ${round.index}`}
                        </button>
                      </div>
                      <ul className="collapse-content p-0">
                        {round.slides.map((slide) => (
                          <li key={slide.id}>
                            <button
                              className={
                                typeof currentView === "object" &&
                                "slideId" in currentView &&
                                currentView.slideId === slide.id
                                  ? "active"
                                  : ""
                              }
                              onClick={() =>
                                setCurrentView({ slideId: slide.id })
                              }
                            >
                              {slide.name || `Slide ${slide.index}`}
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={() =>
                              createSlide.mutate({ roundId: round.id })
                            }
                            className="btn-outline btn"
                            disabled={createSlide.isLoading}
                          >
                            Slide toevoegen
                          </button>
                        </li>
                      </ul>
                    </div>
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
                    <button
                      className={
                        currentView === View.PARTICIPANTS ? "active" : ""
                      }
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
                </>
              ) : (
                <li className="disabled">
                  <Loader />
                </li>
              )}
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
