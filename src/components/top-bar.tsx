import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export const TopBar = ({ title }: { title?: string | null }) => {
  const { data: sessionData } = useSession();

  return (
    <nav className="navbar">
      <div className="navbar-start">
        <h1>
          <Link
            href="/"
            className="flex gap-3 text-xl font-light uppercase text-primary-content text-base-content transition-all duration-300 [text-shadow:_.5px_.5px_0.5px_rgba(0,0,0,1),_1px_1px_0.75px_rgba(0,0,0,0.9),_1.5px_1.5px_1px_rgba(0,0,0,0.8),_2px_2px_1.5px_rgba(0,0,0,0.6),_2.5px_2.5px_2px_rgba(0,0,0,0.4),_3px_3px_2.5px_rgba(0,0,0,0.2)] hover:[text-shadow:_0_1px_0.5px_rgba(0,0,0,1),_-.5px_1.5px_0.75px_rgba(0,0,0,0.9),_-1px_2px_1px_rgba(0,0,0,0.8),_-1.5px_2.5px_1.5px_rgba(0,0,0,0.6),_-2px_3px_2px_rgba(0,0,0,0.4),_-2.5px_3.5px_2.5px_rgba(0,0,0,0.2)]"
          >
            <div className="logo inline-block h-8 w-8 bg-base-content">
              <span className="sr-only">Quizzish</span>
            </div>
            <span className="m-auto">{title}</span>
          </Link>
        </h1>
      </div>
      <div className="navbar-end">
        {sessionData && (
          <button
            className="flex items-center gap-3"
            onClick={() => void signOut()}
          >
            {sessionData.user.image ? (
              <Image
                src={sessionData.user.image}
                alt="Profiel afbeelding"
                className="h-8 w-8 rounded-full"
                width={32}
                height={32}
              />
            ) : (
              <span className="text-xl">👤</span>
            )}
            Log uit
          </button>
        )}
      </div>
    </nav>
  );
};
