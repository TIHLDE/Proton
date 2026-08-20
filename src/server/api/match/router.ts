import { createTRPCRouter } from "../trpc";
import addEvent from "./controller/add-event";
import deleteEvent from "./controller/delete-event";
import getByEvent from "./controller/get-by-event";
import getPlayers from "./controller/get-players";
import getStats from "./controller/get-stats";
import saveResult from "./controller/save-result";

export const matchRouter = createTRPCRouter({
	getByEvent,
	getPlayers,
	getStats,
	saveResult,
	addEvent,
	deleteEvent,
});
