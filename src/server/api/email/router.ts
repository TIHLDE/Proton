import { createTRPCRouter } from "../trpc";
import getStatus from "./controller/get-status";
import updateStatus from "./controller/update-status";

export const emailRouter = createTRPCRouter({
	getStatus,
	updateStatus,
});
