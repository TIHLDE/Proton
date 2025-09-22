import { createTRPCRouter } from "~/server/api/trpc";
import { membershipRouter } from "./membership/router";

export const teamRouter = createTRPCRouter({
	membership: membershipRouter,
});
