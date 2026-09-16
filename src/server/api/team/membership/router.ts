import { createTRPCRouter } from "../../trpc";
import update from "./controller/update";
import updateStatus from "./controller/update-status";

export const membershipRouter = createTRPCRouter({
	updateRole: update,
	updateStatus: updateStatus,
});
