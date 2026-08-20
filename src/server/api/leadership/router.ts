import { createTRPCRouter } from "../trpc";
import { addAssignment, removeAssignment } from "./controller/assignments";
import { createPeriod, deletePeriod, updatePeriod } from "./controller/periods";
import {
	createPosition,
	deletePosition,
	updatePosition,
} from "./controller/positions";

export const leadershipRouter = createTRPCRouter({
	createPosition,
	updatePosition,
	deletePosition,
	createPeriod,
	updatePeriod,
	deletePeriod,
	addAssignment,
	removeAssignment,
});
