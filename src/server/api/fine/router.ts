import { createTRPCRouter } from "../trpc";
import getLaws from "./controller/get-laws";
import giveNoResponse from "./controller/give-no-response";

export const fineRouter = createTRPCRouter({
	getLaws,
	giveNoResponse,
});
