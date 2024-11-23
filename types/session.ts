export interface User {
	id: string;
	email?: string;
	name?: string;
	avatar_url?: string;
	wallet_address?: string;
	user_metadata?: {
		full_name?: string;
		avatar_url?: string;
		wallet_address?: string;
	};
}

export interface Session {
	user: User;
	expires: string;
}
