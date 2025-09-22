import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import update from "./controller/update";
import deleteTeam from "./controller/delete";

export const teamRouter = createTRPCRouter({
	create,
	update,
	delete: deleteTeam,
});
