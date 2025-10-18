import { createTRPCRouter } from "../trpc";
import updateRole from "./controller/update-role";

export const userRouter = createTRPCRouter({
	updateRole,
});
