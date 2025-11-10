import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import deleteRegistration from "./controller/delete";
import getAllByEvent from "./controller/get-all-by-event";
import getCounts from "./controller/get-counts";
import getMyRegistration from "./controller/get-my-registration";
import getNonResponded from "./controller/get-non-responded";

export const registrationRouter = createTRPCRouter({
	create,
	delete: deleteRegistration,
	getMyRegistration,
	getAllByEvent,
	getCounts,
	getNonResponded,
});
