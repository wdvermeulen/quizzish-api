import { PropsWithChildren } from "react";

export const Card = ({ children }: PropsWithChildren) => {
  return (
    <article className="card flex-1 bg-base-100 shadow-xl">
      <div className="card-body">{children}</div>
    </article>
  );
};
