import { type Control, useWatch } from "react-hook-form";
import type { z } from "zod";
import type { gameSchema } from "utils/schemas";
import { useRouter } from "next/router";
import Link from "next/link";

export function SidebarRound({
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
