import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class Xibo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Xibo',
		name: 'xibo',
		icon: 'file:xibo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Xibo CMS',
		defaults: {
			name: 'Xibo',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'xiboApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.url}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Display',
						value: 'display',
					},
					{
						name: 'Layout',
						value: 'layout',
					},
					{
						name: 'Media',
						value: 'media',
					},
					{
						name: 'Schedule',
						value: 'schedule',
					},
				],
				default: 'display',
			},
			// Display Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['display'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a display',
						action: 'Get a display',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many displays',
						action: 'Get many displays',
					},
				],
				default: 'get',
			},
			// Display ID
			{
				displayName: 'Display ID',
				name: 'displayId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['display'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the display',
			},
			// Layout Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['layout'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a layout',
						action: 'Get a layout',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many layouts',
						action: 'Get many layouts',
					},
				],
				default: 'get',
			},
			// Layout ID
			{
				displayName: 'Layout ID',
				name: 'layoutId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['layout'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the layout',
			},
			// Media Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['media'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a media file',
						action: 'Get a media file',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many media files',
						action: 'Get many media files',
					},
				],
				default: 'get',
			},
			// Media ID
			{
				displayName: 'Media ID',
				name: 'mediaId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['media'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the media file',
			},
			// Schedule Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a schedule',
						action: 'Get a schedule',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many schedules',
						action: 'Get many schedules',
					},
				],
				default: 'get',
			},
			// Schedule ID
			{
				displayName: 'Schedule ID',
				name: 'scheduleId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the schedule',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'display') {
					if (operation === 'get') {
						const displayId = this.getNodeParameter('displayId', i) as string;
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/display/${displayId}`,
							},
						);
						returnData.push({ json: responseData });
					} else if (operation === 'getAll') {
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: '/api/display',
							},
						);
						returnData.push({ json: responseData });
					}
				} else if (resource === 'layout') {
					if (operation === 'get') {
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/layout/${layoutId}`,
							},
						);
						returnData.push({ json: responseData });
					} else if (operation === 'getAll') {
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: '/api/layout',
							},
						);
						returnData.push({ json: responseData });
					}
				} else if (resource === 'media') {
					if (operation === 'get') {
						const mediaId = this.getNodeParameter('mediaId', i) as string;
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/library/${mediaId}`,
							},
						);
						returnData.push({ json: responseData });
					} else if (operation === 'getAll') {
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: '/api/library',
							},
						);
						returnData.push({ json: responseData });
					}
				} else if (resource === 'schedule') {
					if (operation === 'get') {
						const scheduleId = this.getNodeParameter('scheduleId', i) as string;
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/schedule/${scheduleId}`,
							},
						);
						returnData.push({ json: responseData });
					} else if (operation === 'getAll') {
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: '/api/schedule',
							},
						);
						returnData.push({ json: responseData });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error);
			}
		}

		return [returnData];
	}
}
