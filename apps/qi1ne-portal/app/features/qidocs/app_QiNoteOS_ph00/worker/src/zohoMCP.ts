/**
 * Zoho MCP Integration for Gina
 * 
 * This module allows Gina (Cloudflare Worker) to interact with Zoho services
 * via the Model Context Protocol (MCP) server.
 * 
 * MCP Server URL: https://qizohomcp-906243217.zohomcp.com/mcp/message
 * 
 * SECURITY: API keys must be provided via environment variables.
 * Never hardcode API keys in source code.
 */

export interface ZohoMCPConfig {
  mcpUrl: string;
  apiKey: string;
}

export interface ZohoMCPRequest {
  method: string;
  params?: Record<string, unknown>;
}

export interface ZohoMCPResponse {
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Create a Zoho MCP client configuration
 * 
 * @throws Error if ZOHO_MCP_KEY is not provided in production
 */
export function getZohoMCPConfig(env: { ZOHO_MCP_URL?: string; ZOHO_MCP_KEY?: string }): ZohoMCPConfig {
  const mcpUrl = env.ZOHO_MCP_URL || 'https://qizohomcp-906243217.zohomcp.com/mcp/message';
  const apiKey = env.ZOHO_MCP_KEY;

  // In production, API key must be provided via environment variable
  if (!apiKey) {
    throw new Error(
      'ZOHO_MCP_KEY environment variable is required. ' +
      'Set it using: wrangler secret put ZOHO_MCP_KEY'
    );
  }

  return {
    mcpUrl,
    apiKey,
  };
}

/**
 * Send a request to the Zoho MCP server
 */
export async function callZohoMCP(
  config: ZohoMCPConfig,
  method: string,
  params?: Record<string, unknown>
): Promise<ZohoMCPResponse> {
  const url = new URL(config.mcpUrl);
  url.searchParams.set('key', config.apiKey);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params: params || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Zoho MCP request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Zoho MCP call failed:', error);
    return {
      error: {
        code: -1,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Helper: Get Zoho CRM records
 */
export async function getZohoRecords(
  config: ZohoMCPConfig,
  module: string,
  options?: {
    fields?: string;
    per_page?: number;
    page?: number;
    criteria?: string;
  }
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoCRM_Get_Records', {
    path_variables: { module_api_name: module },
    query_params: options || {},
  });
}

/**
 * Helper: Create a Zoho CRM record
 */
export async function createZohoRecord(
  config: ZohoMCPConfig,
  module: string,
  data: Record<string, unknown>
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoCRM_Create_Records', {
    path_variables: { module_api_name: module },
    body: { data: [data] },
  });
}

/**
 * Helper: Update a Zoho CRM record
 */
export async function updateZohoRecord(
  config: ZohoMCPConfig,
  module: string,
  recordId: string,
  data: Record<string, unknown>
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoCRM_Update_Record', {
    path_variables: {
      module_api_name: module,
      id: recordId,
    },
    body: { data: [data] },
  });
}

/**
 * Helper: Search Zoho CRM records
 */
export async function searchZohoRecords(
  config: ZohoMCPConfig,
  module: string,
  searchParams: {
    criteria?: string;
    email?: string;
    phone?: string;
    word?: string;
    fields?: string;
    per_page?: number;
    page?: number;
  }
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoCRM_Search_Records', {
    path_variables: { module },
    query_params: searchParams,
  });
}

/**
 * Helper: Create a Zoho CRM note
 */
export async function createZohoNote(
  config: ZohoMCPConfig,
  parentId: string,
  parentModule: string,
  noteTitle: string,
  noteContent: string
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoCRM_Create_Notes', {
    body: {
      data: [
        {
          Note_Title: noteTitle,
          Note_Content: noteContent,
          Parent_Id: {
            id: parentId,
            name: parentModule,
          },
        },
      ],
    },
  });
}

/**
 * Helper: Get Zoho Projects tasks
 */
export async function getZohoProjectTasks(
  config: ZohoMCPConfig,
  portalId: string,
  projectId: string,
  options?: {
    filter?: unknown;
    per_page?: number;
    page?: number;
  }
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoProjects_getTasksByProject', {
    path_variables: {
      portal_id: portalId,
      project_id: projectId,
    },
    query_params: options || {},
  });
}

/**
 * Helper: Create a Zoho Projects task
 */
export async function createZohoProjectTask(
  config: ZohoMCPConfig,
  portalId: string,
  projectId: string,
  taskData: {
    name: string;
    tasklist: { id: string };
    start_date?: string;
    end_date?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
  }
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoProjects_createTask', {
    path_variables: {
      portal_id: portalId,
      project_id: projectId,
    },
    body: taskData,
  });
}

/**
 * Helper: Get Zoho Desk tickets
 */
export async function getZohoDeskTickets(
  config: ZohoMCPConfig,
  orgId: string,
  options?: {
    departmentId?: string;
    status?: string;
    limit?: number;
    from?: number;
  }
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoDesk_listOfTickets', {
    query_params: {
      orgId,
      ...options,
    },
  });
}

/**
 * Helper: Create a Zoho Desk ticket
 */
export async function createZohoDeskTicket(
  config: ZohoMCPConfig,
  orgId: string,
  ticketData: {
    subject: string;
    description: string;
    email: string;
    departmentId: string;
    status?: string;
    priority?: string;
    category?: string;
    subCategory?: string;
  }
) {
  return callZohoMCP(config, 'mcp_ZohoMCP_ZohoDesk_createTicket', {
    query_params: { orgId },
    body: ticketData,
  });
}

