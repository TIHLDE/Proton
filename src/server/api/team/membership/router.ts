import { createTRPCRouter } from "../../trpc";
import update from "./controller/update";

export const membershipRouter = createTRPCRouter({
	updateRole: update,
});
