import { api } from "utils/api";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Loader } from "components/loader";
import Head from "next/head";
import { TopBar } from "components/top-bar";
import { EditComponent } from "components/edit-page-components/editComponent";

export const EditPage = () => {
  const {
    push,
    query: { params },
  } = useRouter();
  const session = useSession();

  const gameId = params?.[0];
  const firstParam =
    params && params.length > 1 && params[1] ? params[1] : undefined;
  const secondParam =
    params && params.length > 2 && params[2] ? parseInt(params[2]) : undefined;

  const { data: game } = api.game.getFull.useQuery(
    { id: gameId as string },
    { enabled: !!gameId },
  );

  if (session.status === "unauthenticated") {
    void push("/");
  }
  if (session.status !== "authenticated" || !game) {
    return <Loader />;
  }
  return (
    <>
      <Head>
        <title>Quizzish - Nieuw spel bouwen</title>
      </Head>
      <TopBar />
      <EditComponent
        game={game}
        firstParam={firstParam}
        selectedSlideIndex={secondParam}
      />
    </>
  );
};
export default EditPage;
