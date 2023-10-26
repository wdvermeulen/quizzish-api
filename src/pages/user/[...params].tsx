import Head from "next/head";
import { TopBar } from "components/top-bar";
import { Loader } from "components/loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "utils/api";
import { Sidebar } from "@/src/components/edit-page-components/sidebar";

const EditComponent = ({ gameName }: { gameName: string }) => {
  const { data: project } = api.projects.getFull.useQuery(
    { name: gameName },
    { enabled: !!gameName },
  );

  if (!project) {
    return <Loader />;
  }

  return (
    <form>
      <div className="grid grid-rows-[auto_1fr] overflow-auto lg:grid-rows-1">
        <div className="navbar lg:hidden">
          <div className="navbar-start">
            <label
              htmlFor="settings-drawer"
              className="btn-primary drawer-button btn"
            >
              Open menu
            </label>
          </div>
        </div>
        <div className="drawer-mobile drawer h-[initial]">
          <input
            id="settings-drawer"
            type="checkbox"
            className="drawer-toggle"
          />
          <main className="drawer-content overflow-auto px-4">Content</main>
          <Sidebar projectName={project.name} isProjectValid={true} />
        </div>
      </div>
    </form>
  );
};

const EditProjectPage = () => {
  const {
    push,
    query: { params },
  } = useRouter();
  const session = useSession();

  const gameName = params?.[0];

  if (!gameName) {
    return <>This should not occur</>;
  }

  if (session.status === "unauthenticated") {
    void push("/");
  }
  if (session.status !== "authenticated") {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Quizzish - Bewerk project</title>
      </Head>
      <TopBar />
      <EditComponent gameName={gameName} />
    </>
  );
};

export default EditProjectPage;
