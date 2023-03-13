import { GameType, Round } from '@prisma/client';
import { useState } from "react";
import { api } from "../utils/api";

interface EditRoundsProps {
  gameType: GameType;
  gameId: string;
  rounds?: Round[];
  refetchRounds: () => void;
}

const EditRounds = ({ gameType, gameId, rounds, refetchRounds }: EditRoundsProps) => {
  const [roundName, setRoundName] = useState('');
  const [selectedRound, setSelectedRound] = useState<null | string>(null);
  const createRound = api.round.create.useMutation();

  function addRound() {
    createRound.mutate(
      {
        gameId,
        name: roundName,
      },
      { onSuccess: () => {
        refetchRounds();
        setRoundName('');
      } }
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {rounds?.map((round) => (
        <div key={round.id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <header className="card-title">Ronde {round.index}{round.name && `: ${round.name}`}</header>
            <p>Deze ronde heeft nog geen slides</p>
            <div className="card-actions mt-2 justify-end">
              <button className="btn-primary btn" onClick={() => setSelectedRound(round.id)}>
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
            <div className="card-actions justify-end mt-2">
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
