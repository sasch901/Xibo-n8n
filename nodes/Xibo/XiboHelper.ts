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

	try {
		const tokenResponse = await context.helpers.httpRequest({
			method: 'POST',
			url: `${url}/api/authorize/access_token`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: `grant_type=client_credentials&client_id=${encodeURIComponent(
				credentials.clientId as string,
			)}&client_secret=${encodeURIComponent(credentials.clientSecret as string)}`,
		});

		// Parse JSON response if it's a string
		const response = typeof tokenResponse === 'string' ? JSON.parse(tokenResponse) : tokenResponse;

		if (!response.access_token) {
			throw new Error('No access token in response');
		}

		// Cache token for 50 minutes (tokens usually expire after 1 hour)
		cachedToken = {
			token: response.access_token as string,
			expiresAt: Date.now() + 50 * 60 * 1000,
		};

		return cachedToken.token;
	} catch (error: any) {
		// Provide more detailed error message
		const errorMessage = error.response?.body?.error_description
			|| error.response?.body?.message
			|| error.message
			|| 'Unknown error';
		throw new Error(`Xibo OAuth2 authentication failed: ${errorMessage}`);
	}
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

export async function xiboApiRequestAllItems(
	context: IExecuteFunctions,
	endpoint: string,
	accessToken: string,
	baseUrl: string,
	qs: IDataObject = {},
	limit?: number,
): Promise<any[]> {
	const returnAll = limit === undefined;
	const results: any[] = [];
	let start = 0;
	const pageSize = 100; // Fetch 100 items per request

	do {
		const queryParams = {
			...qs,
			start,
			length: returnAll ? pageSize : Math.min(pageSize, limit! - results.length),
		};

		const response = await xiboApiRequest(
			context,
			'GET',
			endpoint,
			accessToken,
			baseUrl,
			undefined,
			queryParams,
		);

		// Xibo API returns an array directly
		const items = Array.isArray(response) ? response : [];

		if (items.length === 0) {
			break;
		}

		results.push(...items);
		start += items.length;

		// If we got fewer items than requested, we've reached the end
		if (items.length < pageSize) {
			break;
		}

		// If we have a limit and reached it, stop
		if (!returnAll && results.length >= limit!) {
			break;
		}
	} while (returnAll || results.length < limit!);

	// Trim to exact limit if specified
	if (!returnAll && results.length > limit!) {
		return results.slice(0, limit);
	}

	return results;
}
