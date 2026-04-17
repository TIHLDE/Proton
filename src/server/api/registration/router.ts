import { createTRPCRouter } from "../trpc";
import addAttendanceWithoutRsvp from "./controller/add-attendance-without-rsvp";
import adminUpdate from "./controller/admin-update";
import create from "./controller/create";
import deleteRegistration from "./controller/delete";
import getAllByEvent from "./controller/get-all-by-event";
import getCounts from "./controller/get-counts";
import getEligibleWithoutRsvp from "./controller/get-eligible-without-rsvp";
import getMyRegistration from "./controller/get-my-registration";
import getNonResponded from "./controller/get-non-responded";
import setConfirmedAbsent from "./controller/set-confirmed-absent";

export const registrationRouter = createTRPCRouter({
	create,
	delete: deleteRegistration,
	getMyRegistration,
	getAllByEvent,
	getCounts,
	getNonResponded,
	adminUpdate,
	setConfirmedAbsent,
	addAttendanceWithoutRsvp,
	getEligibleWithoutRsvp,
});
