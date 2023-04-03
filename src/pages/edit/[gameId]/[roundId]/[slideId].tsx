import EditLayout from "components/layout/edit-layout";
import { Loader } from "components/loader";
import { useRouter } from "next/router";
import { useState } from "react";
import { api, handleErrorClientSide } from "utils/api";
import { minutesToString } from "utils/time";

const EditAnswerOption = ({
  id,
  numberOfAnswerOptions,
  refetch,
}: {
  id: string;
  numberOfAnswerOptions: number;
  refetch: () => void;
}) => {
  const [description, setDescription] = useState("");
  const updateAnswerOption = api.answerOption.update.useMutation({
    onError: handleErrorClientSide,
  });

  const { data: answerOption } = api.answerOption.get.useQuery(
    { id },
    {
      onSuccess: (data) => {
        if (data) {
          setDescription(data.description || "");
        }
      },
    }
  );

  function changeIndex(index: number, id: string) {
    updateAnswerOption.mutate(
      {
        id,
        index,
      },
      { onSuccess: () => refetch() }
    );
  }

  function storeAnswerOption(id: string) {
    updateAnswerOption.mutate({
      id,
      description,
    });
  }

  return (
    <article className="card flex-1 bg-base-100 shadow-xl">
      <div className="card-body">
        <header className="card-title">
          Antwoord
          {answerOption && (
            <select
              className="select-bordered select"
              onChange={(event) =>
                changeIndex(parseInt(event.target.value), answerOption.id)
              }
              defaultValue={answerOption.index}
            >
              {[...Array(numberOfAnswerOptions).keys()].map((index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          )}
        </header>
        <div className="form-control">
          <label className="input-group mt-4">
            <span>Tekst</span>
            <input
              type="text"
              placeholder="Antwoord"
              className="input-bordered input"
              name="round-name"
              value={description}
              onChange={({ target: { value } }) => setDescription(value)}
            />
          </label>
        </div>
        <div className="card-actions mt-2 justify-end">
          <button
            className="btn-primary btn"
            onClick={() => answerOption && storeAnswerOption(answerOption.id)}
            disabled={!answerOption}
          >
            Antwoord bewerken
          </button>
        </div>
      </div>
    </article>
  );
};

const slideRangeToSeconds = [3, 5, 10, 15, 30, 45, 60, 90, 120, 180, 300, null];

const EditSlide = ({ slideId }: { slideId: string }) => {
  const ctx = api.useContext();
  const [slideName, setSlideName] = useState("");
  const [description, setDescription] = useState("");
  const [rawTimeLimit, setRawTimeLimit] = useState(
    slideRangeToSeconds.length - 1
  );
  const updateSlide = api.slide.update.useMutation({
    onSuccess: () => {
      void ctx.slide.getForRound.invalidate();
    },
    onError: handleErrorClientSide,
  });
  const deleteSlide = api.slide.delete.useMutation({
    onSuccess: () => {
      void ctx.slide.getForRound.invalidate();
    },
    onError: handleErrorClientSide,
  });
  const createAnswerOption = api.answerOption.create.useMutation({
    onSuccess: () => void refetch(),
    onError: handleErrorClientSide,
  });

  const { data: slide, refetch } = api.slide.get.useQuery(
    { id: slideId },
    {
      onSuccess: (data) => {
        if (data) {
          setSlideName(data.name || "");
          setDescription(data.description || "");
          data.timeLimitInSeconds
            ? setRawTimeLimit(
                slideRangeToSeconds.findIndex(
                  (m) => m === data.timeLimitInSeconds
                )
              )
            : setRawTimeLimit(slideRangeToSeconds.length - 1);
        }
      },
    }
  );

  return (
    <div className="flex flex-wrap gap-4">
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <header className="card-title">
            Slide {slide?.index} {slide?.name && `: ${slide.name}`}
          </header>
          <div className="form-control">
            <label className="input-group mt-4">
              <span>Naam</span>
              <input
                type="text"
                className="input-bordered input"
                name="round-name"
                value={slideName || ""}
                onChange={({ target: { value } }) => setSlideName(value)}
              />
            </label>
          </div>
        </div>
      </article>
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label" htmlFor="description">
              <span className="label-text">Omschrijving of vraag</span>
            </label>
            <textarea
              maxLength={1024}
              className="textarea-bordered textarea h-24"
              value={description}
              id="description"
              name="description"
              onChange={({ target: { value } }) => setDescription(value)}
            ></textarea>
          </div>
        </div>
      </article>
      <article className="card flex-1 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label" htmlFor="time-limit">
              <span className="label-text">Tijdslimiet</span>
            </label>
            <input
              id="time-limit"
              type="range"
              min="0"
              max={slideRangeToSeconds.length - 1}
              className="range"
              step="1"
              onChange={({ target: { value } }) =>
                setRawTimeLimit(parseInt(value))
              }
              value={rawTimeLimit}
            />
            <p className="text-center">
              {minutesToString(slideRangeToSeconds[rawTimeLimit])}
            </p>
          </div>
        </div>
      </article>
      {slide?.answerOptions.map((answerOption) => (
        <EditAnswerOption
          key={answerOption.id}
          id={answerOption.id}
          numberOfAnswerOptions={slide.answerOptions.length}
          refetch={() => void refetch()}
        />
      ))}
      <button
        className="btn-primary btn"
        onClick={() =>
          updateSlide.mutate({
            id: slideId,
            name: slideName.length > 0 ? slideName : null,
            description,
            timeLimitInSeconds: slideRangeToSeconds[rawTimeLimit],
          })
        }
      >
        Bewerkingen opslaan
      </button>

      <button
        className="btn-primary btn"
        onClick={() => createAnswerOption.mutate({ slideId })}
      >
        Nieuw antwoord
      </button>

      <button
        className="btn-primary btn"
        onClick={() => deleteSlide.mutate({ slideId })}
      >
        Slide verwijderen
      </button>
    </div>
  );
};

const Edit = () => {
  const { slideId } = useRouter().query;
  if (!slideId) {
    return <Loader />;
  }
  if (Array.isArray(slideId)) {
    return <>Ongeldige invoer</>;
  }
  return (
    <EditLayout>
      <EditSlide slideId={slideId} />
    </EditLayout>
  );
};
export default Edit;
