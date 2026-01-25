import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { eventRouter } from "./event/router";
import { meRouter } from "./me/router";
import { pushRouter } from "./push/router";
import { registrationRouter } from "./registration/router";
import { teamRouter } from "./team/router";
import { userRouter } from "./user/router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	team: teamRouter,
	me: meRouter,
	event: eventRouter,
	user: userRouter,
	registration: registrationRouter,
	push: pushRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
