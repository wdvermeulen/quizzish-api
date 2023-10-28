import { type Control, useFieldArray, useWatch } from "react-hook-form";
import type { z } from "zod";
import type { gameSchema } from "utils/schemas";
import { useRouter } from "next/router";
import Link from "next/link";
import { SidebarRound } from "components/edit-page-components/sidebar/sidebarRound";

import { roundToForm } from "components/edit-page-components/mapping-functions";

export const Sidebar = ({
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
