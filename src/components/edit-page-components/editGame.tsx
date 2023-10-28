import { type Control, type UseFormRegister, useWatch } from "react-hook-form";
import type { z } from "zod";
import type { gameSchema } from "utils/schemas";
import { useRouter } from "next/router";
import { api, handleErrorClientSide } from "utils/api";
import { gameRangeToMinutes } from "utils/constants";
import { minutesToString } from "utils/time";
import { SubmitOptions } from "components/edit-page-components/constants/submit-options";
import { InputTimeLimit } from "components/edit-page-components/cards/inputTimeLimit";
import { InputNameAndDescription } from "components/edit-page-components/cards/inputNameAndDescription";
import { CardContainer } from "components/edit-page-components/cards/cardContainer";
import { EditLayout } from "components/edit-page-components/editLayout";
import { ButtonContainer } from "components/edit-page-components/buttonContainer";

export const EditGame = ({
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
