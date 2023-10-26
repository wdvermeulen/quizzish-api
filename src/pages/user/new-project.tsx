import { NextPage } from "next";
import { api } from "utils/api";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import Textarea from "components/form/text-area";
import Head from "next/head";
import { TopBar } from "components/top-bar";
import { ProjectCreate } from "utils/types";

const InputNameAndDescription = ({
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

const NewProject: NextPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const createProject = api.projects.create.useMutation({
    onSuccess: ([result]) => {
      if (result) {
        void router.push(`${result.name}`);
      } else {
        console.error("No result");
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { register, handleSubmit } = useForm<ProjectCreate>();

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("../");
    }
  }, [status, router]);

  return (
    <>
      <Head>
        <title>Diaproject - Nieuw project</title>
      </Head>
      <TopBar />
      <main className="hero overflow-auto">
        <div className="hero-body px-2">
          <h2 className="mb-5 text-center text-2xl font-bold">Niew project</h2>
          <article className="card bg-base-100 shadow-xl">
            <form
              onSubmit={handleSubmit((data) => createProject.mutateAsync(data))}
              className="card-body"
            >
              <InputNameAndDescription
                registerDescription={register("description")}
                registerName={register("name")}
              />
              <footer className="card-actions justify-end">
                <button className="btn-primary btn" type="submit">
                  Opslaan
                </button>
              </footer>
            </form>
          </article>
        </div>
      </main>
    </>
  );
};

export default NewProject;
