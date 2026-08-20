import { TRPCError } from "@trpc/server";
import { type Controller, authorizedProcedure } from "~/server/api/trpc";
import { syncTeamMemberships } from "~/services";

const handler: Controller<void, void> = async ({ ctx }) => {
	const result = await syncTeamMemberships(ctx.user.id);

	if (result.ok) return;

	// Årsakene skilles fordi de krever helt ulik handling: den ene løses av å
	// logge inn på nytt, den andre av å vente på at Photon er oppe.
	if (result.reason === "no-session") {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Du er ikke logget inn.",
		});
	}

	if (result.reason === "reauth") {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message:
				"Tilgangen til TIHLDE har utløpt. Logg ut og inn igjen for å hente medlemskapene dine.",
		});
	}

	throw new TRPCError({
		code: "BAD_GATEWAY",
		message: `Kunne ikke hente medlemskap fra TIHLDE (feil ${result.status}). Prøv igjen senere.`,
	});
};

export default authorizedProcedure.mutation(handler);
