import type { IExecuteFunctions, IDataObject, ICredentialDataDecryptedObject } from 'n8n-workflow';

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(
	context: IExecuteFunctions,
	credentials: ICredentialDataDecryptedObject,
): Promise<string> {
	// Return cached token if still valid
	if (cachedToken && cachedToken.expiresAt > Date.now()) {
		return cachedToken.token;
	}

	const url = (credentials.url as string).replace(/\/$/, '');

	const tokenResponse = await context.helpers.httpRequest({
		method: 'POST',
		url: `${url}/api/authorize/access_token`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: `grant_type=client_credentials&client_id=${encodeURIComponent(
			credentials.clientId as string,
		)}&client_secret=${encodeURIComponent(credentials.clientSecret as string)}`,
		json: true,
	});

	// Cache token for 50 minutes (tokens usually expire after 1 hour)
	cachedToken = {
		token: tokenResponse.access_token as string,
		expiresAt: Date.now() + 50 * 60 * 1000,
	};

	return cachedToken.token;
}

export async function xiboApiRequest(
	context: IExecuteFunctions,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE',
	endpoint: string,
	accessToken: string,
	baseUrl: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<any> {
	const options: any = {
		method,
		url: `${baseUrl}${endpoint}`,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	return await context.helpers.httpRequest(options);
}
