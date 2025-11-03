export interface AuthProvider {
	name: string;
}

export const authProviders: AuthProvider[] = [
	{ name: 'dev' },
	{ name: 'google' },
	{ name: 'github' },
	{ name: 'email' },
];

