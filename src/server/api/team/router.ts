import { createTRPCRouter } from "../trpc";
import create from "./controller/create";
import deleteTeam from "./controller/delete";
import getAttendanceStats from "./controller/get-attendance-stats";
import update from "./controller/update";
import { membershipRouter } from "./membership/router";

export const teamRouter = createTRPCRouter({
	create,
	update,
	delete: deleteTeam,
	getAttendanceStats,
	membership: membershipRouter,
});
