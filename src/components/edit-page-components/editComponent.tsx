import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { gameSchema } from "utils/schemas";
import { toClosestGameValue } from "utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { api, type RouterOutputs } from "utils/api";
import { EditGame } from "components/edit-page-components/editGame";
import { EditSlide } from "components/edit-page-components/editSlide";
import { EditRound } from "components/edit-page-components/editRound";
import { SubmitOptions } from "components/edit-page-components/constants/submit-options";
import { Sidebar } from "components/edit-page-components/sidebar/sidebar";
import { roundToForm } from "components/edit-page-components/mapping-functions";

export type FullGame = NonNullable<RouterOutputs["game"]["getFull"]>;

export const EditComponent = ({
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
