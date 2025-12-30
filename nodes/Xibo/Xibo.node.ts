import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getAccessToken, xiboApiRequest } from './XiboHelper';

export class Xibo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Xibo',
		name: 'xibo',
		icon: 'file:xibo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Xibo CMS API v4',
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
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Campaign',
						value: 'campaign',
					},
					{
						name: 'Command',
						value: 'command',
					},
					{
						name: 'DataSet',
						value: 'dataset',
					},
					{
						name: 'Display',
						value: 'display',
					},
					{
						name: 'Display Group',
						value: 'displayGroup',
					},
					{
						name: 'Folder',
						value: 'folder',
					},
					{
						name: 'Layout',
						value: 'layout',
					},
					{
						name: 'Library (Media)',
						value: 'library',
					},
					{
						name: 'Notification',
						value: 'notification',
					},
					{
						name: 'Playlist',
						value: 'playlist',
					},
					{
						name: 'Schedule',
						value: 'schedule',
					},
					{
						name: 'Tag',
						value: 'tag',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'display',
			},

			// ====================================
			// Display Operations
			// ====================================
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
						name: 'Authorize',
						value: 'authorize',
						description: 'Authorize a display',
						action: 'Authorize a display',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a display by ID',
						action: 'Get a display',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many displays',
						action: 'Get many displays',
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get display status',
						action: 'Get display status',
					},
					{
						name: 'Request Screenshot',
						value: 'requestScreenshot',
						description: 'Request a screenshot from display',
						action: 'Request screenshot from display',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a display',
						action: 'Update a display',
					},
					{
						name: 'Wake On LAN',
						value: 'wakeOnLan',
						description: 'Send Wake On LAN command',
						action: 'Wake display on LAN',
					},
				],
				default: 'getAll',
			},

			// Display ID (for single display operations)
			{
				displayName: 'Display Name or ID',
				name: 'displayId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getDisplays',
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['display'],
						operation: ['get', 'getStatus', 'update', 'authorize', 'requestScreenshot', 'wakeOnLan'],
					},
				},
				default: '',
				description: 'The display to use. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			// Display Update Fields
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['display'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Display Name',
						name: 'display',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'A description for this display',
					},
					{
						displayName: 'Default Layout ID',
						name: 'defaultLayoutId',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Licensed',
						name: 'licensed',
						type: 'boolean',
						default: true,
						description: 'Whether the display is licensed',
					},
				],
			},

			// Display Filters (for getAll)
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['display'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Display Name',
						name: 'display',
						type: 'string',
						default: '',
						description: 'Filter by display name',
					},
					{
						displayName: 'Display Group ID',
						name: 'displayGroupId',
						type: 'string',
						default: '',
						description: 'Filter by display group',
					},
					{
						displayName: 'Authorized',
						name: 'authorised',
						type: 'boolean',
						default: true,
						description: 'Whether to filter by authorization status',
					},
				],
			},

			// ====================================
			// Layout Operations
			// ====================================
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
						name: 'Checkout',
						value: 'checkout',
						description: 'Checkout a layout for editing',
						action: 'Checkout a layout',
					},
					{
						name: 'Copy',
						value: 'copy',
						description: 'Copy a layout',
						action: 'Copy a layout',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new layout',
						action: 'Create a layout',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a layout',
						action: 'Delete a layout',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a layout by ID',
						action: 'Get a layout',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many layouts',
						action: 'Get many layouts',
					},
					{
						name: 'Publish',
						value: 'publish',
						description: 'Publish a layout',
						action: 'Publish a layout',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a layout',
						action: 'Update a layout',
					},
				],
				default: 'getAll',
			},

			// Layout ID
			{
				displayName: 'Layout Name or ID',
				name: 'layoutId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLayouts',
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['layout'],
						operation: ['get', 'update', 'delete', 'publish', 'checkout', 'copy'],
					},
				},
				default: '',
				description: 'The layout to use. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			// Layout Create Fields
			{
				displayName: 'Layout Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['layout'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The name of the layout',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['layout'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'The description of the layout',
					},
					{
						displayName: 'Resolution ID',
						name: 'resolutionId',
						type: 'string',
						default: '',
						description: 'The resolution ID for the layout',
					},
				],
			},

			// Layout Update Fields
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['layout'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Layout Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'The name of the layout',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'The description of the layout',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags',
					},
				],
			},

			// Layout Copy Fields
			{
				displayName: 'New Layout Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['layout'],
						operation: ['copy'],
					},
				},
				default: '',
				description: 'The name for the copied layout',
			},

			// ====================================
			// Library (Media) Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['library'],
					},
				},
				options: [
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a media file',
						action: 'Delete a media file',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a media file by ID',
						action: 'Get a media file',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many media files',
						action: 'Get many media files',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update media file details',
						action: 'Update a media file',
					},
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload a new media file',
						action: 'Upload a media file',
					},
				],
				default: 'getAll',
			},

			// Media ID
			{
				displayName: 'Media ID',
				name: 'mediaId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['library'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the media file',
			},

			// Media Update Fields
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['library'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'The media file name',
					},
					{
						displayName: 'Duration',
						name: 'duration',
						type: 'number',
						default: 0,
						description: 'The duration in seconds',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags',
					},
				],
			},

			// Media Upload Fields
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: ['library'],
						operation: ['upload'],
					},
				},
				description: 'Name of the binary property containing the file data',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['library'],
						operation: ['upload'],
					},
				},
				description: 'Name for the uploaded file',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['library'],
						operation: ['upload'],
					},
				},
				options: [
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags',
					},
					{
						displayName: 'Folder ID',
						name: 'folderId',
						type: 'string',
						default: '',
						description: 'The folder to upload the file to',
					},
				],
			},

			// Library Filters
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['library'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'media',
						type: 'string',
						default: '',
						description: 'Filter by media name',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'string',
						default: '',
						description: 'Filter by media type (e.g., image, video)',
					},
					{
						displayName: 'Owner User ID',
						name: 'ownerId',
						type: 'string',
						default: '',
						description: 'Filter by owner user ID',
					},
				],
			},

			// ====================================
			// Schedule Operations
			// ====================================
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
						name: 'Create',
						value: 'create',
						description: 'Create a schedule event',
						action: 'Create a schedule event',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a schedule event',
						action: 'Delete a schedule event',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a schedule event by ID',
						action: 'Get a schedule event',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many schedule events',
						action: 'Get many schedule events',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a schedule event',
						action: 'Update a schedule event',
					},
				],
				default: 'getAll',
			},

			// Schedule Event ID
			{
				displayName: 'Event ID',
				name: 'eventId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the schedule event',
			},

			// Schedule Create Fields
			{
				displayName: 'Event Type',
				name: 'eventTypeId',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'Layout',
						value: '1',
					},
					{
						name: 'Campaign',
						value: '2',
					},
					{
						name: 'Command',
						value: '3',
					},
				],
				default: '1',
				description: 'The type of event to schedule',
			},
			{
				displayName: 'Display Group ID',
				name: 'displayGroupIds',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Comma-separated list of display group IDs',
			},
			{
				displayName: 'From Date',
				name: 'fromDt',
				type: 'dateTime',
				required: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Start date/time for the event',
			},
			{
				displayName: 'To Date',
				name: 'toDt',
				type: 'dateTime',
				required: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'End date/time for the event',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['schedule'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Campaign ID',
						name: 'campaignId',
						type: 'string',
						default: '',
						description: 'The campaign ID to schedule',
					},
					{
						displayName: 'Layout ID',
						name: 'layoutId',
						type: 'string',
						default: '',
						description: 'The layout ID to schedule',
					},
					{
						displayName: 'Command ID',
						name: 'commandId',
						type: 'string',
						default: '',
						description: 'The command ID to schedule',
					},
					{
						displayName: 'Priority',
						name: 'isPriority',
						type: 'boolean',
						default: false,
						description: 'Whether this is a priority event',
					},
				],
			},

			// ====================================
			// Display Group Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['displayGroup'],
					},
				},
				options: [
					{
						name: 'Change Layout',
						value: 'changeLayout',
						description: 'Change layout on display group',
						action: 'Change layout on display group',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a display group',
						action: 'Create a display group',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a display group',
						action: 'Delete a display group',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a display group by ID',
						action: 'Get a display group',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many display groups',
						action: 'Get many display groups',
					},
					{
						name: 'Send Command',
						value: 'sendCommand',
						description: 'Send command to display group',
						action: 'Send command to display group',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a display group',
						action: 'Update a display group',
					},
				],
				default: 'getAll',
			},

			// Display Group ID
			{
				displayName: 'Display Group Name or ID',
				name: 'displayGroupId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getDisplayGroups',
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['displayGroup'],
						operation: ['get', 'update', 'delete', 'changeLayout', 'sendCommand'],
					},
				},
				default: '',
				description: 'The display group to use. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			// Display Group Create Fields
			{
				displayName: 'Display Group Name',
				name: 'displayGroup',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['displayGroup'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The name of the display group',
			},

			// Change Layout Fields
			{
				displayName: 'Layout ID',
				name: 'layoutId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['displayGroup'],
						operation: ['changeLayout'],
					},
				},
				default: '',
				description: 'The layout ID to display',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['displayGroup'],
						operation: ['changeLayout'],
					},
				},
				default: 0,
				description: 'Duration in seconds (0 for indefinite)',
			},

			// Send Command Fields
			{
				displayName: 'Command ID',
				name: 'commandId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['displayGroup'],
						operation: ['sendCommand'],
					},
				},
				default: '',
				description: 'The command ID to send',
			},

			// ====================================
			// Campaign Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['campaign'],
					},
				},
				options: [
					{
						name: 'Assign Layout',
						value: 'assignLayout',
						description: 'Assign layout to campaign',
						action: 'Assign layout to campaign',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a campaign',
						action: 'Create a campaign',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a campaign',
						action: 'Delete a campaign',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a campaign by ID',
						action: 'Get a campaign',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many campaigns',
						action: 'Get many campaigns',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a campaign',
						action: 'Update a campaign',
					},
				],
				default: 'getAll',
			},

			// Campaign ID
			{
				displayName: 'Campaign Name or ID',
				name: 'campaignId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCampaigns',
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: ['get', 'update', 'delete', 'assignLayout'],
					},
				},
				default: '',
				description: 'The campaign to use. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			// Campaign Create Fields
			{
				displayName: 'Campaign Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The name of the campaign',
			},

			// Assign Layout Field
			{
				displayName: 'Layout IDs',
				name: 'layoutId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['campaign'],
						operation: ['assignLayout'],
					},
				},
				default: '',
				description: 'Comma-separated list of layout IDs to assign',
			},

			// ====================================
			// Playlist Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['playlist'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a playlist',
						action: 'Create a playlist',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a playlist',
						action: 'Delete a playlist',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a playlist by ID',
						action: 'Get a playlist',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many playlists',
						action: 'Get many playlists',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a playlist',
						action: 'Update a playlist',
					},
				],
				default: 'getAll',
			},

			// Playlist ID
			{
				displayName: 'Playlist ID',
				name: 'playlistId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['playlist'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the playlist',
			},

			// Playlist Create Fields
			{
				displayName: 'Playlist Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['playlist'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The name of the playlist',
			},

			// ====================================
			// DataSet Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['dataset'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a dataset',
						action: 'Create a dataset',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a dataset',
						action: 'Delete a dataset',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a dataset by ID',
						action: 'Get a dataset',
					},
					{
						name: 'Get Data',
						value: 'getData',
						description: 'Get dataset data (rows)',
						action: 'Get dataset data',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many datasets',
						action: 'Get many datasets',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a dataset',
						action: 'Update a dataset',
					},
				],
				default: 'getAll',
			},

			// DataSet ID
			{
				displayName: 'DataSet ID',
				name: 'dataSetId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['dataset'],
						operation: ['get', 'update', 'delete', 'getData'],
					},
				},
				default: '',
				description: 'The ID of the dataset',
			},

			// DataSet Create Fields
			{
				displayName: 'DataSet Name',
				name: 'dataSet',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['dataset'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The name of the dataset',
			},

			// ====================================
			// Command Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['command'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many commands',
						action: 'Get many commands',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a command by ID',
						action: 'Get a command',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Command ID',
				name: 'commandId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['command'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the command',
			},

			// ====================================
			// Tag Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['tag'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a tag',
						action: 'Create a tag',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a tag',
						action: 'Delete a tag',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a tag by ID',
						action: 'Get a tag',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many tags',
						action: 'Get many tags',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a tag',
						action: 'Update a tag',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Tag ID',
				name: 'tagId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['tag'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the tag',
			},
			{
				displayName: 'Tag Name',
				name: 'tag',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['tag'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The name of the tag',
			},

			// ====================================
			// User Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a user',
						action: 'Create a user',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a user',
						action: 'Delete a user',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a user by ID',
						action: 'Get a user',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many users',
						action: 'Get many users',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a user',
						action: 'Update a user',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the user',
			},
			{
				displayName: 'Username',
				name: 'userName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The username for the new user',
			},
			{
				displayName: 'User Type',
				name: 'userTypeId',
				type: 'options',
				options: [
					{
						name: 'User',
						value: 3,
					},
					{
						name: 'Group Admin',
						value: 2,
					},
					{
						name: 'Super Admin',
						value: 1,
					},
				],
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
				default: 3,
			},

			// ====================================
			// Notification Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['notification'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many notifications',
						action: 'Get many notifications',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a notification by ID',
						action: 'Get a notification',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Notification ID',
				name: 'notificationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the notification',
			},

			// ====================================
			// Folder Operations
			// ====================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['folder'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many folders',
						action: 'Get many folders',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a folder by ID',
						action: 'Get a folder',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a folder',
						action: 'Create a folder',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Folder ID',
				name: 'folderId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the folder',
			},
			{
				displayName: 'Folder Name',
				name: 'folderName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The name of the folder',
			},
		],
	};

	methods = {
		loadOptions: {
			async getDisplays(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('xiboApi');
				const accessToken = await getAccessToken(this as any, credentials);
				const baseUrl = (credentials.url as string).replace(/\/$/, '');

				const displays = await xiboApiRequest(
					this as any,
					'GET',
					'/api/display',
					accessToken,
					baseUrl,
				);

				return displays.map((display: any) => ({
					name: display.display,
					value: display.displayId,
				}));
			},

			async getLayouts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('xiboApi');
				const accessToken = await getAccessToken(this as any, credentials);
				const baseUrl = (credentials.url as string).replace(/\/$/, '');

				const layouts = await xiboApiRequest(
					this as any,
					'GET',
					'/api/layout',
					accessToken,
					baseUrl,
				);

				return layouts.map((layout: any) => ({
					name: layout.layout,
					value: layout.layoutId,
				}));
			},

			async getCampaigns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('xiboApi');
				const accessToken = await getAccessToken(this as any, credentials);
				const baseUrl = (credentials.url as string).replace(/\/$/, '');

				const campaigns = await xiboApiRequest(
					this as any,
					'GET',
					'/api/campaign',
					accessToken,
					baseUrl,
				);

				return campaigns.map((campaign: any) => ({
					name: campaign.campaign,
					value: campaign.campaignId,
				}));
			},

			async getDisplayGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('xiboApi');
				const accessToken = await getAccessToken(this as any, credentials);
				const baseUrl = (credentials.url as string).replace(/\/$/, '');

				const displayGroups = await xiboApiRequest(
					this as any,
					'GET',
					'/api/displaygroup',
					accessToken,
					baseUrl,
				);

				return displayGroups.map((group: any) => ({
					name: group.displayGroup,
					value: group.displayGroupId,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials and access token once for all items
		const credentials = await this.getCredentials('xiboApi');
		const accessToken = await getAccessToken(this, credentials);
		const baseUrl = (credentials.url as string).replace(/\/$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				// ====================================
				// Display Resource
				// ====================================
				if (resource === 'display') {
					if (operation === 'getAll') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (filters.display) qs.display = filters.display;
						if (filters.displayGroupId) qs.displayGroupId = filters.displayGroupId;
						if (filters.authorised !== undefined) qs.authorised = filters.authorised ? 1 : 0;

						responseData = await xiboApiRequest(
						this,
						'GET',
						'/api/display',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'get') {
						const displayId = this.getNodeParameter('displayId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/display/${displayId}`,
							},
						);
					} else if (operation === 'getStatus') {
						const displayId = this.getNodeParameter('displayId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/display/status/${displayId}`,
							},
						);
					} else if (operation === 'update') {
						const displayId = this.getNodeParameter('displayId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/display/${displayId}`,
								body: updateFields,
							},
						);
					} else if (operation === 'authorize') {
						const displayId = this.getNodeParameter('displayId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/display/authorise/${displayId}`,
							},
						);
					} else if (operation === 'requestScreenshot') {
						const displayId = this.getNodeParameter('displayId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/display/requestscreenshot/${displayId}`,
							},
						);
					} else if (operation === 'wakeOnLan') {
						const displayId = this.getNodeParameter('displayId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: `/api/display/wol/${displayId}`,
							},
						);
					}
				}

				// ====================================
				// Layout Resource
				// ====================================
				else if (resource === 'layout') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
						this,
						'GET',
						'/api/layout',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'get') {
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/layout/${layoutId}`,
							},
						);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							name,
							...additionalFields,
						};

						responseData = await xiboApiRequest(
						this,
						'POST',
						'/api/layout',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'update') {
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/layout/${layoutId}`,
								body: updateFields,
							},
						);
					} else if (operation === 'delete') {
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'DELETE',
								url: `/api/layout/${layoutId}`,
							},
						);
					} else if (operation === 'publish') {
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/layout/publish/${layoutId}`,
							},
						);
					} else if (operation === 'checkout') {
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/layout/checkout/${layoutId}`,
							},
						);
					} else if (operation === 'copy') {
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						const name = this.getNodeParameter('name', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: `/api/layout/copy/${layoutId}`,
								body: { name },
							},
						);
					}
				}

				// ====================================
				// Library (Media) Resource
				// ====================================
				else if (resource === 'library') {
					if (operation === 'getAll') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (filters.media) qs.media = filters.media;
						if (filters.type) qs.type = filters.type;
						if (filters.ownerId) qs.ownerId = filters.ownerId;

						responseData = await xiboApiRequest(
						this,
						'GET',
						'/api/library',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'get') {
						const mediaId = this.getNodeParameter('mediaId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/library/${mediaId}`,
							},
						);
					} else if (operation === 'update') {
						const mediaId = this.getNodeParameter('mediaId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/library/${mediaId}`,
								body: updateFields,
							},
						);
					} else if (operation === 'delete') {
						const mediaId = this.getNodeParameter('mediaId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'DELETE',
								url: `/api/library/${mediaId}`,
							},
						);
					} else if (operation === 'upload') {
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const fileName = this.getNodeParameter('fileName', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const binaryData = items[i].binary;
						if (!binaryData || !binaryData[binaryPropertyName]) {
							throw new NodeOperationError(
								this.getNode(),
								`No binary data found for property "${binaryPropertyName}"`,
								{ itemIndex: i },
							);
						}

						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

						// Create multipart form data
						const FormData = require('form-data');
						const formData = new FormData();
						formData.append('files', fileBuffer, {
							filename: fileName,
							contentType: binaryData[binaryPropertyName].mimeType || 'application/octet-stream',
						});

						if (additionalFields.tags) {
							formData.append('tags', additionalFields.tags as string);
						}
						if (additionalFields.folderId) {
							formData.append('folderId', additionalFields.folderId as string);
						}

						responseData = await this.helpers.httpRequest({
							method: 'POST',
							url: `${baseUrl}/api/library`,
							headers: {
								Authorization: `Bearer ${accessToken}`,
								...formData.getHeaders(),
							},
							body: formData,
						});
					}
				}

				// ====================================
				// Schedule Resource
				// ====================================
				else if (resource === 'schedule') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
						this,
						'GET',
						'/api/schedule',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'get') {
						const eventId = this.getNodeParameter('eventId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/schedule/${eventId}`,
							},
						);
					} else if (operation === 'create') {
						const eventTypeId = this.getNodeParameter('eventTypeId', i) as string;
						const displayGroupIds = this.getNodeParameter('displayGroupIds', i) as string;
						const fromDt = this.getNodeParameter('fromDt', i) as string;
						const toDt = this.getNodeParameter('toDt', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							eventTypeId,
							displayGroupIds: displayGroupIds.split(',').map(id => id.trim()),
							fromDt,
							toDt,
							...additionalFields,
						};

						responseData = await xiboApiRequest(
						this,
						'POST',
						'/api/schedule',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'update') {
						const eventId = this.getNodeParameter('eventId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/schedule/${eventId}`,
								body: updateFields,
							},
						);
					} else if (operation === 'delete') {
						const eventId = this.getNodeParameter('eventId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'DELETE',
								url: `/api/schedule/${eventId}`,
							},
						);
					}
				}

				// ====================================
				// Display Group Resource
				// ====================================
				else if (resource === 'displayGroup') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
						this,
						'GET',
						'/api/displaygroup',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'get') {
						const displayGroupId = this.getNodeParameter('displayGroupId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/displaygroup/${displayGroupId}`,
							},
						);
					} else if (operation === 'create') {
						const displayGroup = this.getNodeParameter('displayGroup', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: '/api/displaygroup',
								body: { displayGroup },
							},
						);
					} else if (operation === 'update') {
						const displayGroupId = this.getNodeParameter('displayGroupId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/displaygroup/${displayGroupId}`,
								body: updateFields,
							},
						);
					} else if (operation === 'delete') {
						const displayGroupId = this.getNodeParameter('displayGroupId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'DELETE',
								url: `/api/displaygroup/${displayGroupId}`,
							},
						);
					} else if (operation === 'changeLayout') {
						const displayGroupId = this.getNodeParameter('displayGroupId', i) as string;
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						const duration = this.getNodeParameter('duration', i, 0) as number;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: `/api/displaygroup/${displayGroupId}/action/changeLayout`,
								body: {
									layoutId,
									duration,
								},
							},
						);
					} else if (operation === 'sendCommand') {
						const displayGroupId = this.getNodeParameter('displayGroupId', i) as string;
						const commandId = this.getNodeParameter('commandId', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: `/api/displaygroup/${displayGroupId}/action/command`,
								body: { commandId },
							},
						);
					}
				}

				// ====================================
				// Campaign Resource
				// ====================================
				else if (resource === 'campaign') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
						this,
						'GET',
						'/api/campaign',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'get') {
						const campaignId = this.getNodeParameter('campaignId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/campaign/${campaignId}`,
							},
						);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: '/api/campaign',
								body: { name },
							},
						);
					} else if (operation === 'update') {
						const campaignId = this.getNodeParameter('campaignId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/campaign/${campaignId}`,
								body: updateFields,
							},
						);
					} else if (operation === 'delete') {
						const campaignId = this.getNodeParameter('campaignId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'DELETE',
								url: `/api/campaign/${campaignId}`,
							},
						);
					} else if (operation === 'assignLayout') {
						const campaignId = this.getNodeParameter('campaignId', i) as string;
						const layoutId = this.getNodeParameter('layoutId', i) as string;

						const layoutIds = layoutId.split(',').map(id => id.trim());

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: `/api/campaign/layout/assign/${campaignId}`,
								body: { layoutId: layoutIds },
							},
						);
					}
				}

				// ====================================
				// Playlist Resource
				// ====================================
				else if (resource === 'playlist') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
						this,
						'GET',
						'/api/playlist',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'get') {
						const playlistId = this.getNodeParameter('playlistId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/playlist/${playlistId}`,
							},
						);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: '/api/playlist',
								body: { name },
							},
						);
					} else if (operation === 'update') {
						const playlistId = this.getNodeParameter('playlistId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/playlist/${playlistId}`,
								body: updateFields,
							},
						);
					} else if (operation === 'delete') {
						const playlistId = this.getNodeParameter('playlistId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'DELETE',
								url: `/api/playlist/${playlistId}`,
							},
						);
					}
				}

				// ====================================
				// DataSet Resource
				// ====================================
				else if (resource === 'dataset') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
						this,
						'GET',
						'/api/dataset',
						accessToken,
						baseUrl,
					);
					} else if (operation === 'get') {
						const dataSetId = this.getNodeParameter('dataSetId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/dataset/${dataSetId}`,
							},
						);
					} else if (operation === 'getData') {
						const dataSetId = this.getNodeParameter('dataSetId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'GET',
								url: `/api/dataset/data/${dataSetId}`,
							},
						);
					} else if (operation === 'create') {
						const dataSet = this.getNodeParameter('dataSet', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'POST',
								url: '/api/dataset',
								body: { dataSet },
							},
						);
					} else if (operation === 'update') {
						const dataSetId = this.getNodeParameter('dataSetId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'PUT',
								url: `/api/dataset/${dataSetId}`,
								body: updateFields,
							},
						);
					} else if (operation === 'delete') {
						const dataSetId = this.getNodeParameter('dataSetId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'xiboApi',
							{
								method: 'DELETE',
								url: `/api/dataset/${dataSetId}`,
							},
						);
					}
				}

				// ====================================
				// Command Resource
				// ====================================
				else if (resource === 'command') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
							this,
							'GET',
							'/api/command',
							accessToken,
							baseUrl,
						);
					} else if (operation === 'get') {
						const commandId = this.getNodeParameter('commandId', i) as string;
						responseData = await xiboApiRequest(
							this,
							'GET',
							`/api/command/${commandId}`,
							accessToken,
							baseUrl,
						);
					}
				}

				// ====================================
				// Tag Resource
				// ====================================
				else if (resource === 'tag') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
							this,
							'GET',
							'/api/tag',
							accessToken,
							baseUrl,
						);
					} else if (operation === 'get') {
						const tagId = this.getNodeParameter('tagId', i) as string;
						responseData = await xiboApiRequest(
							this,
							'GET',
							`/api/tag/${tagId}`,
							accessToken,
							baseUrl,
						);
					} else if (operation === 'create') {
						const tag = this.getNodeParameter('tag', i) as string;
						responseData = await xiboApiRequest(
							this,
							'POST',
							'/api/tag',
							accessToken,
							baseUrl,
							{ tag },
						);
					} else if (operation === 'update') {
						const tagId = this.getNodeParameter('tagId', i) as string;
						const tag = this.getNodeParameter('tag', i) as string;
						responseData = await xiboApiRequest(
							this,
							'PUT',
							`/api/tag/${tagId}`,
							accessToken,
							baseUrl,
							{ tag },
						);
					} else if (operation === 'delete') {
						const tagId = this.getNodeParameter('tagId', i) as string;
						responseData = await xiboApiRequest(
							this,
							'DELETE',
							`/api/tag/${tagId}`,
							accessToken,
							baseUrl,
						);
					}
				}

				// ====================================
				// User Resource
				// ====================================
				else if (resource === 'user') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
							this,
							'GET',
							'/api/user',
							accessToken,
							baseUrl,
						);
					} else if (operation === 'get') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await xiboApiRequest(
							this,
							'GET',
							`/api/user/${userId}`,
							accessToken,
							baseUrl,
						);
					} else if (operation === 'create') {
						const userName = this.getNodeParameter('userName', i) as string;
						const userTypeId = this.getNodeParameter('userTypeId', i) as number;
						responseData = await xiboApiRequest(
							this,
							'POST',
							'/api/user',
							accessToken,
							baseUrl,
							{ userName, userTypeId },
						);
					} else if (operation === 'update') {
						const userId = this.getNodeParameter('userId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
						responseData = await xiboApiRequest(
							this,
							'PUT',
							`/api/user/${userId}`,
							accessToken,
							baseUrl,
							updateFields,
						);
					} else if (operation === 'delete') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await xiboApiRequest(
							this,
							'DELETE',
							`/api/user/${userId}`,
							accessToken,
							baseUrl,
						);
					}
				}

				// ====================================
				// Notification Resource
				// ====================================
				else if (resource === 'notification') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
							this,
							'GET',
							'/api/notification',
							accessToken,
							baseUrl,
						);
					} else if (operation === 'get') {
						const notificationId = this.getNodeParameter('notificationId', i) as string;
						responseData = await xiboApiRequest(
							this,
							'GET',
							`/api/notification/${notificationId}`,
							accessToken,
							baseUrl,
						);
					}
				}

				// ====================================
				// Folder Resource
				// ====================================
				else if (resource === 'folder') {
					if (operation === 'getAll') {
						responseData = await xiboApiRequest(
							this,
							'GET',
							'/api/folder',
							accessToken,
							baseUrl,
						);
					} else if (operation === 'get') {
						const folderId = this.getNodeParameter('folderId', i) as string;
						responseData = await xiboApiRequest(
							this,
							'GET',
							`/api/folder/${folderId}`,
							accessToken,
							baseUrl,
						);
					} else if (operation === 'create') {
						const folderName = this.getNodeParameter('folderName', i) as string;
						responseData = await xiboApiRequest(
							this,
							'POST',
							'/api/folder',
							accessToken,
							baseUrl,
							{ folderName },
						);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
