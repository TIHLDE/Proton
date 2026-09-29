import { createTRPCRouter } from "../trpc";
import issueForNonResponders from "./controller/issue-for-non-responders";
import reverse from "./controller/reverse";

export const fineRouter = createTRPCRouter({
	issueForNonResponders,
	reverse,
});
