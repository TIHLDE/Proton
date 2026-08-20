import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type z from "zod";
import { SetTeamGroupMembersSchema } from "~/schemas";
import { type Controller, authorizedProcedure } from "../../trpc";
import { hasTeamAccessMiddleware } from "../../util/auth";

const handler: Controller<
	z.infer<typeof SetTeamGroupMembersSchema>,
	void
> = async ({ input, ctx }) => {
	const group = await ctx.db.teamGroup.findUnique({
		where: { id: input.groupId },
		include: { members: { select: { userId: true } } },
	});

	if (!group) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Undergruppen finnes ikke.",
		});
	}

	await hasTeamAccessMiddleware(ctx.user as User, group.teamId, [
		"ADMIN",
		"SUBADMIN",
	]);

	const wanted = new Set(input.userIds);

	// Bare folk som faktisk er medlem av laget kan være med i en undergruppe.
	const eligible = await ctx.db.teamMember.findMany({
		where: {
			teamId: group.teamId,
			userId: { in: [...wanted] },
		},
		select: { userId: true },
	});

	if (eligible.length !== wanted.size) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Noen av brukerne er ikke medlem av laget.",
		});
	}

	const current = new Set(group.members.map((member) => member.userId));
	const toAdd = [...wanted].filter((userId) => !current.has(userId));
	const toRemove = [...current].filter((userId) => !wanted.has(userId));

	// Eksisterende medlemskap røres ikke, slik at createdAt består. Den brukes
	// til å la være å telle arrangementer fra før spilleren ble med i gruppa.
	await ctx.db.$transaction([
		...(toRemove.length
			? [
					ctx.db.teamGroupMember.deleteMany({
						where: { groupId: group.id, userId: { in: toRemove } },
					}),
				]
			: []),
		...(toAdd.length
			? [
					ctx.db.teamGroupMember.createMany({
						data: toAdd.map((userId) => ({ groupId: group.id, userId })),
					}),
				]
			: []),
	]);
};

export default authorizedProcedure
	.input(SetTeamGroupMembersSchema)
	.mutation(handler);
