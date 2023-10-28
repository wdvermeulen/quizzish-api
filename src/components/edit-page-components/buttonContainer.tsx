import { PropsWithChildren } from "react";

export const ButtonContainer = ({ children }: PropsWithChildren) => {
  return <div className="flex flex-wrap justify-between gap-4">{children}</div>;
};
