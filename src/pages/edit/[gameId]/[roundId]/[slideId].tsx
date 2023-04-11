import EditLayout from "components/layout/edit-layout";
import { Loader } from "components/loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { api, handleErrorClientSide, type RouterOutputs } from "utils/api";
import { secondsToString } from "utils/time";
import { CheckMethod, SlideType } from "@prisma/client";
import Textarea from "components/form/text-area";
import { createId } from "@paralleldrive/cuid2";

const slideRangeToSeconds = [3, 5, 10, 15, 30, 45, 60, 90, 120, 180, 300, null];
type SlideWithOptions = RouterOutputs["slide"]["get"];

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
          reset(slideToFormDefaults(data));
        }
      },
    }
  );

  useEffect(() => {
    void refetch();
  }, [id, refetch]);

  const slideToFormDefaults = (slide?: SlideWithOptions) => ({
    name: slide?.name || "",
    description: slide?.description || "",
    rawTimeLimit: slide
      ? slideRangeToSeconds.findIndex((m) => m === slide.timeLimitInSeconds)
      : slideRangeToSeconds.length - 1,
    type: slide?.type || SlideType.MULTIPLE_CHOICE,
    checkMethod: slide?.checkMethod || CheckMethod.INSTANT,
    statementIsTrue: slide?.statementIsTrue,
    multipleChoiceOptions: slide?.multipleChoiceOptions.map((option) => ({
      id: option.id,
      description: option.description,
      isCorrect: option.isCorrect,
      earlyPoints: option.earlyPoints,
      latePoints: option.latePoints,
    })),
  });

  const {
    reset,
    control,
    register,
    handleSubmit,
    watch,
    formState: { isDirty, dirtyFields, isValid },
  } = useForm({
    defaultValues: slideToFormDefaults(slide),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "multipleChoiceOptions",
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

  const rawTimeLimit = watch("rawTimeLimit");

  if (isLoading) {
    return <Loader />;
  }

  if (!slide) {
    return <div>Kon deze slide niet vinden</div>;
  }

  const checkMethod = watch("checkMethod");
  const type = watch("type");

  return (
    <div className="flex min-h-full flex-col justify-between gap-4 pb-4">
      <form
        className="flex flex-col justify-between gap-4"
        onSubmit={handleSubmit((data) => {
          updateSlide.mutate({
            id,
            ...data,
            name: data.name || "",
            timeLimitInSeconds: slideRangeToSeconds[data.rawTimeLimit],
            multipleChoiceOptions: data.multipleChoiceOptions?.map(
              (option) => ({
                id: option.id || createId(),
              })
            ),
          });
        })}
      >
        <div className="flex flex-wrap gap-4">
          <article className="card flex-1 bg-base-100 shadow-xl">
            <div className="card-body">
              <label className="card-title" htmlFor="name">
                Naam van deze slide
              </label>
              <Textarea
                maxLength={128}
                id="name"
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
                Omschrijving of vraag
              </label>
              <Textarea
                maxLength={512}
                id="description"
                register={register("description", {
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
                aria-valuetext={secondsToString(
                  slideRangeToSeconds[rawTimeLimit]
                )}
                {...register("rawTimeLimit")}
              />
              <p className="text-center">
                {secondsToString(slideRangeToSeconds[rawTimeLimit])}
              </p>
            </div>
          </article>
          <article className="card flex-1 bg-base-100 shadow-xl">
            <fieldset className="card-body">
              <legend className="card-title float-left">Soort vraag</legend>
              <label className="label cursor-pointer">
                <span className="label-text mr-4">
                  Geen antwoordmogelijkheid
                </span>
                <input
                  type="radio"
                  className="radio"
                  value={SlideType.NO_ANSWER}
                  {...register("type")}
                />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text mr-4">Open</span>
                <input
                  type="radio"
                  className="radio"
                  value={SlideType.OPEN}
                  {...register("type")}
                />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text mr-4">Multiple choice</span>
                <input
                  type="radio"
                  className="radio"
                  value={SlideType.MULTIPLE_CHOICE}
                  {...register("type")}
                />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text mr-4">Multiple select</span>
                <input
                  type="radio"
                  className="radio"
                  value={SlideType.MULTIPLE_SELECT}
                  {...register("type")}
                />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text mr-4">Waar of niet waar</span>
                <input
                  type="radio"
                  className="radio"
                  value={SlideType.TRUE_FALSE}
                  {...register("type")}
                />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text mr-4">Benadering</span>
                <input
                  type="radio"
                  className="radio"
                  value={SlideType.CLOSEST_TO}
                  {...register("type")}
                />
              </label>
            </fieldset>
          </article>
          {type !== SlideType.NO_ANSWER && (
            <article className="card flex-1 bg-base-100 shadow-xl">
              <fieldset className="card-body">
                <legend className="card-title float-left">Controle</legend>
                <label className="label cursor-pointer">
                  <span className="label-text mr-4">Handmatig achteraf</span>
                  <input
                    type="radio"
                    className="radio"
                    value={CheckMethod.MANUAL}
                    {...register("checkMethod")}
                  />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text mr-4">Antwoordsleutel</span>
                  <input
                    type="radio"
                    className="radio"
                    value={CheckMethod.INSTANT}
                    {...register("checkMethod")}
                  />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text mr-4">Stemmen</span>
                  <input
                    type="radio"
                    className="radio"
                    value={CheckMethod.VOTE}
                    {...register("checkMethod")}
                  />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text mr-4">Meest beantwoord</span>
                  <input
                    type="radio"
                    className="radio"
                    value={CheckMethod.MOST_ANSWERED}
                    {...register("checkMethod")}
                  />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text mr-4">Geen</span>
                  <input
                    type="radio"
                    className="radio"
                    value={CheckMethod.NONE}
                    {...register("checkMethod")}
                  />
                </label>
              </fieldset>
            </article>
          )}
        </div>
        {type === SlideType.TRUE_FALSE &&
          checkMethod === CheckMethod.INSTANT && (
            <article className="card flex-1 bg-base-100 shadow-xl">
              <div className="card-body">
                <label className="card-title" htmlFor="statementIsTrue">
                  Juiste antwoord
                </label>
                <div className="flex gap-2">
                  Niet waar
                  <input
                    id="statementIsTrue"
                    type="checkbox"
                    className="toggle"
                    {...register("statementIsTrue")}
                  />
                  Waar
                </div>
              </div>
            </article>
          )}
        <div className="flex flex-wrap justify-between">
          <button
            type="button"
            className="btn-outline btn"
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
      {(type === SlideType.MULTIPLE_CHOICE ||
        type === SlideType.MULTIPLE_SELECT) && (
        <>
          <hr />
          {fields.map((multipleChoiceOption, index) => (
            <div className="collapse" key={multipleChoiceOption.id}>
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Antwoord {index + 1}
              </div>
              <div className="collapse-content">
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
                        {...register(
                          `multipleChoiceOptions.${index}.description`,
                          {
                            required: "Dit veld is verplicht",
                            maxLength: {
                              value: 512,
                              message: "Mag niet langer zijn dan 512 karakters",
                            },
                          }
                        )}
                      />
                    </div>
                  </article>
                  {checkMethod === CheckMethod.INSTANT && (
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
                            {...register(
                              `multipleChoiceOptions.${index}.isCorrect`
                            )}
                          />
                          Goed
                        </div>
                      </div>
                    </article>
                  )}
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
                          {...register(
                            `multipleChoiceOptions.${index}.earlyPoints`
                          )}
                        />
                      </label>
                      <p className="text-center">
                        {watch(`multipleChoiceOptions.${index}.earlyPoints`)}{" "}
                        punten
                      </p>
                      <label>
                        Minimaal
                        <input
                          id="late-points"
                          type="range"
                          min="-10"
                          max="10"
                          className="range mt-4"
                          step="1"
                          {...register(
                            `multipleChoiceOptions.${index}.latePoints`
                          )}
                        />
                      </label>
                      <p className="text-center">
                        {watch(`multipleChoiceOptions.${index}.latePoints`)}{" "}
                        punten
                      </p>
                    </fieldset>
                  </article>
                  <button
                    type="button"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    Vraag verwijderen
                  </button>
                </div>
              </div>
              <hr />
            </div>
          ))}
          <button
            className="btn-primary btn"
            onClick={() =>
              append({
                id: createId(),
                description: "",
                earlyPoints: 0,
                latePoints: 0,
                isCorrect: false,
              })
            }
          >
            Nieuw antwoord
          </button>
        </>
      )}
    </div>
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
