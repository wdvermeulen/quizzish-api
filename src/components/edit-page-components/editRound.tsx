import {
  type Control,
  useFieldArray,
  type UseFormRegister,
} from "react-hook-form";
import type { z } from "zod";
import type { gameSchema } from "utils/schemas";
import { roundRangeToMinutes } from "utils/constants";
import { minutesToString } from "utils/time";
import type { ChangeEvent } from "react";
import { NavigationMode } from ".prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { EditNextRoundPossibility } from "components/edit-page-components/editNextRoundPossibility";
import { InputTimeLimit } from "components/edit-page-components/cards/inputTimeLimit";
import { InputNameAndDescription } from "components/edit-page-components/cards/inputNameAndDescription";
import { roundToForm } from "components/edit-page-components/mapping-functions";
import { Card } from "components/edit-page-components/cards/card";
import { CardContainer } from "components/edit-page-components/cards/cardContainer";
import { EditLayout } from "components/edit-page-components/editLayout";
import { ButtonContainer } from "components/edit-page-components/buttonContainer";

export const EditRound = ({
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
