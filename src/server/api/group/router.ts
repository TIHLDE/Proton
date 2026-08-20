import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import deleteGroup from "./controller/delete";
import setMembers from "./controller/set-members";
import update from "./controller/update";

export const groupRouter = createTRPCRouter({
	create,
	update,
	delete: deleteGroup,
	setMembers,
});
