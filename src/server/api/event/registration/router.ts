import { createTRPCRouter } from "../../trpc";
import notify from "./controller/notify";

export const registrationRouter = createTRPCRouter({
	notify,
});
