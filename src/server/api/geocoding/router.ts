import { createTRPCRouter } from "../trpc";
import search from "./controller/search";

export const geocodingRouter = createTRPCRouter({
	search,
});
