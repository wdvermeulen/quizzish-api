import { type Control, useController } from "react-hook-form";
import type { z } from "zod";
import type { gameSchema } from "utils/schemas";

import { Card } from "components/edit-page-components/cards/card";

export const InputTimeLimit = ({
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
