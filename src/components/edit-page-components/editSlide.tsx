import {
  type Control,
  useFieldArray,
  type UseFormRegister,
  useWatch,
} from "react-hook-form";
import type { z } from "zod";
import type { gameSchema } from "utils/schemas";
import { useRouter } from "next/router";
import { slideRangeToSeconds } from "utils/constants";
import { secondsToString } from "utils/time";
import { CheckMethod, SlideType, Voters } from ".prisma/client";
import { EditMultipleChoiceOption } from "components/edit-page-components/editMultipleChoiceOption";
import { createId } from "@paralleldrive/cuid2";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { InputTimeLimit } from "components/edit-page-components/cards/inputTimeLimit";
import { InputNameAndDescription } from "components/edit-page-components/cards/inputNameAndDescription";
import { Card } from "components/edit-page-components/cards/card";
import { CardContainer } from "components/edit-page-components/cards/cardContainer";
import { EditLayout } from "components/edit-page-components/editLayout";
import { ButtonContainer } from "components/edit-page-components/buttonContainer";

export const EditSlide = ({
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
            `rounds.${roundIndex}.slides.${index}.description`,
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
                    `rounds.${roundIndex}.slides.${index}.checkMethod`,
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
                        `rounds.${roundIndex}.slides.${index}.voters`,
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
                    `rounds.${roundIndex}.slides.${index}.closestToValue`,
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
                      `rounds.${roundIndex}.slides.${index}.pointsForOrder`,
                    )}
                  />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text">Tijd</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    {...register(
                      `rounds.${roundIndex}.slides.${index}.pointsForTime`,
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
                          `rounds.${roundIndex}.slides.${index}.earlyCorrectPoints`,
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
                              `rounds.${roundIndex}.slides.${index}.lateCorrectPoints`,
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
                          `rounds.${roundIndex}.slides.${index}.earlyIncorrectPoints`,
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
                              `rounds.${roundIndex}.slides.${index}.lateIncorrectPoints`,
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
              ),
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
