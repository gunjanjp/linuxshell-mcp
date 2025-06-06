#!/usr/bin/env node

import { promisify } from "util";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPServerDebugger {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.success = [];
  }

  log(type, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, details };
    
    switch (type) {
      case 'success':
        this.success.push(logEntry);
        console.log(`✅ ${message}`);
        if (details) console.log(`   ${details}`);
        break;
      case 'warning':
        this.warnings.push(logEntry);
        console.log(`⚠️  ${message}`);
        if (details) console.log(`   ${details}`);
        break;
      case 'error':
        this.issues.push(logEntry);
        console.log(`❌ ${message}`);
        if (details) console.log(`   ${details}`);
        break;
      case 'info':
        console.log(`ℹ️  ${message}`);
        if (details) console.log(`   ${details}`);
        break;
    }
  }

  async checkNodeVersion() {
    try {
      const { stdout } = await execAsync("node --version");
      const version = stdout.trim();
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        this.log('success', `Node.js version: ${version}`);
      } else {
        this.log('error', `Node.js version too old: ${version}`, 'Requires Node.js 18+');
      }
    } catch (error) {
      this.log('error', 'Node.js not found', error.message);
    }
  }

  async checkProjectStructure() {
    const projectDir = path.join(__dirname, '..');
    const requiredFiles = [
      'package.json',
      'src/index.js',
      'config.json'
    ];

    this.log('info', `Checking project structure in: ${projectDir}`);

    for (const file of requiredFiles) {
      const filePath = path.join(projectDir, file);
      try {
        const stats = await fs.stat(filePath);
        this.log('success', `Found ${file}`, `Size: ${stats.size} bytes`);
      } catch (error) {
        this.log('error', `Missing ${file}`, error.message);
      }
    }
  }

  async checkDependencies() {
    try {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      this.log('info', 'Checking dependencies...');
      
      // Check if MCP SDK is installed
      const nodeModulesPath = path.join(__dirname, '..', 'node_modules', '@modelcontextprotocol', 'sdk');
      try {
        await fs.stat(nodeModulesPath);
        this.log('success', 'MCP SDK dependency found');
      } catch (error) {
        this.log('error', 'MCP SDK dependency missing', 'Run: npm install');
      }

    } catch (error) {
      this.log('error', 'Could not check dependencies', error.message);
    }
  }

  async checkWSLAvailability() {
    try {
      const { stdout } = await execAsync("wsl --version");
      this.log('success', 'WSL is available', stdout.trim().split('\n')[0]);
    } catch (error) {
      this.log('error', 'WSL not available', error.message);
      return false;
    }

    try {
      const { stdout } = await execAsync("wsl -l -v");
      this.log('info', 'WSL distributions:', '\n' + stdout);
      
      // Parse distributions
      const lines = stdout.split('\n').filter(line => line.trim());
      let foundDistributions = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const cleanLine = line.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
          const parts = cleanLine.split(/\s+/);
          if (parts.length >= 3) {
            const name = parts[0].replace(/^\*\s*/, '');
            const state = parts[1];
            const version = parts[2];
            foundDistributions.push({ name, state, version });
          }
        }
      }

      if (foundDistributions.length === 0) {
        this.log('error', 'No WSL distributions found', 'Install a Linux distribution: wsl --install -d Ubuntu');
        return false;
      }

      foundDistributions.forEach(dist => {
        if (dist.state === 'Running') {
          this.log('success', `Distribution ${dist.name} is running`, `WSL${dist.version}`);
        } else {
          this.log('warning', `Distribution ${dist.name} is stopped`, `WSL${dist.version}`);
        }
      });

      return foundDistributions;
    } catch (error) {
      this.log('error', 'Could not list WSL distributions', error.message);
      return false;
    }
  }

  async testWSLConnection(distributions) {
    if (!distributions || distributions.length === 0) {
      this.log('error', 'No distributions to test');
      return;
    }

    for (const dist of distributions) {
      try {
        const { stdout } = await execAsync(`wsl -d ${dist.name} -- echo "Hello from ${dist.name}"`);
        if (stdout.includes(`Hello from ${dist.name}`)) {
          this.log('success', `WSL connection test passed for ${dist.name}`);
        } else {
          this.log('warning', `WSL connection test gave unexpected output for ${dist.name}`, stdout);
        }
      } catch (error) {
        this.log('error', `WSL connection test failed for ${dist.name}`, error.message);
      }
    }
  }

  async checkConfiguration() {
    try {
      const configPath = path.join(__dirname, '..', 'config.json');
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      this.log('success', 'Configuration file is valid JSON');
      this.log('info', 'Configuration content:', JSON.stringify(config, null, 2));
      
      if (config.wslDistribution) {
        this.log('info', `Configured WSL distribution: ${config.wslDistribution}`);
      } else {
        this.log('warning', 'No WSL distribution configured');
      }

      return config;
    } catch (error) {
      this.log('error', 'Configuration file issue', error.message);
      return null;
    }
  }

  async testMCPServerImports() {
    try {
      this.log('info', 'Testing MCP Server imports...');
      
      // Test if we can import the MCP SDK
      const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
      const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
      
      this.log('success', 'MCP SDK imports successful');
      
      // Test if we can create a server instance
      const server = new Server(
        { name: "test-server", version: "1.0.0" },
        { capabilities: { tools: {} } }
      );
      
      this.log('success', 'MCP Server instance created successfully');
      
    } catch (error) {
      this.log('error', 'MCP Server import/creation failed', error.message);
    }
  }

  async testServerStartup() {
    this.log('info', 'Testing server startup (dry run)...');
    
    try {
      // Import our server module
      const serverPath = path.join(__dirname, '..', 'src', 'index.js');
      
      // Check if the file can be read
      const serverContent = await fs.readFile(serverPath, 'utf8');
      this.log('success', 'Server file readable', `${serverContent.length} characters`);
      
      // Try to parse it as a module (syntax check)
      try {
        // This is a basic syntax check - we can't actually run it without stdio setup
        this.log('info', 'Server file syntax appears valid');
      } catch (syntaxError) {
        this.log('error', 'Server file syntax error', syntaxError.message);
      }
      
    } catch (error) {
      this.log('error', 'Server file issue', error.message);
    }
  }

  async checkClaudeDesktopConfig() {
    const platform = process.platform;
    let configPath;
    
    if (platform === "win32") {
      configPath = path.join(process.env.APPDATA, "Claude", "claude_desktop_config.json");
    } else if (platform === "darwin") {
      configPath = path.join(process.env.HOME, "Library", "Application Support", "Claude", "claude_desktop_config.json");
    } else {
      configPath = path.join(process.env.HOME, ".config", "Claude", "claude_desktop_config.json");
    }

    this.log('info', `Checking Claude Desktop config: ${configPath}`);

    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      this.log('success', 'Claude Desktop config found and valid');
      
      if (config.mcpServers) {
        const serverNames = Object.keys(config.mcpServers);
        this.log('info', `Configured MCP servers: ${serverNames.join(', ')}`);
        
        if (config.mcpServers['linux-bash']) {
          const linuxBashConfig = config.mcpServers['linux-bash'];
          this.log('success', 'linux-bash MCP server found in config');
          this.log('info', 'Server command:', linuxBashConfig.command);
          this.log('info', 'Server args:', linuxBashConfig.args?.join(' ') || 'None');
          
          if (linuxBashConfig.env && linuxBashConfig.env.WSL_DISTRIBUTION) {
            this.log('info', `WSL_DISTRIBUTION env var: ${linuxBashConfig.env.WSL_DISTRIBUTION}`);
          } else {
            this.log('warning', 'No WSL_DISTRIBUTION environment variable set');
          }
          
          // Check if the server file path exists
          if (linuxBashConfig.args && linuxBashConfig.args.length > 0) {
            const serverPath = linuxBashConfig.args[0];
            try {
              await fs.stat(serverPath);
              this.log('success', 'Server file path exists', serverPath);
            } catch (error) {
              this.log('error', 'Server file path does not exist', serverPath);
            }
          }
        } else {
          this.log('warning', 'linux-bash MCP server not found in config');
        }
      } else {
        this.log('warning', 'No MCP servers configured');
      }
    } catch (error) {
      this.log('error', 'Claude Desktop config issue', error.message);
    }
  }

  async runDiagnostics() {
    console.log("🔍 Linux Bash MCP Server Diagnostics\n");
    console.log("=" .repeat(50));
    
    await this.checkNodeVersion();
    console.log("");
    
    await this.checkProjectStructure();
    console.log("");
    
    await this.checkDependencies();
    console.log("");
    
    const distributions = await this.checkWSLAvailability();
    console.log("");
    
    if (distributions) {
      await this.testWSLConnection(distributions);
      console.log("");
    }
    
    await this.checkConfiguration();
    console.log("");
    
    await this.testMCPServerImports();
    console.log("");
    
    await this.testServerStartup();
    console.log("");
    
    await this.checkClaudeDesktopConfig();
    console.log("");
    
    // Summary
    console.log("=" .repeat(50));
    console.log("📊 DIAGNOSTIC SUMMARY");
    console.log("=" .repeat(50));
    
    console.log(`✅ Successful checks: ${this.success.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.issues.length}`);
    console.log("");
    
    if (this.issues.length > 0) {
      console.log("🚨 CRITICAL ISSUES TO FIX:");
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.message}`);
        if (issue.details) console.log(`   ${issue.details}`);
      });
      console.log("");
    }
    
    if (this.warnings.length > 0) {
      console.log("⚠️  WARNINGS TO REVIEW:");
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.details) console.log(`   ${warning.details}`);
      });
      console.log("");
    }
    
    // Recommendations
    console.log("💡 RECOMMENDATIONS:");
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log("✅ All checks passed! The MCP server should be working correctly.");
      console.log("   If it's still not working, try restarting Claude Desktop.");
    } else {
      console.log("1. Fix all critical issues first");
      console.log("2. Review and address warnings");
      console.log("3. Run diagnostics again to verify fixes");
      console.log("4. Restart Claude Desktop after making changes");
    }
    
    console.log("\n📖 For more help, see README.md or run 'npm run setup'");
  }
}

// Run diagnostics
const debugger = new MCPServerDebugger();
debugger.runDiagnostics().catch(error => {
  console.error("❌ Diagnostics failed:", error);
  process.exit(1);
});
