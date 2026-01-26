import { createTRPCRouter } from "../trpc";
import getStatus from "./controller/get-status";
import sendTest from "./controller/send-test";
import subscribe from "./controller/subscribe";
import unsubscribe from "./controller/unsubscribe";

export const pushRouter = createTRPCRouter({
	subscribe,
	unsubscribe,
	getStatus,
	sendTest,
});
