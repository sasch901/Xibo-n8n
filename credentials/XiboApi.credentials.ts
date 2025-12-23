import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class XiboApi implements ICredentialType {
	name = 'xiboApi';
	displayName = 'Xibo API';
	documentationUrl = 'https://xibosignage.com/docs/';
	properties: INodeProperties[] = [
		{
			displayName: 'CMS URL',
			name: 'url',
			type: 'string',
			default: '',
			placeholder: 'https://your-xibo-cms.com',
			description: 'The URL of your Xibo CMS instance',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			description: 'The Client ID from your Xibo CMS application',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The Client Secret from your Xibo CMS application',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.token}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/api/authorize/access_token',
		},
	};
}
