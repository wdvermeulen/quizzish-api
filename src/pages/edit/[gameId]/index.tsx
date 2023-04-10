import { GameType } from "@prisma/client";
import EditLayout from "components/layout/edit-layout";
import { Loader } from "components/loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { api, handleErrorClientSide } from "utils/api";
import { minutesToString } from "utils/time";
import Textarea from "components/form/text-area";

const gameRangeToMinutes = [15, 30, 45, 60, 90, 120, 180, 360, 480, 960, 1440];

const GameSettings = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data: game, isLoading } = api.game.get.useQuery(
    { id },
    {
      onSuccess: (data) => {
        if (data) {
          reset({
            name: data.name || "",
            type: data.type,
            description: data.description || "",
            rawTimeLimit: gameRangeToMinutes.findIndex(
              (m) => m === data.timeLimitInMinutes
            ),
          });
        }
      },
    }
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm({
    defaultValues: {
      name: game?.name || "",
      type: game?.type,
      description: game?.description || "",
      rawTimeLimit:
        (game &&
          gameRangeToMinutes.findIndex((m) => m === game.timeLimitInMinutes)) ||
        gameRangeToMinutes.length - 1,
    },
  });
  const updateGame = api.game.update.useMutation({
    onError: handleErrorClientSide,
  });
  const deleteGame = api.game.delete.useMutation({
    onSuccess: () => {
      void router.push("../new-game");
    },
    onError: handleErrorClientSide,
  });
  const rawTimeLimit = watch("rawTimeLimit");

  if (isLoading) {
    return <Loader />;
  }

  if (!game) {
    return <div>Kon dit spel niet vinden</div>;
  }

  return (
    <form
      className="flex min-h-full flex-col justify-between gap-4 pb-4"
      onSubmit={handleSubmit((data) => {
        updateGame.mutate({
          id,
          ...data,
          name: data.name || "",
          timeLimitInMinutes: gameRangeToMinutes[data.rawTimeLimit],
        });
      })}
    >
      <div className="flex flex-wrap gap-4">
        <article className="card flex-1 bg-base-100 shadow-xl">
          <fieldset className="card-body">
            <label className="card-title" htmlFor="name">
              Naam van dit spel
            </label>
            <Textarea
              id="name"
              placeholder="Quizzish"
              maxLength={64}
              register={register("name", {
                required: "Dit veld is verplicht",
                maxLength: {
                  value: 64,
                  message: "Mag niet langer zijn dan 64 karakters",
                },
              })}
            />
            <p className="text-error">{errors.name?.message}</p>
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
            <label className="label cursor-pointer">
              <span className="label-text mr-4">Custom</span>
              <input
                type="radio"
                className="radio"
                value={GameType.CUSTOM}
                {...register("type")}
              />
            </label>
          </fieldset>
        </article>
        <article className="card flex-1 bg-base-100 shadow-xl">
          <div className="card-body">
            <label className="card-title" htmlFor="description">
              Omschrijving
            </label>
            <Textarea
              id="description"
              maxLength={1024}
              register={register("description", {
                maxLength: {
                  value: 1024,
                  message: "Mag niet langer zijn dan 1024 karakters",
                },
              })}
            />
          </div>
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
                list="time-list"
                aria-valuetext={minutesToString(
                  gameRangeToMinutes[rawTimeLimit]
                )}
                {...register("rawTimeLimit")}
              />
              <datalist id="time-list">
                {gameRangeToMinutes.map((minutes) => (
                  <option key={minutes} value={minutes} />
                ))}
              </datalist>
              <p className="text-center">
                {minutesToString(gameRangeToMinutes[rawTimeLimit])}
              </p>
            </div>
          </fieldset>
        </article>
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          className="space-between btn-outline btn flex-1 sm:flex-none"
          onClick={() => deleteGame.mutate({ id })}
          disabled={updateGame.isLoading}
        >
          Spel verwijderen
        </button>
        <button
          className="btn-primary btn flex-1 sm:ml-auto sm:flex-none"
          disabled={updateGame.isLoading || !isDirty || !isValid}
        >
          Bewerkingen opslaan
        </button>
      </div>
    </form>
  );
};

const Edit = () => {
  const {
    push,
    query: { gameId },
  } = useRouter();
  const session = useSession();

  if (session.status === "unauthenticated") {
    void push("/");
  }
  if (!gameId || session.status !== "authenticated") {
    return <Loader />;
  }
  if (Array.isArray(gameId)) {
    return <>Ongeldige url</>;
  }

  return (
    <EditLayout>
      <GameSettings id={gameId} />
    </EditLayout>
  );
};

export default Edit;
