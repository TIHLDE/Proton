import { createTRPCRouter } from "../../trpc";
import setInactive from "./controller/set-inactive";
import update from "./controller/update";

export const membershipRouter = createTRPCRouter({
	updateRole: update,
	setInactive,
});
