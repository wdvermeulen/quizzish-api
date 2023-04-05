import EditLayout from "components/layout/edit-layout";
import { Loader } from "components/loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { api, handleErrorClientSide } from "utils/api";
import { minutesToString } from "utils/time";

const EditAnswerOption = ({ id }: { id: string }) => {
  const { data: answerOption, isLoading } = api.answerOption.get.useQuery(
    { id },
    {
      onSuccess: (data) => {
        if (data) {
          reset({
            isCorrect: answerOption?.isCorrect || false,
            description: answerOption?.description || "",
            earlyPoints: answerOption?.earlyPoints || 0,
            latePoints: answerOption?.latePoints || 0,
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
      isCorrect: answerOption?.isCorrect || false,
      description: answerOption?.description || "",
      earlyPoints: answerOption?.earlyPoints || 0,
      latePoints: answerOption?.latePoints || 0,
    },
  });

  const updateAnswerOption = api.answerOption.update.useMutation({
    onError: handleErrorClientSide,
  });

  const deleteAnswerOption = api.answerOption.delete.useMutation({
    onError: handleErrorClientSide,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!answerOption) {
    return <div>Antwoord niet gevonden</div>;
  }

  return (
    <div className="collapse">
      <input type="checkbox" />
      <div className="collapse-title text-xl font-medium">
        Antwoord {answerOption.index}
      </div>
      <div className="collapse-content">
        <form
          className="flex min-h-full flex-col justify-between gap-4 pb-4"
          onSubmit={handleSubmit((data) =>
            updateAnswerOption.mutate({
              id,
              ...data,
            })
          )}
        >
          <div className="flex flex-wrap gap-4">
            <article className="card flex-1 bg-base-100 shadow-xl">
              <div className="card-body">
                <label className="card-title" htmlFor="description">
                  Antwoord
                </label>
                <input
                  id="description"
                  type="text"
                  className="input-bordered input"
                  maxLength={512}
                  {...register("description", {
                    required: "Dit veld is verplicht",
                    maxLength: {
                      value: 512,
                      message: "Mag niet langer zijn dan 512 karakters",
                    },
                  })}
                />
              </div>
            </article>
            <article className="card flex-1 bg-base-100 shadow-xl">
              <div className="card-body">
                <label className="card-title" htmlFor="isCorrect">
                  Correct antwoord?
                </label>
                <div className="flex gap-2">
                  Niet goed
                  <input
                    id="isCorrect"
                    type="checkbox"
                    className="toggle"
                    {...register("isCorrect")}
                  />
                  Goed
                </div>
              </div>
            </article>
            <article className="card flex-1 bg-base-100 shadow-xl">
              <fieldset className="card-body">
                <legend className="card-title float-left">Waarde</legend>
                <label>
                  Maximaal
                  <input
                    id="early-points"
                    type="range"
                    min="-10"
                    max="10"
                    className="range mt-4"
                    step="1"
                    {...register("earlyPoints")}
                  />
                </label>
                <p className="text-center">{watch("earlyPoints")} punten</p>
                <label>
                  Minimaal
                  <input
                    id="late-points"
                    type="range"
                    min="-10"
                    max="10"
                    className="range mt-4"
                    step="1"
                    {...register("latePoints")}
                  />
                </label>
                <p className="text-center">{watch("latePoints")} punten</p>
              </fieldset>
            </article>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className="space-between btn-outline btn flex-1 sm:flex-none"
              onClick={() => deleteAnswerOption.mutate({ id })}
              disabled={deleteAnswerOption.isLoading}
            >
              Antwoord verwijderen
            </button>
            <button
              className="btn-primary btn flex-1 sm:ml-auto sm:flex-none"
              disabled={updateAnswerOption.isLoading || !isDirty || !isValid}
            >
              Antwoord bewerken
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const slideRangeToSeconds = [3, 5, 10, 15, 30, 45, 60, 90, 120, 180, 300, null];

const EditSlide = ({ id, gameId }: { id: string; gameId: string }) => {
  const {
    data: slide,
    isLoading,
    refetch,
  } = api.slide.get.useQuery(
    { id },
    {
      onSuccess: (data) => {
        if (data) {
          const rawTimeLimit = slideRangeToSeconds.findIndex(
            (m) => m === data.timeLimitInSeconds
          );
          reset({
            name: data.name || "",
            description: data.description || "",
            rawTimeLimit:
              rawTimeLimit !== -1
                ? rawTimeLimit
                : slideRangeToSeconds.length - 1,
          });
        }
      },
    }
  );

  useEffect(() => {
    void refetch();
  }, [id]);

  const {
    reset,
    register,
    handleSubmit,
    watch,
    formState: { isDirty, dirtyFields, isValid },
  } = useForm({
    defaultValues: {
      name: slide?.name || "",
      description: slide?.description || "",
      rawTimeLimit: slide
        ? slideRangeToSeconds.findIndex((m) => m === slide.timeLimitInSeconds)
        : slideRangeToSeconds.length - 1,
    },
  });
  const ctx = api.useContext();
  const updateSlide = api.slide.update.useMutation({
    onSuccess: () => {
      if (dirtyFields.name) {
        void ctx.slide.getForRound.invalidate();
      }
    },
    onError: handleErrorClientSide,
  });
  const router = useRouter();
  const deleteSlide = api.slide.delete.useMutation({
    onSuccess: async (data) => {
      await ctx.slide.getForRound.invalidate();
      return router.push(`/edit/${gameId}/${data.roundId}`);
    },
    onError: handleErrorClientSide,
  });
  const createAnswerOption = api.answerOption.create.useMutation({
    onSuccess: () => void refetch(),
    onError: handleErrorClientSide,
  });

  const rawTimeLimit = watch("rawTimeLimit");

  if (isLoading) {
    return <Loader />;
  }

  if (!slide) {
    return <div>Kon deze slide niet vinden</div>;
  }

  return (
    <form
      className="flex min-h-full flex-col justify-between gap-4 pb-4"
      onSubmit={handleSubmit((data) => {
        updateSlide.mutate({
          id,
          ...data,
          name: data.name || "",
          timeLimitInSeconds: slideRangeToSeconds[data.rawTimeLimit],
        });
      })}
    >
      <div className="flex flex-wrap gap-4">
        <article className="card flex-1 bg-base-100 shadow-xl">
          <div className="card-body">
            <label className="card-title" htmlFor="name">
              Naam van deze slide
            </label>
            <input
              id="name"
              type="text"
              className="input-bordered input"
              maxLength={128}
              {...register("name", {
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
            <div className="form-control">
              <label className="card-title" htmlFor="description">
                Omschrijving of vraag
              </label>
              <textarea
                maxLength={512}
                className="textarea-bordered textarea h-24"
                id="description"
                {...register("description", {
                  maxLength: {
                    value: 512,
                    message: "Mag niet langer zijn dan 512 karakters",
                  },
                })}
              ></textarea>
            </div>
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
              max={slideRangeToSeconds.length - 1}
              className="range"
              step="1"
              aria-valuetext={minutesToString(
                slideRangeToSeconds[rawTimeLimit]
              )}
              {...register("rawTimeLimit")}
            />
            <p className="text-center">
              {minutesToString(slideRangeToSeconds[rawTimeLimit])}
            </p>
          </div>
        </article>
      </div>
      <hr />
      {slide?.answerOptions.map((answerOption) => (
        <>
          <EditAnswerOption key={answerOption.id} id={answerOption.id} />
          <hr />
        </>
      ))}
      <button
        className="btn-primary btn"
        onClick={() => createAnswerOption.mutate({ slideId: id })}
      >
        Nieuw antwoord
      </button>
      <div className="flex flex-wrap justify-between">
        <button
          type="button"
          className="btn-primary btn"
          onClick={() => deleteSlide.mutate({ id })}
          disabled={updateSlide.isLoading}
        >
          Slide verwijderen
        </button>
        <button
          className="btn-primary btn"
          disabled={updateSlide.isLoading || !isDirty || !isValid}
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
    query: { slideId, gameId },
  } = useRouter();
  const session = useSession();

  if (session.status === "unauthenticated") {
    void push("/");
  }
  if (!slideId || !gameId || session.status !== "authenticated") {
    return <Loader />;
  }
  if (Array.isArray(slideId) || Array.isArray(gameId)) {
    return <>Ongeldige invoer</>;
  }

  return (
    <EditLayout>
      <EditSlide id={slideId} gameId={gameId} />
    </EditLayout>
  );
};
export default Edit;
