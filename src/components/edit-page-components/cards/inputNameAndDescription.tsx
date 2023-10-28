import type { UseFormRegisterReturn } from "react-hook-form";
import Textarea from "components/form/text-area";

export const InputNameAndDescription = ({
  registerName,
  registerDescription,
  descriptionLabel = "Omschrijving",
  titleLabel = "Titel",
}: {
  registerName: UseFormRegisterReturn;
  registerDescription: UseFormRegisterReturn;
  descriptionLabel?: string;
  titleLabel?: string;
}) => {
  return (
    <>
      <label className="input-group">
        <span>{titleLabel}</span>
        <input
          type="text"
          className="input-bordered input flex-1"
          {...registerName}
        />
      </label>
      <label className="input-group">
        <span>{descriptionLabel}</span>
        <Textarea register={registerDescription} />
      </label>
    </>
  );
};
