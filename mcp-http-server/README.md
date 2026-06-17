# MCP HTTP Server

A TypeScript MCP (Model Context Protocol) server that exposes HTTP/API client tools, enabling LLMs to make HTTP requests to external APIs.

## Tools

| Tool | Description |
|------|-------------|
| `http_get` | Perform an HTTP GET request |
| `http_post` | Perform an HTTP POST request with a JSON body |
| `http_put` | Perform an HTTP PUT request with a JSON body |
| `http_delete` | Perform an HTTP DELETE request |
| `fetch_json` | Fetch and return parsed JSON data from a URL |

All tools accept optional `headers` (key-value pairs) and `timeout` (milliseconds, default 30000) parameters.

## Setup

```bash
npm install
npm run build
```

## Running

```bash
npm start
```

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "http": {
      "command": "node",
      "args": ["/home/user/test/mcp-http-server/dist/index.js"]
    }
  }
}
```

The config file is located at:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`
