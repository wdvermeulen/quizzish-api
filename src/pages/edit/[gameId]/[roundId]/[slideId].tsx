import EditLayout from "components/layout/edit-layout";
import { Loader } from "components/loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { api, handleErrorClientSide, type RouterOutputs } from "utils/api";
import { secondsToString } from "utils/time";
import { CheckMethod, PointMethod, SlideType, Voters } from "@prisma/client";
import Textarea from "components/form/text-area";
import { createId } from "@paralleldrive/cuid2";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

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

  const slideToFormDefaults = (slide?: SlideWithOptions) => {
    return {
      name: slide?.name || "",
      description: slide?.description || "",
      rawTimeLimit: slide
        ? slideRangeToSeconds.findIndex((m) => m === slide.timeLimitInSeconds)
        : slideRangeToSeconds.length - 1,
      type: slide?.type || SlideType.MULTIPLE_CHOICE,
      checkMethod: slide?.checkMethod || CheckMethod.INSTANT,
      voters: slide?.voters || Voters.ALL_PARTICIPANTS,
      closestToValue: slide?.closestToValue || 0,
      statementIsTrue: slide?.statementIsTrue,
      pointMethod: slide?.pointMethod,
      earlyCorrectPoints: slide?.earlyCorrectPoints || 10,
      lateCorrectPoints: slide?.lateCorrectPoints || 0,
      earlyIncorrectPoints: slide?.earlyIncorrectPoints || -10,
      lateIncorrectPoints: slide?.lateIncorrectPoints || -10,
      multipleChoiceOptions: slide?.multipleChoiceOptions.map((option) => ({
        id: option.id,
        description: option.description,
        earlyPoints: option.earlyPoints,
        latePoints: option.latePoints,
        isRegex: option.isRegex,
      })),
    };
  };

  const {
    reset,
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, dirtyFields, isValid },
  } = useForm({
    defaultValues: slideToFormDefaults(slide),
  });

  const multipleChoiceOptionsMethods = useFieldArray({
    control,
    name: "multipleChoiceOptions",
  });

  const checkMethod = watch("checkMethod");
  const type = watch("type");
  const rawTimeLimit = watch("rawTimeLimit");
  const pointMethod = watch("pointMethod");

  useEffect(() => {
    if (
      type === SlideType.MULTIPLE_SELECT ||
      type === SlideType.MULTIPLE_CHOICE
    ) {
      if (multipleChoiceOptionsMethods.fields.length <= 4) {
        multipleChoiceOptionsMethods.replace(
          Array.from({ length: 4 }, () => ({
            id: createId(),
            description: "",
            earlyPoints: 0,
            latePoints: 0,
            isRegex: false,
          }))
        );
      }
    } else if (type === SlideType.TRUE_FALSE) {
      multipleChoiceOptionsMethods.replace([
        {
          id: createId(),
          description: "Waar",
          earlyPoints: 0,
          latePoints: 0,
          isRegex: false,
        },
        {
          id: createId(),
          description: "Niet waar",
          earlyPoints: 0,
          latePoints: 0,
          isRegex: false,
        },
      ]);
    } else if (type === SlideType.OPEN && checkMethod === CheckMethod.INSTANT) {
      multipleChoiceOptionsMethods.replace([
        {
          id: createId(),
          description: "",
          earlyPoints: 10,
          latePoints: 0,
          isRegex: false,
        },
      ]);
    } else if (type === SlideType.POLL) {
      if (multipleChoiceOptionsMethods.fields.length <= 4) {
        multipleChoiceOptionsMethods.replace(
          Array.from({ length: 4 }, () => ({
            id: createId(),
            description: "",
            earlyPoints: 0,
            latePoints: 0,
            isRegex: false,
          }))
        );
      }
    } else {
      multipleChoiceOptionsMethods.replace([]);
    }
  }, [type, checkMethod]);

  useEffect(() => {
    if (type === SlideType.NO_ANSWER || type === SlideType.POLL) {
      setValue("checkMethod", CheckMethod.NONE);
    } else {
      setValue("checkMethod", CheckMethod.INSTANT);
    }
  }, [type]);

  useEffect(() => {
    if (
      Number(rawTimeLimit) === slideRangeToSeconds.length - 1 &&
      pointMethod === PointMethod.TIME
    ) {
      setValue("pointMethod", PointMethod.NONE);
    }
  }, [rawTimeLimit]);

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

  if (isLoading) {
    return <Loader />;
  }

  if (!slide) {
    return <div>Kon deze slide niet vinden</div>;
  }

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
            closestToValue: BigInt(data.closestToValue),
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
            <fieldset className="card-body">
              <label className="card-title" htmlFor="slide-type">
                Soort vraag
              </label>
              <select
                id="slide-type"
                className="select-bordered select"
                {...register("type")}
              >
                <option value={SlideType.NO_ANSWER}>
                  Geen antwoordmogelijkheid
                </option>
                <option value={SlideType.OPEN}>Open</option>
                <option value={SlideType.MULTIPLE_CHOICE}>
                  Multiple choice
                </option>
                <option value={SlideType.MULTIPLE_SELECT}>
                  Multiple select
                </option>
                <option value={SlideType.TRUE_FALSE}>Waar of niet waar</option>
                <option value={SlideType.CLOSEST_TO}>Benadering</option>
                <option value={SlideType.POLL}>Peiling</option>
                <option value={SlideType.CATEGORIZE}>Categorisatie</option>
                <option value={SlideType.SORT}>Sorteren</option>
                <option value={SlideType.PAIR}>Matchen</option>
              </select>
              {type !== SlideType.NO_ANSWER && type !== SlideType.POLL && (
                <>
                  <label className="label-text" htmlFor="check-method">
                    Controle
                  </label>
                  <select
                    id="check-method"
                    className="select-bordered select"
                    {...register("checkMethod")}
                  >
                    <option value={CheckMethod.MANUAL}>
                      Handmatig achteraf
                    </option>
                    <option value={CheckMethod.INSTANT}>
                      Vooraf gedefinieerd
                    </option>
                    <option value={CheckMethod.VOTE}>Stemmen</option>
                    <option value={CheckMethod.MOST_ANSWERED}>
                      Meest beantwoord
                    </option>
                    <option value={CheckMethod.NONE}>Geen</option>
                  </select>
                  {checkMethod === CheckMethod.VOTE && (
                    <>
                      <label className="label-text" htmlFor="voters">
                        Stemmers
                      </label>
                      <select
                        id="voters"
                        className="select-bordered select"
                        {...register("voters")}
                      >
                        <option value={Voters.ALL_PARTICIPANTS}>
                          Alle deelnemers
                        </option>
                        <option value={Voters.SELECTED_PARTICIPANT}>
                          Geselecteerde deelnemer(s)
                        </option>
                        <option value={Voters.RANDOM_PARTICIPANT}>
                          Willekeurige deelnemer
                        </option>
                        <option value={Voters.HOSTS}>Spelleiders</option>
                        <option value={Voters.GUESTS}>Gasten</option>
                      </select>
                    </>
                  )}
                </>
              )}
            </fieldset>
          </article>
          <article className="card flex-1 bg-base-100 shadow-xl">
            <div className="card-body">
              <label className="input-group">
                <span>Titel</span>
                <input
                  maxLength={128}
                  type="text"
                  className="input-bordered input flex-1"
                  {...register("name", {
                    maxLength: {
                      value: 128,
                      message: "Mag niet langer zijn dan 128 karakters",
                    },
                  })}
                />
              </label>
              <label htmlFor="description">
                {type === SlideType.NO_ANSWER ? "Omschrijving" : "Vraag"}
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
          {type === SlideType.CLOSEST_TO &&
            checkMethod === CheckMethod.INSTANT && (
              <article className="card flex-1 bg-base-100 shadow-xl">
                <div className="card-body">
                  <label className="input-group">
                    <span>Antwoord</span>
                    <input
                      type="number"
                      max={Number.MAX_SAFE_INTEGER}
                      min={Number.MIN_SAFE_INTEGER}
                      className="input-bordered input flex-1"
                      {...register("closestToValue")}
                    />
                  </label>
                </div>
              </article>
            )}
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
          {checkMethod !== CheckMethod.NONE && (
            <>
              <article className="card flex-1 bg-base-100 shadow-xl">
                <fieldset className="card-body">
                  <legend className="card-title float-left">
                    Hoogte beloning afhankelijk van
                  </legend>
                  <label className="label cursor-pointer">
                    <span className="label-text mr-4">Onafhankelijk</span>
                    <input
                      type="radio"
                      className="radio"
                      value={PointMethod.NONE}
                      {...register("pointMethod")}
                    />
                  </label>
                  <label className="label cursor-pointer">
                    <span className="label-text mr-4">Volgorde</span>
                    <input
                      type="radio"
                      className="radio"
                      value={PointMethod.ORDER}
                      {...register("pointMethod")}
                    />
                  </label>
                  {Number(rawTimeLimit) !== slideRangeToSeconds.length - 1 && (
                    <label className="label cursor-pointer">
                      <span className="label-text mr-4">Tijd</span>
                      <input
                        type="radio"
                        className="radio"
                        value={PointMethod.TIME}
                        {...register("pointMethod")}
                      />
                    </label>
                  )}
                </fieldset>
              </article>
              {(checkMethod !== CheckMethod.INSTANT ||
                !multipleChoiceOptionsMethods.fields.length) && (
                <>
                  <article className="card flex-1 bg-base-100 shadow-xl">
                    <fieldset className="card-body">
                      <legend className="card-title float-left">
                        Beloning goed antwoord
                      </legend>
                      <label>
                        {pointMethod !== PointMethod.NONE && "Vroeg"}
                        <input
                          id="early-points"
                          type="range"
                          min="-10"
                          max="10"
                          className="range mt-4"
                          step="1"
                          {...register(`earlyCorrectPoints`)}
                        />
                      </label>
                      <p className="text-center">
                        {watch(`earlyCorrectPoints`)} punten
                      </p>
                      {pointMethod !== PointMethod.NONE && (
                        <>
                          <label>
                            Laat
                            <input
                              id="late-points"
                              type="range"
                              min="-10"
                              max="10"
                              className="range mt-4"
                              step="1"
                              {...register(`lateCorrectPoints`)}
                            />
                          </label>
                          <p className="text-center">
                            {watch(`lateCorrectPoints`)} punten
                          </p>
                        </>
                      )}
                    </fieldset>
                  </article>
                  <article className="card flex-1 bg-base-100 shadow-xl">
                    <fieldset className="card-body">
                      <legend className="card-title float-left">
                        Beloning fout antwoord
                      </legend>
                      <label>
                        {pointMethod !== PointMethod.NONE && "Vroeg"}
                        <input
                          id="early-points"
                          type="range"
                          min="-10"
                          max="10"
                          className="range mt-4"
                          step="1"
                          {...register(`earlyIncorrectPoints`)}
                        />
                      </label>
                      <p className="text-center">
                        {watch(`earlyIncorrectPoints`)} punten
                      </p>
                      {pointMethod !== PointMethod.NONE && (
                        <>
                          <label>
                            Laat
                            <input
                              id="late-points"
                              type="range"
                              min="-10"
                              max="10"
                              className="range mt-4"
                              step="1"
                              {...register(`lateIncorrectPoints`)}
                            />
                          </label>
                          <p className="text-center">
                            {watch(`lateIncorrectPoints`)} punten
                          </p>
                        </>
                      )}
                    </fieldset>
                  </article>
                </>
              )}
            </>
          )}
        </div>
        {!!multipleChoiceOptionsMethods.fields.length && (
          <>
            <hr />
            {multipleChoiceOptionsMethods.fields.map(
              (multipleChoiceOption, index) => (
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
                                  message:
                                    "Mag niet langer zijn dan 512 karakters",
                                },
                              }
                            )}
                          />
                          {type === SlideType.OPEN && (
                            <label className="label cursor-pointer">
                              <span className="label-text">
                                Is een reguliere expressie
                              </span>
                              <input
                                type="checkbox"
                                className="toggle"
                                {...register(
                                  `multipleChoiceOptions.${index}.description`
                                )}
                              />
                            </label>
                          )}
                        </div>
                      </article>
                      {checkMethod === CheckMethod.INSTANT && (
                        <article className="card flex-1 bg-base-100 shadow-xl">
                          <fieldset className="card-body">
                            <legend className="card-title float-left">
                              Beloning
                            </legend>
                            <label>
                              {pointMethod !== PointMethod.NONE && "Vroeg"}
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
                              {watch(
                                `multipleChoiceOptions.${index}.earlyPoints`
                              )}{" "}
                              punten
                            </p>
                            {pointMethod !== PointMethod.NONE && (
                              <>
                                <label>
                                  Laat
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
                                  {watch(
                                    `multipleChoiceOptions.${index}.latePoints`
                                  )}{" "}
                                  punten
                                </p>
                              </>
                            )}
                          </fieldset>
                        </article>
                      )}
                      {multipleChoiceOptionsMethods.fields.length > 1 &&
                        type !== SlideType.TRUE_FALSE && (
                          <button
                            className="btn-outline btn ml-auto gap-2"
                            type="button"
                            onClick={() => {
                              multipleChoiceOptionsMethods.remove(index);
                            }}
                          >
                            <MinusCircleIcon className="h-6 w-6" />
                            Antwoord verwijderen
                          </button>
                        )}
                    </div>
                  </div>
                  <hr />
                </div>
              )
            )}
            {type !== SlideType.TRUE_FALSE && (
              <button
                className="btn-primary btn ml-auto gap-2"
                onClick={() =>
                  multipleChoiceOptionsMethods.append({
                    id: createId(),
                    description: "",
                    earlyPoints: 0,
                    latePoints: 0,
                    isRegex: false,
                  })
                }
              >
                <PlusCircleIcon className="h-6 w-6" />
                Antwoord toevoegen
              </button>
            )}
          </>
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
