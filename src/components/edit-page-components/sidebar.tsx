import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "utils/api";
import { useState } from "react";

export const Sidebar = ({
  projectName,
  isProjectValid,
}: {
  projectName: string;
  isProjectValid: boolean;
}) => {
  const [roomCode, setRoomCode] = useState<number | undefined>();
  const router = useRouter();
  const createRoom = api.rooms.create.useMutation({
    onSuccess: (result) => {
      if (result !== -1 && result[0]) {
        setRoomCode(result[0].roomCode);
      }
    },
  });
  const deleteRoom = api.rooms.delete.useMutation({
    onSuccess: () => {
      setRoomCode(undefined);
    },
  });

  return (
    <nav className="drawer-side">
      <label htmlFor="settings-drawer" className="drawer-overlay"></label>
      <ul className="menu w-60 max-w-[80vw] bg-base-200 p-4 text-base-content">
        <li className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Presentatie weergave</span>
            <input
              type="checkbox"
              className="toggle"
              disabled={!isProjectValid}
              onChange={(e) => {
                if (e.target.checked) {
                  createRoom.mutate({ projectName });
                } else {
                  deleteRoom.mutate();
                }
              }}
            />
          </label>
        </li>
        <li className="flex flex-row justify-between disabled">
          <span>Project code</span>
          <span>{roomCode?.toString().padStart(4, "0")}</span>
        </li>
        <li>
          <Link
            href={`/user/${projectName}`}
            className={
              router.pathname === `/user/[projectName]`
                ? "active btn"
                : "btn-ghost btn"
            }
          >
            Spel instellingen
          </Link>
        </li>
        <div className="divider" />

        {/*{rounds.map((round, roundIndex) => (*/}
        {/*  <SidebarRound*/}
        {/*    key={round.id}*/}
        {/*    control={control}*/}
        {/*    gameId={gameId}*/}
        {/*    roundIndex={roundIndex}*/}
        {/*  />*/}
        {/*))}*/}
        <li>
          <button
            onClick={() => console.log("add round")}
            className="btn-outline btn"
            type="button"
          >
            Ronde toevoegen
          </button>
        </li>
        <div className="divider" />
        <li className="disabled">
          <Link
            href={`/user/${projectName}/participants`}
            className={
              router.pathname === `/edit/[gameId]/participants` ? "active" : ""
            }
          >
            Deelnemers
          </Link>
        </li>
        <li className="disabled">
          <Link
            href={`/user/${projectName}/results`}
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
