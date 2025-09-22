import { createTRPCRouter } from "~/server/api/trpc";
import { teamRouter } from "./team/router";

export const meRouter = createTRPCRouter({
	team: teamRouter,
});
