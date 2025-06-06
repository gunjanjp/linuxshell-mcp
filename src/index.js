#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn, exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LinuxBashMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "linux-bash-mcp-server",
        version: "1.0.0",
        description: "MCP server for executing bash commands and scripts via WSL2 on any Linux distribution"
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = null;
    this.wslDistribution = null;
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  async loadConfig() {
    try {
      console.error(`[DEBUG] Loading config from: ${__dirname}`);
      const configPath = path.join(__dirname, "..", "config.json");
      console.error(`[DEBUG] Config path: ${configPath}`);
      
      let configContent;
      try {
        configContent = await fs.readFile(configPath, "utf8");
        console.error(`[DEBUG] Config file read successfully`);
      } catch (readError) {
        console.error(`[WARN] Could not read config file: ${readError.message}`);
        throw readError;
      }
      
      this.config = JSON.parse(configContent);
      console.error(`[DEBUG] Config parsed successfully:`, this.config);
      
      // Get WSL distribution from config or environment variable
      this.wslDistribution = process.env.WSL_DISTRIBUTION || this.config.wslDistribution;
      console.error(`[DEBUG] Initial WSL distribution: ${this.wslDistribution}`);
      
      if (!this.wslDistribution || this.wslDistribution === "auto-detect") {
        console.error(`[DEBUG] Auto-detecting WSL distribution...`);
        // Try to detect default WSL distribution
        this.wslDistribution = await this.detectDefaultWSLDistribution();
      }
      
      console.error(`[INFO] Using WSL distribution: ${this.wslDistribution}`);
      console.error(`[INFO] Config loaded from: ${configPath}`);
      
    } catch (error) {
      console.error(`[ERROR] Failed to load config: ${error.message}`);
      console.error(`[ERROR] Stack trace:`, error.stack);
      console.error("[INFO] Using default configuration");
      
      // Fallback to default config
      this.config = {
        wslDistribution: "auto-detect",
        defaultTimeout: 30000,
        scriptTimeout: 60000,
        maxBufferSize: 10 * 1024 * 1024,
        debugMode: true // Enable debug mode by default when config fails
      };
      
      try {
        this.wslDistribution = process.env.WSL_DISTRIBUTION || await this.detectDefaultWSLDistribution();
        console.error(`[INFO] Fallback WSL distribution: ${this.wslDistribution}`);
      } catch (detectError) {
        console.error(`[ERROR] Failed to detect WSL distribution: ${detectError.message}`);
        // Try common distribution names as last resort
        this.wslDistribution = process.env.WSL_DISTRIBUTION || "Ubuntu";
        console.error(`[WARN] Using default distribution name: ${this.wslDistribution}`);
      }
    }
  }

  async detectDefaultWSLDistribution() {
    try {
      console.error(`[DEBUG] Detecting WSL distributions...`);
      const { stdout } = await execAsync("wsl -l");
      console.error(`[DEBUG] WSL list output: ${JSON.stringify(stdout)}`);
      
      const lines = stdout.split('\n').filter(line => line.trim());
      console.error(`[DEBUG] Filtered lines:`, lines);
      
      for (const line of lines) {
        const cleanLine = line.replace(/[\x00-\x1f\x7f-\x9f]/g, '').trim();
        console.error(`[DEBUG] Processing line: "${cleanLine}"`);
        
        if (cleanLine && 
            !cleanLine.includes('Windows Subsystem for Linux') && 
            !cleanLine.includes('----') &&
            !cleanLine.includes('The following') &&
            !cleanLine.includes('distributions')) {
          
          // Extract the first distribution name (usually marked with *)
          const distName = cleanLine.replace(/^\*\s*/, '').split(/\s+/)[0];
          console.error(`[DEBUG] Extracted distribution name: "${distName}"`);
          
          if (distName && distName !== 'The' && distName !== 'following' && distName.length > 1) {
            console.error(`[INFO] Auto-detected WSL distribution: ${distName}`);
            return distName;
          }
        }
      }
      
      throw new Error("No valid WSL distributions found in output");
    } catch (error) {
      console.error(`[ERROR] Failed to detect WSL distribution: ${error.message}`);
      console.error(`[ERROR] Error details:`, error);
      throw new Error(`Could not detect WSL distribution: ${error.message}`);
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      console.error("[INFO] Shutting down MCP server...");
      await this.server.close();
      process.exit(0);
    });

    process.on("uncaughtException", (error) => {
      console.error("[FATAL] Uncaught exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("[FATAL] Unhandled promise rejection:", reason);
      process.exit(1);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error("[DEBUG] ListTools request received");
      return {
        tools: [
          {
            name: "execute_bash_command",
            description: "Execute a bash command in WSL2 Linux environment",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "The bash command to execute",
                },
                workingDirectory: {
                  type: "string",
                  description: "Working directory for the command (optional, defaults to current directory)",
                },
                timeout: {
                  type: "number",
                  description: "Timeout in milliseconds (optional, uses config default)",
                }
              },
              required: ["command"],
            },
          },
          {
            name: "execute_bash_script",
            description: "Execute a bash script file in WSL2 Linux environment",
            inputSchema: {
              type: "object",
              properties: {
                scriptPath: {
                  type: "string",
                  description: "Path to the bash script file",
                },
                args: {
                  type: "array",
                  items: { type: "string" },
                  description: "Arguments to pass to the script (optional)",
                },
                workingDirectory: {
                  type: "string",
                  description: "Working directory for the script (optional)",
                },
                timeout: {
                  type: "number",
                  description: "Timeout in milliseconds (optional, uses config default)",
                }
              },
              required: ["scriptPath"],
            },
          },
          {
            name: "create_bash_script",
            description: "Create a bash script file with specified content",
            inputSchema: {
              type: "object",
              properties: {
                scriptPath: {
                  type: "string",
                  description: "Path where to create the script file",
                },
                content: {
                  type: "string",
                  description: "Content of the bash script",
                },
                executable: {
                  type: "boolean",
                  description: "Make the script executable (optional, defaults to true)",
                  default: true
                }
              },
              required: ["scriptPath", "content"],
            },
          },
          {
            name: "list_directory",
            description: "List contents of a directory in WSL2 Linux environment",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Directory path to list (optional, defaults to current directory)",
                  default: "."
                },
                detailed: {
                  type: "boolean",
                  description: "Show detailed information (ls -la) (optional, defaults to false)",
                  default: false
                }
              },
            },
          },
          {
            name: "get_system_info",
            description: "Get system information about the WSL2 Linux environment",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "check_wsl_status",
            description: "Check WSL2 status and get distribution information",
            inputSchema: {
              type: "object",
              properties: {},
            },
          }
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.error(`[DEBUG] Tool request: ${name}`, args);

      try {
        switch (name) {
          case "execute_bash_command":
            return await this.executeBashCommand(args);
          case "execute_bash_script":
            return await this.executeBashScript(args);
          case "create_bash_script":
            return await this.createBashScript(args);
          case "list_directory":
            return await this.listDirectory(args);
          case "get_system_info":
            return await this.getSystemInfo();
          case "check_wsl_status":
            return await this.checkWSLStatus();
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`[ERROR] Tool execution error for ${name}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  async executeBashCommand(args) {
    const { 
      command, 
      workingDirectory = ".", 
      timeout = this.config?.defaultTimeout || 30000 
    } = args;
    
    console.error(`[DEBUG] Executing command: ${command}`);
    
    if (!command || typeof command !== "string") {
      throw new Error("Command is required and must be a string");
    }

    if (!this.wslDistribution) {
      throw new Error("WSL distribution not configured");
    }

    try {
      // Construct WSL command
      const wslCommand = `wsl -d ${this.wslDistribution} -- bash -c "cd '${workingDirectory}' && ${command}"`;
      
      console.error(`[DEBUG] WSL command: ${wslCommand}`);
      
      const { stdout, stderr } = await execAsync(wslCommand, {
        timeout,
        maxBuffer: this.config?.maxBufferSize || 10 * 1024 * 1024,
      });

      console.error(`[DEBUG] Command executed successfully`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              command: command,
              workingDirectory: workingDirectory,
              wslDistribution: this.wslDistribution,
              stdout: stdout || "",
              stderr: stderr || "",
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`[ERROR] Command execution failed:`, error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              command: command,
              workingDirectory: workingDirectory,
              wslDistribution: this.wslDistribution,
              error: error.message,
              stdout: error.stdout || "",
              stderr: error.stderr || "",
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    }
  }

  async executeBashScript(args) {
    const { 
      scriptPath, 
      args: scriptArgs = [], 
      workingDirectory = ".", 
      timeout = this.config?.scriptTimeout || 60000 
    } = args;
    
    if (!scriptPath || typeof scriptPath !== "string") {
      throw new Error("Script path is required and must be a string");
    }

    if (!this.wslDistribution) {
      throw new Error("WSL distribution not configured");
    }

    try {
      // Prepare arguments string
      const argsString = scriptArgs.map(arg => `'${arg.replace(/'/g, "'\"'\"'")}'`).join(' ');
      
      // Construct WSL command
      const wslCommand = `wsl -d ${this.wslDistribution} -- bash -c "cd '${workingDirectory}' && bash '${scriptPath}' ${argsString}"`;
      
      console.error(`[DEBUG] Executing script: ${wslCommand}`);
      
      const { stdout, stderr } = await execAsync(wslCommand, {
        timeout,
        maxBuffer: this.config?.maxBufferSize || 10 * 1024 * 1024,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              scriptPath: scriptPath,
              args: scriptArgs,
              workingDirectory: workingDirectory,
              wslDistribution: this.wslDistribution,
              stdout: stdout || "",
              stderr: stderr || "",
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              scriptPath: scriptPath,
              args: scriptArgs,
              workingDirectory: workingDirectory,
              wslDistribution: this.wslDistribution,
              error: error.message,
              stdout: error.stdout || "",
              stderr: error.stderr || "",
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    }
  }

  async createBashScript(args) {
    const { scriptPath, content, executable = true } = args;
    
    if (!scriptPath || typeof scriptPath !== "string") {
      throw new Error("Script path is required and must be a string");
    }
    
    if (!content || typeof content !== "string") {
      throw new Error("Script content is required and must be a string");
    }

    if (!this.wslDistribution) {
      throw new Error("WSL distribution not configured");
    }

    try {
      // Escape content for bash
      const escapedContent = content.replace(/'/g, "'\"'\"'");
      
      // Create the script file
      const createCommand = `wsl -d ${this.wslDistribution} -- bash -c "echo '${escapedContent}' > '${scriptPath}'"`;
      
      console.error(`[DEBUG] Creating script: ${scriptPath}`);
      
      await execAsync(createCommand);
      
      // Make executable if requested
      if (executable) {
        const chmodCommand = `wsl -d ${this.wslDistribution} -- chmod +x '${scriptPath}'`;
        await execAsync(chmodCommand);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              scriptPath: scriptPath,
              executable: executable,
              wslDistribution: this.wslDistribution,
              message: "Script created successfully",
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              scriptPath: scriptPath,
              wslDistribution: this.wslDistribution,
              error: error.message,
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    }
  }

  async listDirectory(args) {
    const { path: dirPath = ".", detailed = false } = args;
    
    if (!this.wslDistribution) {
      throw new Error("WSL distribution not configured");
    }
    
    try {
      const command = detailed ? `ls -la '${dirPath}'` : `ls '${dirPath}'`;
      const wslCommand = `wsl -d ${this.wslDistribution} -- ${command}`;
      
      console.error(`[DEBUG] Listing directory: ${wslCommand}`);
      
      const { stdout, stderr } = await execAsync(wslCommand);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              path: dirPath,
              detailed: detailed,
              wslDistribution: this.wslDistribution,
              listing: stdout || "",
              stderr: stderr || "",
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              path: dirPath,
              wslDistribution: this.wslDistribution,
              error: error.message,
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    }
  }

  async getSystemInfo() {
    if (!this.wslDistribution) {
      throw new Error("WSL distribution not configured");
    }
    
    try {
      const commands = [
        { cmd: "uname -a", desc: "System information" },
        { cmd: "cat /etc/os-release", desc: "OS release information" },
        { cmd: "whoami", desc: "Current user" },
        { cmd: "pwd", desc: "Current directory" },
        { cmd: "df -h", desc: "Disk usage" },
        { cmd: "free -h", desc: "Memory usage" },
        { cmd: "uptime", desc: "System uptime" },
        { cmd: "cat /proc/version", desc: "Kernel version" }
      ];
      
      const results = {};
      
      for (const { cmd, desc } of commands) {
        try {
          const wslCommand = `wsl -d ${this.wslDistribution} -- ${cmd}`;
          const { stdout } = await execAsync(wslCommand);
          results[desc] = {
            command: cmd,
            output: stdout.trim()
          };
        } catch (error) {
          results[desc] = {
            command: cmd,
            error: error.message
          };
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              wslDistribution: this.wslDistribution,
              systemInfo: results,
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              wslDistribution: this.wslDistribution,
              error: error.message,
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    }
  }

  async checkWSLStatus() {
    try {
      // Check WSL status
      const { stdout: wslList } = await execAsync("wsl -l -v");
      
      // Try to execute a simple command in the selected distribution
      let testOutput = "Not tested";
      let osInfo = "Not available";
      
      if (this.wslDistribution) {
        try {
          const { stdout: testResult } = await execAsync(`wsl -d ${this.wslDistribution} -- echo 'WSL connection test successful'`);
          testOutput = testResult.trim();
        } catch (error) {
          testOutput = `Test failed: ${error.message}`;
        }

        // Get distribution-specific information
        try {
          const { stdout: osResult } = await execAsync(`wsl -d ${this.wslDistribution} -- cat /etc/os-release`);
          osInfo = osResult.trim();
        } catch (error) {
          osInfo = `OS info not available: ${error.message}`;
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              wslStatus: "Running",
              selectedDistribution: this.wslDistribution || "Not configured",
              allDistributions: wslList.trim(),
              testOutput: testOutput,
              osInfo: osInfo,
              serverConfig: {
                configuredDistribution: this.config?.wslDistribution,
                defaultTimeout: this.config?.defaultTimeout,
                scriptTimeout: this.config?.scriptTimeout,
                debugMode: this.config?.debugMode
              },
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              wslStatus: "Error",
              selectedDistribution: this.wslDistribution || "Not configured",
              error: error.message,
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    }
  }

  async run() {
    try {
      console.error("[INFO] Starting Linux Bash MCP Server...");
      console.error(`[DEBUG] Working directory: ${process.cwd()}`);
      console.error(`[DEBUG] Script directory: ${__dirname}`);
      
      await this.loadConfig();
      
      if (!this.wslDistribution) {
        throw new Error("No WSL distribution configured. Please run setup or set WSL_DISTRIBUTION environment variable.");
      }
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error(`[INFO] Linux Bash MCP server running on stdio with ${this.wslDistribution}`);
    } catch (error) {
      console.error(`[FATAL] Failed to start MCP server: ${error.message}`);
      console.error(`[FATAL] Stack trace:`, error.stack);
      process.exit(1);
    }
  }
}

const server = new LinuxBashMCPServer();
server.run().catch((error) => {
  console.error("[FATAL] Server crashed:", error);
  process.exit(1);
});
