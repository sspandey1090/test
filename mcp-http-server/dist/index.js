import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const server = new McpServer({ name: "mcp-http-server", version: "1.0.0" }, { capabilities: {} });
const headersSchema = z
    .record(z.string(), z.string())
    .optional()
    .describe("Optional HTTP headers as key-value pairs");
const timeoutSchema = z
    .number()
    .optional()
    .default(30000)
    .describe("Request timeout in milliseconds (default: 30000)");
async function makeRequest(method, url, headers, body, timeout = 30000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const requestHeaders = {
            "Content-Type": "application/json",
            ...headers,
        };
        const requestInit = {
            method,
            headers: requestHeaders,
            signal: controller.signal,
        };
        if (body !== undefined && method !== "GET" && method !== "DELETE") {
            requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
        }
        const response = await fetch(url, requestInit);
        const responseText = await response.text();
        let formattedBody;
        try {
            const parsed = JSON.parse(responseText);
            formattedBody = JSON.stringify(parsed, null, 2);
        }
        catch {
            formattedBody = responseText;
        }
        return `Status: ${response.status} ${response.statusText}\n\nResponse Body:\n${formattedBody}`;
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                throw new Error(`Request timed out after ${timeout}ms`);
            }
            throw new Error(`Request failed: ${error.message}`);
        }
        throw new Error(`Request failed: ${String(error)}`);
    }
    finally {
        clearTimeout(timer);
    }
}
server.tool("http_get", "Perform an HTTP GET request to a URL", {
    url: z.string().url().describe("The URL to send the GET request to"),
    headers: headersSchema,
    timeout: timeoutSchema,
}, async ({ url, headers, timeout }) => {
    try {
        const result = await makeRequest("GET", url, headers, undefined, timeout);
        return { content: [{ type: "text", text: result }] };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: error instanceof Error ? error.message : String(error),
                },
            ],
            isError: true,
        };
    }
});
server.tool("http_post", "Perform an HTTP POST request to a URL with a JSON body", {
    url: z.string().url().describe("The URL to send the POST request to"),
    body: z.unknown().optional().describe("The request body (will be JSON-serialized)"),
    headers: headersSchema,
    timeout: timeoutSchema,
}, async ({ url, body, headers, timeout }) => {
    try {
        const result = await makeRequest("POST", url, headers, body, timeout);
        return { content: [{ type: "text", text: result }] };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: error instanceof Error ? error.message : String(error),
                },
            ],
            isError: true,
        };
    }
});
server.tool("http_put", "Perform an HTTP PUT request to a URL with a JSON body", {
    url: z.string().url().describe("The URL to send the PUT request to"),
    body: z.unknown().optional().describe("The request body (will be JSON-serialized)"),
    headers: headersSchema,
    timeout: timeoutSchema,
}, async ({ url, body, headers, timeout }) => {
    try {
        const result = await makeRequest("PUT", url, headers, body, timeout);
        return { content: [{ type: "text", text: result }] };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: error instanceof Error ? error.message : String(error),
                },
            ],
            isError: true,
        };
    }
});
server.tool("http_delete", "Perform an HTTP DELETE request to a URL", {
    url: z.string().url().describe("The URL to send the DELETE request to"),
    headers: headersSchema,
    timeout: timeoutSchema,
}, async ({ url, headers, timeout }) => {
    try {
        const result = await makeRequest("DELETE", url, headers, undefined, timeout);
        return { content: [{ type: "text", text: result }] };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: error instanceof Error ? error.message : String(error),
                },
            ],
            isError: true,
        };
    }
});
server.tool("fetch_json", "Fetch JSON data from a URL and return it parsed and formatted", {
    url: z.string().url().describe("The URL to fetch JSON from"),
    method: z
        .enum(["GET", "POST", "PUT", "PATCH"])
        .optional()
        .default("GET")
        .describe("HTTP method to use (default: GET)"),
    body: z.unknown().optional().describe("Optional request body for POST/PUT/PATCH"),
    headers: headersSchema,
    timeout: timeoutSchema,
}, async ({ url, method, body, headers, timeout }) => {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const requestHeaders = {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...headers,
            };
            const requestInit = {
                method,
                headers: requestHeaders,
                signal: controller.signal,
            };
            if (body !== undefined && method !== "GET") {
                requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
            }
            const response = await fetch(url, requestInit);
            if (!response.ok) {
                const text = await response.text();
                return {
                    content: [
                        {
                            type: "text",
                            text: `HTTP Error ${response.status} ${response.statusText}\n\n${text}`,
                        },
                    ],
                    isError: true,
                };
            }
            const json = await response.json();
            const formatted = JSON.stringify(json, null, 2);
            return {
                content: [
                    {
                        type: "text",
                        text: `Status: ${response.status} ${response.statusText}\n\nJSON Data:\n${formatted}`,
                    },
                ],
            };
        }
        finally {
            clearTimeout(timer);
        }
    }
    catch (error) {
        const message = error instanceof Error
            ? error.name === "AbortError"
                ? `Request timed out after ${timeout}ms`
                : `Request failed: ${error.message}`
            : String(error);
        return {
            content: [{ type: "text", text: message }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP HTTP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map