import { TopBar } from "components/top-bar";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "utils/api";
import { Loader } from "components/loader";

const NewProject: NextPage = () => {
  const router = useRouter();
  const { status, data } = useSession();
  const { data: projects } = api.projects.getAll.useQuery();

  useEffect(() => {
    (() => {
      if (status === "unauthenticated") {
        void router.push("../");
      }
    })();
  }, [status]);

  useEffect(() => {
    (() => {
      if (projects?.length === 0) {
        void router.push(`user/new-project`);
      }
    })();
  }, [projects]);

  return (
    <>
      <Head>
        <title>Diaproject - Project kiezen</title>
      </Head>
      <TopBar />
      <main className="hero overflow-auto">
        <div className="hero-body px-2">
          <h2 className="mb-5 text-center text-2xl font-bold">
            Project kiezen
          </h2>
          {data?.user.id ? (
            <article className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <Link className="btn-primary btn" href="user/new-project">
                  Nieuw project bouwen
                </Link>
                <ul>
                  {projects ? (
                    projects.map((project) => (
                      <li key={project.name}>
                        <div className="divider">of</div>
                        <Link
                          className="btn-primary btn w-full"
                          href={`user/${project.name}`}
                        >
                          {project.name} inladen
                        </Link>
                      </li>
                    ))
                  ) : (
                    <Loader />
                  )}
                </ul>
              </div>
            </article>
          ) : (
            <Loader />
          )}
        </div>
      </main>
    </>
  );
};

export default NewProject;
