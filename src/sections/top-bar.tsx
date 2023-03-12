import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement } from 'react';

export const TopBar = ({
  children,
  title,
}: {children?: ReactElement, title?: string}) => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  return (
    <nav className="navbar">
      <div className="navbar-start">
        {children || (
          <button
            onClick={() => router.back()}
            className="btn-ghost rounded-btn btn-sm btn"
            disabled={router.pathname === "/"}
          >
            Terug
          </button>
        )}
      </div>
      <h1 className="navbar-center text-xl text-base-content font-umbra flex-shrink text-center">
        {title || (<Link href="/">Quizzish</Link>)}
      </h1>
      <div className="navbar-end">
        {sessionData && (
          <button
            className="btn-ghost rounded-btn btn-sm btn"
            onClick={() => void signOut()}
          >
            Log uit
          </button>
        )}
      </div>
    </nav>
  );
};
