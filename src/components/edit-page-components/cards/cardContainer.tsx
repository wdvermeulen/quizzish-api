import { PropsWithChildren } from "react";

export const CardContainer = ({ children }: PropsWithChildren) => {
  return <div className="flex flex-wrap gap-4">{children}</div>;
};
