import {
  type Control,
  useFieldArray,
  type UseFormRegister,
  useWatch,
} from "react-hook-form";
import type { z } from "zod";
import type { gameSchema } from "utils/schemas";
import { type ChangeEvent, Fragment } from "react";
import { ComparisonType, ConditionType, LogicOperator } from ".prisma/client";

import { conditionToForm } from "components/edit-page-components/mapping-functions";

export const EditNextRoundPossibility = ({
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
            `rounds.${roundIndex}.nextRoundPossibilities.${index}.nextRoundId`,
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
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.conditionType`,
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
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.comparisonType1`,
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
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.comparisonValue1`,
                )}
              />
            </label>
            <label>
              Vergelijking 2
              <select
                className="input-bordered input"
                {...register(
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.comparisonType2`,
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
                  `rounds.${roundIndex}.nextRoundPossibilities.${index}.conditions.${conditionIndex}.comparisonValue2`,
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
                },
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
