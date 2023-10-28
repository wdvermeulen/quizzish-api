import { PropsWithChildren } from "react";

export const EditLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-full flex-col justify-between gap-4 pb-4">
      {children}
    </div>
  );
};
