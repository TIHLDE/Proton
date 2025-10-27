export type EmailContent =
	| { type: "title"; content: string; url?: never }
	| { type: "text"; content: string; url?: never }
	| { type: "button"; text: string; url: string };
