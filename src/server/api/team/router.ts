import { createTRPCRouter } from "../trpc";
import create from "./controller/create";

export const teamRouter = createTRPCRouter({
	create,
});
