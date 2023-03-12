import { GameType } from '@prisma/client';

interface GameSettingsProps {
  setGameName: (name: string) => void;
  setGameType: (type: GameType) => void;
  gameName: string;
  gameType?: GameType;
}

const GameSettings = ({
  setGameName,
  setGameType,
  gameName,
  gameType,
}: GameSettingsProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="card bg-base-100 shadow-xl">
        <fieldset className="card-body">
          <div className="form-control">
            <legend className="card-title">Naam van dit spel</legend>
            <label className="input-group mt-4">
              <span>Naam</span>
              <input
                type="text"
                placeholder="Quizzish"
                className="input-bordered input"
                name="game-name"
                value={gameName}
                onChange={({ target: { value } }) => setGameName(value)}
              />
            </label>
          </div>
        </fieldset>
      </div>
      <div className="card bg-base-100 shadow-xl">
        <fieldset className="card-body">
          <legend className="card-title float-left">Speltype</legend>
          <label className="label cursor-pointer">
            <span className="label-text mr-4">Quiz</span>
            <input
              type="radio"
              name="game-type"
              className="radio"
              value={GameType.REGULAR_QUIZ}
              checked={gameType === GameType.REGULAR_QUIZ}
              onChange={() => setGameType(GameType.REGULAR_QUIZ)}
            />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text mr-4">Pubquiz</span>
            <input
              type="radio"
              name="game-type"
              className="radio"
              value={GameType.PUBQUIZ}
              checked={gameType === GameType.PUBQUIZ}
              onChange={() => setGameType(GameType.PUBQUIZ)}
            />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text mr-4">Escape Room</span>
            <input
              type="radio"
              name="game-type"
              className="radio"
              value={GameType.ESCAPE_ROOM}
              checked={gameType === GameType.ESCAPE_ROOM}
              onChange={() => setGameType(GameType.ESCAPE_ROOM)}
            />
          </label>
        </fieldset>
      </div>
    </div>
  );
};

export default GameSettings;
