import { createTRPCRouter } from "../trpc";
import applyCourtRule from "./controller/apply-court-rule";
import getCourt from "./controller/get-court";
import getLaws from "./controller/get-laws";
import giveNoResponse from "./controller/give-no-response";
import setLastCourtDate from "./controller/set-last-court-date";

export const fineRouter = createTRPCRouter({
	getLaws,
	giveNoResponse,
	getCourt,
	applyCourtRule,
	setLastCourtDate,
});
