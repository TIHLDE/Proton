import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import deleteEvent from "./controller/delete";
import getInviteInfo from "./controller/get-invite-info";
import getUnanswered from "./controller/get-unanswered";
import update from "./controller/update";
import { registrationRouter } from "./registration/router";

export const eventRouter = createTRPCRouter({
	create,
	update,
	delete: deleteEvent,
	getUnanswered,
	getInviteInfo,
	registration: registrationRouter,
});
