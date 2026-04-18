import { createTRPCRouter } from "~/server/api/trpc";
import { calendarRouter } from "./calendar/router";
import { teamRouter } from "./team/router";

export const meRouter = createTRPCRouter({
	team: teamRouter,
	calendar: calendarRouter,
});
