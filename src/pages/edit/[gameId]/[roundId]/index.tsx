import EditLayout from "components/layout/edit-layout";
import { Loader } from "components/loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { api, handleErrorClientSide } from "utils/api";
import { minutesToString } from "utils/time";
import Textarea from "components/form/text-area";

const NextRound = ({
  nextRoundIdInput,
  gameId,
}: {
  gameId: string;
  nextRoundIdInput: UseFormRegisterReturn;
}) => {
  const otherRounds = api.round.getForGame.useQuery({
    gameId,
  });

  if (otherRounds.isLoading) {
    return <Loader />;
  }

  return (
    <article className="card flex-1 bg-base-100 shadow-xl">
      <div className="card-body">
        <label className="card-title" htmlFor="next-round">
          Volgende ronde
        </label>
        <select
          id="next-round"
          className="input-bordered input"
          {...nextRoundIdInput}
        >
          <option value={undefined}>Geen</option>
          {otherRounds.data?.map((round) => (
            <option key={round.id} value={round.id}>
              {round.name || `Ronde ${round.index}`}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
};

const roundRangeToMinutes = [1, 3, 5, 10, 15, 30, 45, 60, 90, 120, 180, null];

const EditRound = ({ id }: { id: string }) => {
  const { data: round, refetch } = api.round.get.useQuery(
    { id },
    {
      onSuccess: (data) => {
        if (data) {
          const rawTimeLimit = roundRangeToMinutes.findIndex(
            (m) => m === data.timeLimitInMinutes
          );
          reset({
            nextRoundId: data.nextRoundId || "",
            name: data.name || "",
            description: data.description || "",
            rawTimeLimit:
              rawTimeLimit !== -1
                ? rawTimeLimit
                : roundRangeToMinutes.length - 1,
          });
        }
      },
    }
  );

  useEffect(() => {
    void refetch();
  }, [id, refetch]);

  const {
    reset,
    register,
    handleSubmit,
    watch,
    formState: { isDirty, dirtyFields, isValid },
  } = useForm({
    defaultValues: {
      nextRoundId: round?.nextRoundId || "",
      name: round?.name || "",
      description: round?.description || "",
      rawTimeLimit: round
        ? roundRangeToMinutes.findIndex((m) => m === round.timeLimitInMinutes)
        : roundRangeToMinutes.length - 1,
    },
  });
  const ctx = api.useContext();
  const updateRound = api.round.update.useMutation({
    onSuccess: () => {
      if (dirtyFields.name) {
        void ctx.round.getForGame.invalidate();
      }
      void refetch();
    },
    onError: handleErrorClientSide,
  });
  const router = useRouter();
  const deleteRound = api.round.delete.useMutation({
    onSuccess: async (data) => {
      await ctx.round.getForGame.invalidate();
      return router.push("/edit/[gameId]", `/edit/${data.gameId}`);
    },
  });
  const rawTimeLimit = watch("rawTimeLimit");

  if (!round) {
    return <Loader />;
  }

  return (
    <form
      className="flex min-h-full flex-col justify-between gap-4 pb-4"
      onSubmit={handleSubmit((data) => {
        updateRound.mutate({
          id,
          ...data,
          name: data.name || "",
          timeLimitInMinutes: roundRangeToMinutes[data.rawTimeLimit],
        });
      })}
    >
      <div className="flex flex-wrap gap-4">
        <article className="card flex-1 bg-base-100 shadow-xl">
          <div className="card-body">
            <label className="card-title" htmlFor="name">
              Naam van deze ronde
            </label>
            <Textarea
              id="name"
              maxLength={128}
              register={register("name", {
                maxLength: {
                  value: 128,
                  message: "Mag niet langer zijn dan 128 karakters",
                },
              })}
            />
          </div>
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
          <div className="card-body">
            <label className="card-title" htmlFor="time-limit">
              Tijdslimiet
            </label>
            <input
              id="time-limit"
              type="range"
              min="0"
              max={roundRangeToMinutes.length - 1}
              className="range"
              step="1"
              aria-valuetext={minutesToString(
                roundRangeToMinutes[rawTimeLimit]
              )}
              {...register("rawTimeLimit")}
            />
            <p className="text-center">
              {minutesToString(roundRangeToMinutes[rawTimeLimit])}
            </p>
          </div>
        </article>
        <NextRound
          nextRoundIdInput={register("nextRoundId")}
          gameId={round.gameId}
        />
      </div>
      <div className="flex flex-wrap justify-between">
        <button
          type="button"
          className="btn-outline btn"
          onClick={() => deleteRound.mutate({ id })}
          disabled={updateRound.isLoading}
        >
          Ronde verwijderen
        </button>
        <button
          className="btn-primary btn ml-auto"
          disabled={updateRound.isLoading || !isDirty || !isValid}
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
    query: { roundId },
  } = useRouter();
  const session = useSession();

  if (session.status === "unauthenticated") {
    void push("/");
  }
  if (!roundId || session.status !== "authenticated") {
    return <Loader />;
  }
  if (Array.isArray(roundId)) {
    return <>Ongeldige url</>;
  }
  return (
    <EditLayout>
      <EditRound id={roundId} />
    </EditLayout>
  );
};

export default Edit;
