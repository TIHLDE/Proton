import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import deleteTeam from "./controller/delete";
import update from "./controller/update";

export const teamRouter = createTRPCRouter({
	create,
	update,
	delete: deleteTeam,
});
