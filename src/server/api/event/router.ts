import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import deleteEvent from "./controller/delete";
import update from "./controller/update";

export const eventRouter = createTRPCRouter({
	create,
	update,
	delete: deleteEvent,
});
