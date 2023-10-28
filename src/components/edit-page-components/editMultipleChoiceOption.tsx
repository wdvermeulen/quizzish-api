import {
  type Control,
  useFieldArray,
  type UseFormRegister,
  useWatch,
} from "react-hook-form";
import type { z } from "zod";
import type { gameSchema } from "utils/schemas";
import { CheckMethod, SlideType } from ".prisma/client";
import { MinusCircleIcon } from "@heroicons/react/24/solid";
import { createId } from "@paralleldrive/cuid2";

export const EditMultipleChoiceOption = ({
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
                  },
                )}
              />
              {slideType === SlideType.OPEN && (
                <label className="label cursor-pointer">
                  <span className="label-text">Is een reguliere expressie</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    {...register(
                      `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.description`,
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
                      `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.earlyPoints`,
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
                          `rounds.${roundIndex}.slides.${slideIndex}.multipleChoiceOptions.${index}.latePoints`,
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
