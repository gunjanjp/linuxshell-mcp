#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import os from "os";

class ConfigChecker {
  constructor() {
    this.configPath = this.getClaudeConfigPath();
  }

  getClaudeConfigPath() {
    const platform = os.platform();
    if (platform === "win32") {
      return path.join(os.homedir(), "AppData", "Roaming", "Claude", "claude_desktop_config.json");
    } else if (platform === "darwin") {
      return path.join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
    } else {
      return path.join(os.homedir(), ".config", "Claude", "claude_desktop_config.json");
    }
  }

  async checkConfig() {
    console.log("🔍 Claude Desktop Configuration Checker\n");
    console.log(`📄 Config file: ${this.configPath}\n`);

    try {
      // Check if file exists
      const stats = await fs.stat(this.configPath);
      console.log(`✅ Config file exists (${(stats.size / 1024).toFixed(2)} KB)`);
      console.log(`📅 Last modified: ${stats.mtime.toLocaleString()}\n`);

      // Read and parse config
      const configContent = await fs.readFile(this.configPath, "utf8");
      const config = JSON.parse(configContent);

      // Check MCP servers
      if (config.mcpServers && Object.keys(config.mcpServers).length > 0) {
        console.log("🛠️  Configured MCP Servers:");
        
        Object.entries(config.mcpServers).forEach(([name, serverConfig]) => {
          console.log(`\n📌 ${name}:`);
          console.log(`   Command: ${serverConfig.command || 'Not specified'}`);
          console.log(`   Args: ${serverConfig.args ? serverConfig.args.join(' ') : 'None'}`);
          
          if (serverConfig.env && Object.keys(serverConfig.env).length > 0) {
            console.log(`   Environment:`);
            Object.entries(serverConfig.env).forEach(([key, value]) => {
              console.log(`     ${key}: ${value}`);
            });
          }
          
          // Check if it's our linux-bash server
          if (name === "linux-bash") {
            console.log(`   🐧 Linux Bash MCP Server - WSL Distribution: ${serverConfig.env?.WSL_DISTRIBUTION || 'Not specified'}`);
          }
        });
      } else {
        console.log("⚠️  No MCP servers configured");
      }

      // Check other config sections
      console.log("\n📋 Other Configuration:");
      const otherKeys = Object.keys(config).filter(key => key !== 'mcpServers');
      if (otherKeys.length > 0) {
        otherKeys.forEach(key => {
          console.log(`   • ${key}: ${typeof config[key]}`);
        });
      } else {
        console.log("   None");
      }

      // Validate JSON structure
      console.log("\n✅ Configuration file is valid JSON");
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log("❌ Config file does not exist");
        console.log("💡 Run 'npm run setup' to create initial configuration");
      } else if (error instanceof SyntaxError) {
        console.log("❌ Config file contains invalid JSON");
        console.log(`💡 Error: ${error.message}`);
        console.log("💡 Consider backing up and recreating the file");
      } else {
        console.log(`❌ Error reading config file: ${error.message}`);
      }
    }
  }

  async backupConfig() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${this.configPath}.backup.${timestamp}`;
      
      await fs.copyFile(this.configPath, backupPath);
      console.log(`✅ Config backed up to: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.log(`❌ Failed to backup config: ${error.message}`);
      throw error;
    }
  }

  async showUsage() {
    console.log("📖 Claude Desktop Configuration Checker\n");
    console.log("Usage:");
    console.log("  node check-config.js                    # Check current configuration");
    console.log("  node check-config.js --backup          # Backup configuration file");
    console.log("  node check-config.js --help            # Show this help");
    console.log("");
    console.log("This tool helps you:");
    console.log("  • View all configured MCP servers");
    console.log("  • Validate JSON configuration");
    console.log("  • Backup configuration files");
    console.log("  • Troubleshoot configuration issues");
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const checker = new ConfigChecker();

if (args.includes('--help') || args.includes('-h')) {
  checker.showUsage();
} else if (args.includes('--backup')) {
  checker.backupConfig()
    .then(() => console.log("Backup completed successfully"))
    .catch(() => process.exit(1));
} else {
  checker.checkConfig()
    .catch((error) => {
      console.error("Configuration check failed:", error.message);
      process.exit(1);
    });
}
