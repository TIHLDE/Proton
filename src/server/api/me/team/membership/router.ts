import { createTRPCRouter } from "~/server/api/trpc";
import sync from "./controller/sync";

export const membershipRouter = createTRPCRouter({
	syncMemberships: sync,
});
