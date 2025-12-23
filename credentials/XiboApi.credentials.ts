import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class XiboApi implements ICredentialType {
	name = 'xiboApi';
	displayName = 'Xibo API';
	documentationUrl = 'https://xibosignage.com/docs/developer/cms-api/auth';
	properties: INodeProperties[] = [
		{
			displayName: 'CMS URL',
			name: 'url',
			type: 'string',
			default: '',
			placeholder: 'https://your-xibo-cms.com',
			description: 'The URL of your Xibo CMS instance (without trailing slash)',
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			description: 'The Client ID from your Xibo CMS Application (found in My Account > Applications)',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The Client Secret from your Xibo CMS Application',
			required: true,
		},
	];

	async preAuthentication(this: IHttpRequestHelper) {
		const credentials = await this.getCredentials('xiboApi');
		const url = (credentials.url as string).replace(/\/$/, '');

		// Get OAuth2 access token using client_credentials grant
		const tokenResponse = await this.helpers.httpRequest({
			method: 'POST',
			url: `${url}/api/authorize/access_token`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'client_credentials',
				client_id: credentials.clientId as string,
				client_secret: credentials.clientSecret as string,
			}).toString(),
			json: true,
		});

		return { access_token: tokenResponse.access_token };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.access_token}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/api/about',
		},
	};
}
