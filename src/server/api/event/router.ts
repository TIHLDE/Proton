import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import deleteEvent from "./controller/delete";
import getUnanswered from "./controller/get-unanswered";
import update from "./controller/update";
import { registrationRouter } from "./registration/router";

export const eventRouter = createTRPCRouter({
	create,
	update,
	delete: deleteEvent,
	getUnanswered,
	registration: registrationRouter,
});
