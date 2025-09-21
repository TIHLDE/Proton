export type TIHLDEUser = {
	user_id: string;
	first_name: string;
	last_name: string;
	email: string;
	study: {
		group: {
			name: string;
		};
	};
	studyyear: {
		group: {
			name: string;
		};
	};
};

export type Group = {
	name: string;
	slug: string;
	image: string;
};

export type Membership = {
	user: TIHLDEUser;
	membership_type: string;
	group: Group;
};

export type MembershipResponse = {
	count: number;
	next: number | null;
	previous: number | null;
	results: Membership[];
};
