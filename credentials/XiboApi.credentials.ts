import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class XiboApi implements ICredentialType {
	name = 'xiboApi';
	displayName = 'Xibo API';
	documentationUrl = 'https://xibosignage.com/docs/developer/cms-api/auth';
	properties: INodeProperties[] = [
		{
			displayName: 'To get your API credentials: Log into your Xibo CMS → Click your username (top right) → My Account → Applications → Add Application. Set a name and select "client_credentials" as Grant Type. Copy the Client ID and Secret shown after creation.',
			name: 'notice',
			type: 'notice',
			default: '',
		},
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
			placeholder: 'WDzJ9MzQyZmRlOWJmNTE3YWRjOTc4MGFi',
			description: 'The Client ID from your Xibo CMS Application',
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

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/api/authorize/access_token',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: 'grant_type=client_credentials&client_id={{$credentials.clientId}}&client_secret={{$credentials.clientSecret}}',
		},
	};
}
