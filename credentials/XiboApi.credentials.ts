import type {
	ICredentialType,
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
}
