import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import deleteGroup from "./controller/delete";
import getByTeam from "./controller/get-by-team";
import setMembers from "./controller/set-members";
import update from "./controller/update";

export const groupRouter = createTRPCRouter({
	create,
	update,
	getByTeam,
	delete: deleteGroup,
	setMembers,
});
