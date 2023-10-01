import {
  type Control,
  useController,
  useFieldArray,
  useForm,
  type UseFormRegister,
  type UseFormRegisterReturn,
  useWatch,
} from "react-hook-form";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api, handleErrorClientSide, type RouterOutputs } from "utils/api";
import { Loader } from "components/loader";
import Head from "next/head";
import { TopBar } from "components/top-bar";
import {
  CheckMethod,
  ComparisonType,
  type Condition,
  ConditionType,
  LogicOperator,
  NavigationMode,
  SlideType,
  Voters,
} from ".prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Textarea from "components/form/text-area";
import { minutesToString, secondsToString } from "utils/time";
import { type ChangeEvent, Fragment, type PropsWithChildren } from "react";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  type conditionSchema,
  gameSchema,
  type multipleChoiceOptionSchema,
  type roundSchema,
  type slideSchema,
} from "utils/schemas";
import {
  gameRangeToMinutes,
  slideRangeToSeconds,
  toClosestGameValue,
  toClosestRoundValue,
  toClosestSlideValue,
} from "@/src/utils/constants";
import { roundRangeToMinutes } from "utils/constants";
import type { z } from "zod";

type FullGame = NonNullable<RouterOutputs["game"]["getFull"]>;

const SubmitOptions = { addRound: "addRound", save: "save" } as const;

const conditionToForm = (
  condition?: Condition
): z.infer<typeof conditionSchema> =>
  condition
    ? {
        id: condition.id,
        conditionType: condition.conditionType,
        comparisonType1: condition.comparisonType1,
        comparisonType2: condition.comparisonType2,
        logicOperator: condition.logicOperator,
        comparisonValue1: condition.comparisonValue1,
        comparisonValue2: condition.comparisonValue2,
      }
    : {
        id: createId(),
        conditionType: ConditionType.POINTS,
        comparisonType1: ComparisonType.GREATER,
        comparisonType2: null,
        logicOperator: null,
        comparisonValue1: 0,
        comparisonValue2: null,
      };

const mapMultipleChoiceOption = (
  option: FullGame["rounds"][number]["slides"][number]["multipleChoiceOptions"][number]
): z.infer<typeof multipleChoiceOptionSchema> => ({
  id: option.id,
  description: option.description,
  earlyPoints: option.earlyPoints,
  latePoints: option.latePoints,
  isRegex: option.isRegex,
  nextSlideId: option.nextSlideId,
});

const slideToForm = (
  slide?: FullGame["rounds"][number]["slides"][number]
): z.infer<typeof slideSchema> =>
  slide
    ? {
        id: slide.id,
        name: slide.name,
        description: slide.description,
        type: slide.type,
        timeLimitInSeconds: slide.timeLimitInSeconds
          ? toClosestSlideValue(slide.timeLimitInSeconds)
          : null,
        closestToValue: slide.closestToValue,
        pointsForTime: slide.pointsForTime,
        pointsForOrder: slide.pointsForOrder,
        checkMethod: slide.checkMethod,
        explanation: slide.explanation,
        largeText: slide.largeText,
        checkAfter: slide.checkAfter,
        voters: slide.voters,
        earlyCorrectPoints: slide.earlyCorrectPoints,
        lateCorrectPoints: slide.lateCorrectPoints,
        earlyIncorrectPoints: slide.earlyIncorrectPoints,
        lateIncorrectPoints: slide.lateIncorrectPoints,
        nextSlidePossibilities: slide.nextSlidePossibilities.map(
          (possibility) => ({
            id: possibility.id,
            nextSlideId: possibility.nextSlideId,
            conditions: possibility.conditions.map(conditionToForm),
          })
        ),
        multipleChoiceOptions: slide.multipleChoiceOptions.map(
          mapMultipleChoiceOption
        ),
      }
    : {
        id: createId(),
        name: null,
        description: null,
        type: SlideType.NO_ANSWER,
        timeLimitInSeconds: slideRangeToSeconds[slideRangeToSeconds.length - 1],
        closestToValue: null,
        pointsForTime: false,
        pointsForOrder: false,
        checkMethod: CheckMethod.AUTOMATIC,
        explanation: null,
        largeText: null,
        checkAfter: true,
        voters: Voters.ALL_PARTICIPANTS,
        earlyCorrectPoints: 10,
        lateCorrectPoints: 0,
        earlyIncorrectPoints: 0,
        lateIncorrectPoints: 0,
        nextSlidePossibilities: [],
        multipleChoiceOptions: [],
      };

const roundToForm = (
  round?: FullGame["rounds"][number]
): z.infer<typeof roundSchema> =>
  round
    ? {
        id: round.id,
        name: round.name,
        description: round.description,
        index: round.index,
        timeLimitInMinutes: round.timeLimitInMinutes
          ? toClosestRoundValue(round.timeLimitInMinutes)
          : null,
        navigationMode: round.navigationMode,
        checkAfter: round.checkAfter,
        slides: round.slides.map(slideToForm),
        nextRoundPossibilities: round.nextRoundPossibilities.map(
          (possibility) => ({
            id: possibility.id,
            nextRoundId: possibility.nextRoundId,
            conditions: possibility.conditions.map(conditionToForm),
          })
        ),
      }
    : {
        id: createId(),
        name: null,
        description: null,
        index: 0,
        timeLimitInMinutes: roundRangeToMinutes[roundRangeToMinutes.length - 1],
        navigationMode: NavigationMode.TOGETHER,
        checkAfter: true,
        slides: [],
        nextRoundPossibilities: [],
      };

const Card = ({ children }: PropsWithChildren) => {
  return (
    <article className="card flex-1 bg-base-100 shadow-xl">
      <div className="card-body">{children}</div>
    </article>
  );
};

const CardContainer = ({ children }: PropsWithChildren) => {
  return <div className="flex flex-wrap gap-4">{children}</div>;
};

const ButtonContainer = ({ children }: PropsWithChildren) => {
  return <div className="flex flex-wrap justify-between gap-4">{children}</div>;
};

const EditLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-full flex-col justify-between gap-4 pb-4">
      {children}
    </div>
  );
};

const EditPage = () => {
  const {
    push,
    query: { params },
  } = useRouter();
  const session = useSession();

  const gameId = params?.[0];
  const firstParam =
    params && params.length > 1 && params[1] ? params[1] : undefined;
  const secondParam =
    params && params.length > 2 && params[2] ? parseInt(params[2]) : undefined;

  const { data: game } = api.game.getFull.useQuery(
    { id: gameId as string },
    { enabled: !!gameId }
  );

  if (session.status === "unauthenticated") {
    void push("/");
  }
  if (session.status !== "authenticated" || !game) {
    return <Loader />;
  }
  return (
    <>
      <Head>
        <title>Quizzish - Nieuw spel bouwen</title>
      </Head>
      <TopBar />
      <EditComponent
        game={game}
        firstParam={firstParam}
        selectedSlideIndex={secondParam}
      />
    </>
  );
};

const EditComponent = ({
  game,
  firstParam,
  selectedSlideIndex,
}: {
  game: FullGame;
  firstParam: string | undefined;
  selectedSlideIndex: number | undefined;
}) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof gameSchema>>({
    values: {
      id: game.id,
      name: game.name,
      description: game.description,
      timeLimitInMinutes: toClosestGameValue(game.timeLimitInMinutes),
      rounds: game.rounds.map(roundToForm),
    },
    resetOptions: {
      keepDirtyValues: true,
    },
    resolver: zodResolver(gameSchema),
  });

  const { append } = useFieldArray({
    control,
    name: "rounds",
  });

  const router = useRouter();

  if (Object.keys(errors).length !== 0) {
    console.error(errors);
  }

  const saveGame = api.game.update.useMutation();

  const renderSlide = () => {
    if (firstParam === undefined) {
      return <EditGame register={register} control={control} id={game.id} />;
    } else if (selectedSlideIndex !== undefined) {
      return (
        <EditSlide
          key={`slide-${firstParam}-${selectedSlideIndex}`}
          register={register}
          index={selectedSlideIndex}
          roundIndex={Number(firstParam)}
          control={control}
          gameId={game.id}
        />
      );
    } else if (firstParam === "participants") {
      return <h2>Deelnemers</h2>;
    } else if (firstParam === "results") {
      return <h2>Resultaten</h2>;
    } else {
      return (
        <EditRound
          key={`round-${firstParam}`}
          register={register}
          index={Number(firstParam)}
          control={control}
        />
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        void saveGame.mutateAsync(data).then(() => {
          if (
            event &&
            "submitter" in event.nativeEvent &&
            (event.nativeEvent.submitter as HTMLButtonElement).name ===
              SubmitOptions.addRound
          ) {
            append(roundToForm());
            void router.push(`/edit/${game.id}/0`);
          }
        });
      })}
    >
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
        <div className="drawer-mobile drawer h-[initial]">
          <input
            id="settings-drawer"
            type="checkbox"
            className="drawer-toggle"
          />
          <main className="drawer-content overflow-auto px-4">
            {renderSlide()}
          </main>
          <Sidebar gameId={game.id} control={control} />
        </div>
      </div>
    </form>
  );
};

const Sidebar = ({
  gameId,
  control,
}: {
  gameId: string;
  control: Control<z.infer<typeof gameSchema>>;
}) => {
  const router = useRouter();

  const rounds = useWatch({
    control,
    name: "rounds",
  });

  const { append } = useFieldArray({
    control,
    name: "rounds",
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

        {rounds.map((round, roundIndex) => (
          <SidebarRound
            key={round.id}
            control={control}
            gameId={gameId}
            roundIndex={roundIndex}
          />
        ))}
        <li>
          <button
            onClick={() => append(roundToForm())}
            className="btn-outline btn"
            type="button"
          >
            Ronde toevoegen
          </button>
        </li>
        <div className="divider" />
        <li className="disabled">
          <Link
            href={`/edit/${gameId}/participants`}
            className={
              router.pathname === `/edit/[gameId]/participants` ? "active" : ""
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
      </ul>
    </nav>
  );
};

function SidebarRound({
  gameId,
  roundIndex,
  control,
}: {
  gameId: string;
  roundIndex: number;
  control: Control<z.infer<typeof gameSchema>>;
}) {
  const router = useRouter();

  const round = useWatch({
    control,
    name: `rounds.${roundIndex}`,
  });

  return (
    <li key={round.id} className="collapse-arrow collapse">
      <input
        type="checkbox"
        className="ml-auto w-12"
        checked={router.asPath.startsWith(`/edit/${gameId}/${roundIndex}`)}
        onChange={console.log}
      />
      <Link
        href={`/edit/${gameId}/${roundIndex}`}
        className={
          router.asPath === `/edit/${gameId}/${roundIndex}`
            ? "btn-primary collapse-title active btn"
            : "collapse-title btn-ghost btn"
        }
      >
        {round.name ?? `Ronde ${roundIndex + 1}`}
      </Link>
      <ul className="collapse-content relative left-0 block p-0">
        {router.asPath.startsWith(`/edit/${gameId}/${roundIndex}`) &&
          round.slides?.map((slide, slideIndex) => (
            <li key={slide.id}>
              <Link
                href={`/edit/${gameId}/${roundIndex}/${slideIndex}`}
                className={
                  router.asPath ===
                  `/edit/${gameId}/${roundIndex}/${slideIndex}`
                    ? "active"
                    : ""
                }
              >
                {slide.name ?? `Slide ${slideIndex + 1}`}
              </Link>
            </li>
          ))}
        <li></li>
      </ul>
    </li>
  );
}

const InputNameAndDescription = ({
  registerName,
  registerDescription,
  descriptionLabel = "Omschrijving",
  titleLabel = "Titel",
}: {
  registerName: UseFormRegisterReturn;
  registerDescription: UseFormRegisterReturn;
  descriptionLabel?: string;
  titleLabel?: string;
}) => {
  return (
    <>
      <label className="input-group">
        <span>{titleLabel}</span>
        <input
          type="text"
          className="input-bordered input flex-1"
          {...registerName}
        />
      </label>
      <label className="input-group">
        <span>{descriptionLabel}</span>
        <Textarea register={registerDescription} />
      </label>
    </>
  );
};

const InputTimeLimit = ({
  name,
  toStringFunction,
  range,
  control,
  label,
}: {
  name:
    | "timeLimitInMinutes"
    | `rounds.${number}.timeLimitInMinutes`
    | `rounds.${number}.slides.${number}.timeLimitInSeconds`;
  toStringFunction: (_unit?: number | null) => string;
  range: (number | null)[];
  control: Control<z.infer<typeof gameSchema>>;
  label: string;
}) => {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    defaultValue: 15,
  });

  return (
    <Card>
      <fieldset className="flex flex-col">
        <div className="form-control">
          <label className="card-title" htmlFor="time-limit">
            {label}
          </label>
          <input
            id="time-limit"
            type="range"
            min="0"
            max={range.length - 1}
            className="range mt-4"
            step="1"
            list="time-list"
            aria-valuetext={toStringFunction(value)}
            onChange={(e) => onChange(range[parseInt(e.target.value)])}
            value={range.indexOf(value || null)}
          />
          <p className="text-center">{toStringFunction(value)}</p>
        </div>
      </fieldset>
    </Card>
  );
};

const EditGame = ({
  id,
  register,
  control,
}: {
  id: string;
  register: UseFormRegister<z.infer<typeof gameSchema>>;
  control: Control<z.infer<typeof gameSchema>>;
}) => {
  const router = useRouter();

  const rounds = useWatch({
    control,
    name: `rounds`,
  });

  const deleteGame = api.game.delete.useMutation({
    onSuccess: () => {
      void router.push("../new-game");
    },
    onError: handleErrorClientSide,
  });

  return (
    <EditLayout>
      <CardContainer>
        <InputNameAndDescription
          registerName={register("name")}
          registerDescription={register("description")}
        />
        <InputTimeLimit
          control={control}
          name="timeLimitInMinutes"
          range={[...gameRangeToMinutes]}
          toStringFunction={minutesToString}
          label="Tijdslimiet"
        />
      </CardContainer>
      <ButtonContainer>
        <button
          type="button"
          className="space-between btn-outline btn flex-1 sm:flex-none"
          onClick={() => deleteGame.mutate({ id })}
        >
          Spel verwijderen
        </button>
        {rounds.length < 1 ? (
          <button
            type="submit"
            className="btn-primary btn flex-1 sm:ml-auto sm:flex-none"
            name={SubmitOptions.addRound}
          >
            Eerste ronde toevoegen
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary btn flex-1 sm:ml-auto sm:flex-none"
            name={SubmitOptions.save}
          >
            Opslaan
          </button>
        )}
      </ButtonContainer>
    </EditLayout>
  );
};

const EditRound = ({
  index,
  register,
  control,
}: {
  index: number;
  register: UseFormRegister<z.infer<typeof gameSchema>>;
  control: Control<z.infer<typeof gameSchema>>;
}) => {
  const nextRoundPossibilities = useFieldArray({
    control,
    name: `rounds.${index}.nextRoundPossibilities`,
  });

  const { remove, append } = useFieldArray({
    control,
    name: "rounds",
  });

  return (
    <EditLayout>
      <CardContainer>
        <InputNameAndDescription
          registerName={register(`rounds.${index}.name`)}
          registerDescription={register(`rounds.${index}.name`)}
        />
        <InputTimeLimit
          control={control}
          name={`rounds.${index}.timeLimitInMinutes`}
          range={[...roundRangeToMinutes]}
          toStringFunction={minutesToString}
          label="Tijdslimiet"
        />
        <Card>
          <label className="card-title" htmlFor="navigation-mode">
            Navigatie voor deelnemers
          </label>
          <select
            id="navigation-mode"
            className="input-bordered input"
            {...register(`rounds.${index}.navigationMode`, {
              onChange: (e: ChangeEvent<HTMLSelectElement>) => {
                const selectedValue = e.target.value;
                if (selectedValue === NavigationMode.INDIVIDUAL_ROUTES) {
                  nextRoundPossibilities.replace([
                    {
                      conditions: [],
                      id: createId(),
                    },
                  ]);
                } else {
                  nextRoundPossibilities.replace([]);
                }
              },
            })}
          >
            <option value={NavigationMode.TOGETHER}>
              Iedereen op dezelfde slide
            </option>
            <option value={NavigationMode.INDIVIDUAL}>
              Slides op eigen tempo af laten gaan
            </option>
            <option value={NavigationMode.INDIVIDUAL_ROUTES}>
              Slides op eigen volgorde af laten gaan
            </option>
          </select>
        </Card>
        {!!nextRoundPossibilities.fields.length && (
          <Card>
            <fieldset className="flex flex-col">
              <legend className="card-title float-left">Volgende ronde</legend>
              {nextRoundPossibilities.fields.map((possibility, i) => (
                <EditNextRoundPossibility
                  key={possibility.id}
                  control={control}
                  register={register}
                  index={i}
                  roundIndex={index}
                />
              ))}
            </fieldset>
          </Card>
        )}
      </CardContainer>
      <ButtonContainer>
        <button
          type="button"
          className="btn-outline btn"
          onClick={() => remove(index)}
        >
          Ronde verwijderen
        </button>
        <button
          type="button"
          className="btn-outline btn"
          onClick={() =>
            append({
              ...roundToForm(),
              index: index + 1,
            })
          }
        >
          Ronde toevoegen
        </button>
      </ButtonContainer>
    </EditLayout>
  );
};

const EditNextRoundPossibility = ({
  index,
  roundIndex,
  register,
  control,
}: {
  index: number;
  roundIndex: number;
  register: UseFormRegister<z.infer<typeof gameSchema>>;
  control: Control<z.infer<typeof gameSchema>>;
}) => {
  const rounds = useWatch({
    control,
    name: `rounds`,
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions`,
  });

  return (
    <Fragment>
      <label>
        Navigeer naar
        <select
          className="input-bordered input"
          {...register(
            `rounds.${roundIndex}.nextRoundPossibilities.${index}.nextRoundId`
          )}
        >
          <option value={undefined}>Volgende ronde</option>
          {rounds.map((round) => (
            <option key={round.id} value={round.id}>
              {round.name ?? `Ronde ${round.index}`}
            </option>
          ))}
        </select>
      </label>
      {!!fields?.length ? (
        fields.map((condition, conditionIndex) => (
          <Fragment key={condition.id}>
            <label>
              Voorwaarde
              <select
                className="input-bordered input"
                {...register(
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.conditionType`
                )}
              >
                <option value={ConditionType.ROUND_TIME}>Ronde tijd</option>
                <option value={ConditionType.GAME_TIME}>Spel tijd</option>
                <option value={ConditionType.POINTS}>Punten</option>
                <option value={ConditionType.RANKINGS}>Tussenstand</option>
                <option value={ConditionType.PARTICIPANTS}>
                  Aantal deelnemers
                </option>
                <option value={ConditionType.PARTICIPANTS_WITH_POINTS}>
                  Aantal deelnemers met punten
                </option>
                <option value={ConditionType.REPEATS}>
                  Na een aantal herhalingen
                </option>
              </select>
            </label>
            <label>
              Vergelijking
              <select
                className="input-bordered input"
                {...register(
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.comparisonType1`
                )}
              >
                <option value={ComparisonType.SMALLEST}>Kleinste</option>
                <option value={ComparisonType.SMALLER}>Kleiner dan</option>
                <option value={ComparisonType.SMALLER_EQUALS}>
                  Kleiner dan of gelijk aan
                </option>
                <option value={ComparisonType.EQUALS}>Gelijk aan</option>
                <option value={ComparisonType.GREATER_EQUALS}>
                  Groter dan of gelijk aan
                </option>
                <option value={ComparisonType.GREATER}>Groter dan</option>
                <option value={ComparisonType.GREATEST}>Grootste</option>
              </select>
            </label>
            <label className="input-group">
              <span>Waarde 1</span>
              <input
                type="number"
                className="input-bordered input flex-1"
                {...register(
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.comparisonValue1`
                )}
              />
            </label>
            <label>
              Vergelijking 2
              <select
                className="input-bordered input"
                {...register(
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.comparisonType2`
                )}
              >
                <option value={ComparisonType.SMALLEST}>Kleinste</option>
                <option value={ComparisonType.SMALLER}>Kleiner dan</option>
                <option value={ComparisonType.SMALLER_EQUALS}>
                  Kleiner dan of gelijk aan
                </option>
                <option value={ComparisonType.EQUALS}>Gelijk aan</option>
                <option value={ComparisonType.GREATER_EQUALS}>
                  Groter dan of gelijk aan
                </option>
                <option value={ComparisonType.GREATER}>Groter dan</option>
                <option value={ComparisonType.GREATEST}>Grootste</option>
              </select>
            </label>
            <label className="input-group">
              <span>Waarde 2</span>
              <input
                type="number"
                className="input-bordered input flex-1"
                {...register(
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.comparisonValue2`
                )}
              />
            </label>
            <select
              className="input-bordered input"
              {...register(
                `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.logicOperator`,
                {
                  onChange: (e: ChangeEvent<HTMLSelectElement>) => {
                    const selectedValue = e.target.value;
                    if (selectedValue) {
                      append(conditionToForm());
                    } else {
                      remove();
                    }
                  },
                }
              )}
            >
              <option value={undefined}>Ronde</option>
              <option value={LogicOperator.AND}>En</option>
              <option value={LogicOperator.OR}>Of</option>
            </select>
          </Fragment>
        ))
      ) : (
        <button
          type="button"
          className="btn-outline btn"
          onClick={() => {
            append(conditionToForm());
          }}
        >
          Voorwaarde toevoegen
        </button>
      )}
    </Fragment>
  );
};

const EditSlide = ({
  index,
  register,
  roundIndex,
  gameId,
  control,
}: {
  index: number;
  register: UseFormRegister<z.infer<typeof gameSchema>>;
  roundIndex: number;
  gameId: string;
  control: Control<z.infer<typeof gameSchema>>;
}) => {
  const router = useRouter();

  const { remove } = useFieldArray({
    control,
    name: `rounds.${roundIndex}.slides`,
  });
  const multipleChoiceOptions = useFieldArray({
    control,
    name: `rounds.${roundIndex}.slides.${index}.multipleChoiceOptions`,
  });

  const type = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${index}.type`,
  });
  const checkMethod = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${index}.checkMethod`,
  });
  const pointsForTime = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${index}.pointsForTime`,
  });
  const earlyCorrectPoints = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${index}.earlyCorrectPoints`,
  });
  const earlyIncorrectPoints = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${index}.earlyIncorrectPoints`,
  });
  const lateIncorrectPoints = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${index}.lateIncorrectPoints`,
  });
  const lateCorrectPoints = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${index}.lateCorrectPoints`,
  });

  return (
    <EditLayout>
      <CardContainer>
        <InputTimeLimit
          control={control}
          name={`rounds.${roundIndex}.slides.${index}.timeLimitInSeconds`}
          range={[...slideRangeToSeconds]}
          toStringFunction={secondsToString}
          label="Tijdslimiet"
        />
        <InputNameAndDescription
          registerName={register(`rounds.${roundIndex}.slides.${index}.name`)}
          registerDescription={register(
            `rounds.${roundIndex}.slides.${index}.description`
          )}
          descriptionLabel={
            type === SlideType.NO_ANSWER ? "Omschrijving" : "Vraag"
          }
        />
        <Card>
          <fieldset className="flex flex-col">
            <label className="card-title" htmlFor="slide-type">
              Soort vraag
            </label>
            <select
              id="slide-type"
              className="select-bordered select"
              {...register(`rounds.${roundIndex}.slides.${index}.type`)}
            >
              <option value={SlideType.NO_ANSWER}>
                Geen antwoordmogelijkheid
              </option>
              <option value={SlideType.OPEN}>Open</option>
              <option value={SlideType.MULTIPLE_CHOICE}>Multiple choice</option>
              <option value={SlideType.MULTIPLE_SELECT}>Multiple select</option>
              <option value={SlideType.TRUE_FALSE}>Waar of niet waar</option>
              <option value={SlideType.CLOSEST_TO}>Benadering</option>
              <option value={SlideType.CATEGORIZE}>Categorisatie</option>
              <option value={SlideType.SORT}>Sorteren</option>
              <option value={SlideType.PAIR}>Matchen</option>
              <option value={SlideType.POLL}>Peiling</option>
            </select>
            {type !== SlideType.NO_ANSWER && type !== SlideType.POLL && (
              <>
                <label className="label-text" htmlFor="check-method">
                  Controle
                </label>
                <select
                  id="check-method"
                  className="select-bordered select"
                  {...register(
                    `rounds.${roundIndex}.slides.${index}.checkMethod`
                  )}
                >
                  <option value={CheckMethod.MANUAL}>Handmatig achteraf</option>
                  <option value={CheckMethod.AUTOMATIC}>
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
                      {...register(
                        `rounds.${roundIndex}.slides.${index}.voters`
                      )}
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
        </Card>
        {type === SlideType.CLOSEST_TO &&
          checkMethod === CheckMethod.AUTOMATIC && (
            <Card>
              <label className="input-group">
                <span>Antwoord</span>
                <input
                  type="number"
                  max={Number.MAX_SAFE_INTEGER}
                  min={Number.MIN_SAFE_INTEGER}
                  className="input-bordered input flex-1"
                  {...register(
                    `rounds.${roundIndex}.slides.${index}.closestToValue`
                  )}
                />
              </label>
            </Card>
          )}
        {checkMethod !== CheckMethod.NONE && (
          <>
            <Card>
              <fieldset className="flex flex-col">
                <legend className="card-title float-left">
                  Hoogte beloning afhankelijk van
                </legend>

                <label className="label cursor-pointer">
                  <span className="label-text">Volgorde</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    {...register(
                      `rounds.${roundIndex}.slides.${index}.pointsForOrder`
                    )}
                  />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text">Tijd</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    {...register(
                      `rounds.${roundIndex}.slides.${index}.pointsForTime`
                    )}
                  />
                </label>
              </fieldset>
            </Card>
            {(checkMethod !== CheckMethod.AUTOMATIC ||
              !multipleChoiceOptions.fields.length) && (
              <>
                <Card>
                  <fieldset className="flex flex-col">
                    <legend className="card-title float-left">
                      Beloning goed antwoord
                    </legend>
                    <label>
                      {pointsForTime && "Vroeg"}
                      <input
                        id="early-points"
                        type="range"
                        min="-10"
                        max="10"
                        className="range mt-4"
                        step="1"
                        {...register(
                          `rounds.${roundIndex}.slides.${index}.earlyCorrectPoints`
                        )}
                      />
                    </label>
                    <p className="text-center">{earlyCorrectPoints} punten</p>
                    {pointsForTime && (
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
                              `rounds.${roundIndex}.slides.${index}.lateCorrectPoints`
                            )}
                          />
                        </label>
                        <p className="text-center">
                          {lateCorrectPoints} punten
                        </p>
                      </>
                    )}
                  </fieldset>
                </Card>
                <Card>
                  <fieldset className="flex flex-col">
                    <legend className="card-title float-left">
                      Beloning fout antwoord
                    </legend>
                    <label>
                      {pointsForTime && "Vroeg"}
                      <input
                        id="early-points"
                        type="range"
                        min="-10"
                        max="10"
                        className="range mt-4"
                        step="1"
                        {...register(
                          `rounds.${roundIndex}.slides.${index}.earlyIncorrectPoints`
                        )}
                      />
                    </label>
                    <p className="text-center">{earlyIncorrectPoints} punten</p>
                    {pointsForTime && (
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
                              `rounds.${roundIndex}.slides.${index}.lateIncorrectPoints`
                            )}
                          />
                        </label>
                        <p className="text-center">
                          {lateIncorrectPoints} punten
                        </p>
                      </>
                    )}
                  </fieldset>
                </Card>
              </>
            )}
          </>
        )}
        {!!multipleChoiceOptions.fields.length && (
          <>
            <hr />
            {multipleChoiceOptions.fields.map(
              (multipleChoiceOption, optionIndex) => (
                <EditMultipleChoiceOption
                  key={multipleChoiceOption.id}
                  index={optionIndex}
                  register={register}
                  roundIndex={roundIndex}
                  slideIndex={index}
                  control={control}
                />
              )
            )}
            {type !== SlideType.TRUE_FALSE && (
              <button
                className="btn-primary btn ml-auto gap-2"
                onClick={() =>
                  multipleChoiceOptions.append({
                    id: createId(),
                    description: "",
                    earlyPoints: 0,
                    latePoints: 0,
                    isRegex: false,
                    nextSlideId: null,
                  })
                }
              >
                <PlusCircleIcon className="h-6 w-6" />
                Antwoord toevoegen
              </button>
            )}
          </>
        )}
      </CardContainer>
      <ButtonContainer>
        <button
          type="button"
          className="btn-outline btn"
          onClick={() => {
            remove(index);
            void router.push(`/edit/${gameId}/${roundIndex}`);
          }}
        >
          Slide verwijderen
        </button>
        <button className="btn-primary btn">Nieuwe slide</button>
      </ButtonContainer>
    </EditLayout>
  );
};

const EditMultipleChoiceOption = ({
  index,
  register,
  roundIndex,
  slideIndex,
  control,
}: {
  index: number;
  register: UseFormRegister<z.infer<typeof gameSchema>>;
  roundIndex: number;
  slideIndex: number;
  control: Control<z.infer<typeof gameSchema>>;
}) => {
  const { append, remove, fields } = useFieldArray({
    control,
    name: `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions`,
  });

  const slideType = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${slideIndex}.type`,
  });
  const checkMethod = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${slideIndex}.checkMethod`,
  });
  const earlyPoints = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.earlyPoints`,
  });
  const latePoints = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.latePoints`,
  });
  const pointsForTime = useWatch({
    control,
    name: `rounds.${roundIndex}.slides.${slideIndex}.pointsForTime`,
  });

  return (
    <div className="collapse">
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
                  `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.description`,
                  {
                    required: "Dit veld is verplicht",
                    maxLength: {
                      value: 512,
                      message: "Mag niet langer zijn dan 512 karakters",
                    },
                  }
                )}
              />
              {slideType === SlideType.OPEN && (
                <label className="label cursor-pointer">
                  <span className="label-text">Is een reguliere expressie</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    {...register(
                      `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.description`
                    )}
                  />
                </label>
              )}
            </div>
          </article>
          {checkMethod === CheckMethod.AUTOMATIC && (
            <article className="card flex-1 bg-base-100 shadow-xl">
              <fieldset className="card-body">
                <legend className="card-title float-left">Beloning</legend>
                <label>
                  {pointsForTime && "Vroeg"}
                  <input
                    id="early-points"
                    type="range"
                    min="-10"
                    max="10"
                    className="range mt-4"
                    step="1"
                    {...register(
                      `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.earlyPoints`
                    )}
                  />
                </label>
                <p className="text-center">{earlyPoints} punten</p>
                {pointsForTime && (
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
                          `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.latePoints`
                        )}
                      />
                    </label>
                    <p className="text-center">{latePoints} punten</p>
                  </>
                )}
              </fieldset>
            </article>
          )}
          {fields.length > 1 && slideType !== SlideType.TRUE_FALSE && (
            <>
              <button
                className="btn-outline btn ml-auto gap-2"
                type="button"
                onClick={() => {
                  remove(index);
                }}
              >
                <MinusCircleIcon className="h-6 w-6" />
                Antwoord verwijderen
              </button>
              <button
                className="btn-outline btn ml-auto gap-2"
                type="button"
                onClick={() => {
                  append({
                    id: createId(),
                    description: null,
                    earlyPoints: null,
                    latePoints: null,
                    isRegex: false,
                    nextSlideId: null,
                  });
                }}
              >
                <MinusCircleIcon className="h-6 w-6" />
                Antwoord toevoegen
              </button>
            </>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
};

export default EditPage;
