# Xibo n8n Nodes

Custom n8n nodes for integrating Xibo CMS (Content Management System) with your n8n workflows.

## Features

This package provides n8n nodes to interact with Xibo CMS:

- **Display Management**: Get displays and their information
- **Layout Management**: Retrieve and manage layouts
- **Media Library**: Access and manage media files
- **Schedule Management**: Work with schedules

## Prerequisites

- Node.js v18.10 or higher
- pnpm v9.1 or higher
- A Xibo CMS instance with API access

## Installation

### For Development

1. Clone this repository:
```bash
git clone https://github.com/sasch901/Xibo-n8n.git
cd Xibo-n8n
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm run build
```

4. Link to n8n (for local development):
```bash
pnpm link
cd ~/.n8n/custom
pnpm link xibo-n8n-nodes
```

### For Production

```bash
npm install xibo-n8n-nodes
```

Or add to your n8n instance's package.json and install via npm/pnpm.

## Configuration

### Xibo API Credentials

Before using the Xibo node, you need to configure your Xibo CMS credentials in n8n:

1. In n8n, go to **Credentials** → **New**
2. Select **Xibo API**
3. Enter the following information:
   - **CMS URL**: Your Xibo CMS URL (e.g., `https://your-xibo-cms.com`)
   - **Client ID**: Your Xibo API Client ID
   - **Client Secret**: Your Xibo API Client Secret

To get your API credentials from Xibo CMS:
1. Log in to your Xibo CMS
2. Go to **Applications** in the admin menu
3. Add a new application or use an existing one
4. Copy the Client ID and Client Secret

## Usage

### Available Resources

- **Display**: Manage and retrieve display information
- **Layout**: Work with layouts
- **Media**: Access media library files
- **Schedule**: Manage schedules

### Example Workflow

1. Add the **Xibo** node to your workflow
2. Select a **Resource** (e.g., Display)
3. Select an **Operation** (e.g., Get Many)
4. Configure the credentials
5. Execute the workflow

## Development

### Project Structure

```
xibo-n8n-nodes/
├── nodes/
│   └── Xibo/
│       ├── Xibo.node.ts     # Main node implementation
│       └── xibo.svg          # Node icon
├── credentials/
│   └── XiboApi.credentials.ts # API credentials
├── icons/                     # Additional icons
├── dist/                      # Compiled output (generated)
├── package.json
├── tsconfig.json
├── gulpfile.js
└── .eslintrc.js
```

### Available Scripts

- `pnpm run build` - Build the project for production
- `pnpm run dev` - Watch mode for development
- `pnpm run lint` - Lint the code
- `pnpm run lintfix` - Fix linting issues automatically
- `pnpm run format` - Format code with Prettier

### Building

```bash
pnpm run build
```

This will:
1. Compile TypeScript to JavaScript
2. Copy icons to the dist folder
3. Generate type definitions

### Testing Locally

1. Build the project:
```bash
pnpm run build
```

2. Link to your n8n instance:
```bash
pnpm link
cd ~/.n8n/custom
pnpm link xibo-n8n-nodes
```

3. Restart n8n and the nodes should be available

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Xibo CMS Documentation](https://xibosignage.com/docs/)
- [Xibo API Documentation](https://xibosignage.com/docs/developer)

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [https://github.com/sasch901/Xibo-n8n/issues](https://github.com/sasch901/Xibo-n8n/issues)
- n8n Community: [https://community.n8n.io/](https://community.n8n.io/)
