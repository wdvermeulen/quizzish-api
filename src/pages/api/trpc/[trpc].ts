import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "server/api/root";
import { createTRPCContext } from "server/api/trpc";
import { env } from "../../../env.mjs";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError: ({ path, error }) => {
    if (env.NODE_ENV === "development") {
      console.error(
        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
      );
    }
  },
});
