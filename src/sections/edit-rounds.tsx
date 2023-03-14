import type { Round } from "@prisma/client";
import { useState } from "react";
import { api } from "../utils/api";

interface EditRoundsProps {
  gameId: string;
  rounds?: Round[];
  refetchRounds: () => void;
  editRound: (roundId: string) => void;
}

const EditRounds = ({
  gameId,
  rounds,
  refetchRounds,
  editRound,
}: EditRoundsProps) => {
  const [roundName, setRoundName] = useState("");
  const createRound = api.round.create.useMutation();
  const updateRound = api.round.update.useMutation();

  function addRound() {
    createRound.mutate(
      {
        gameId,
        name: roundName,
      },
      {
        onSuccess: () => {
          refetchRounds();
          setRoundName("");
        },
      }
    );
  }

  function changeIndex(index: number, id: string) {
    updateRound.mutate(
      {
        id,
        index,
      },
      {
        onSuccess: () => {
          refetchRounds();
        },
      }
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {rounds?.map((round) => (
        <div key={round.id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <header className="card-title">
              Ronde {round.index} {round.name && `: ${round.name}`}
            </header>
            <div className="form-control">
              <label className="input-group">
                <span>Verplaats ronde</span>
                <select
                  className="select-bordered select"
                  onChange={(event) =>
                    changeIndex(parseInt(event.target.value), round.id)
                  }
                >
                  {[...Array(rounds.length).keys()].map((index) => (
                    <option
                      key={index}
                      selected={round.index - 1 === index}
                      value={index + 1}
                    >
                      {index + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p>Deze ronde heeft nog geen slides</p>
            <div className="card-actions mt-2 justify-end">
              <button
                className="btn-primary btn"
                onClick={() => editRound(round.id)}
              >
                Ronde bewerken
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <header className="card-title">Nieuwe ronde</header>
          <div className="form-control">
            <label className="input-group mt-4">
              <span>Naam</span>
              <input
                type="text"
                placeholder={`Ronde ${(rounds?.length ?? 0) + 1}`}
                className="input-bordered input"
                name="round-name"
                value={roundName}
                onChange={({ target: { value } }) => setRoundName(value)}
              />
            </label>
          </div>
          <div className="card-actions mt-2 justify-end">
            <button className="btn-primary btn" onClick={addRound}>
              Ronde toevoegen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRounds;
