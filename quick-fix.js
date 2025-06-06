#!/usr/bin/env node

import { promisify } from "util";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuickFix {
  constructor() {
    this.projectDir = __dirname;
  }

  async log(message, details = null) {
    console.log(`🔧 ${message}`);
    if (details) console.log(`   ${details}`);
  }

  async installDependencies() {
    this.log("Installing/updating dependencies...");
    try {
      const { stdout, stderr } = await execAsync("npm install", { cwd: this.projectDir });
      this.log("✅ Dependencies installed successfully");
      if (stderr) {
        console.log("   Warnings:", stderr);
      }
    } catch (error) {
      this.log("❌ Failed to install dependencies", error.message);
      throw error;
    }
  }

  async createDefaultConfig() {
    const configPath = path.join(this.projectDir, "config.json");
    
    try {
      // Check if config already exists
      await fs.stat(configPath);
      this.log("ℹ️  Config file already exists, skipping creation");
    } catch (error) {
      // Create default config
      this.log("Creating default configuration file...");
      
      const defaultConfig = {
        wslDistribution: "auto-detect",
        defaultTimeout: 30000,
        scriptTimeout: 60000,
        maxBufferSize: 10485760,
        debugMode: true
      };
      
      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
      this.log("✅ Default config.json created");
    }
  }

  async detectAndConfigureWSL() {
    this.log("Detecting WSL distributions...");
    
    try {
      const { stdout } = await execAsync("wsl -l");
      const lines = stdout.split('\n').filter(line => line.trim());
      
      let distributions = [];
      for (const line of lines) {
        const cleanLine = line.replace(/[\x00-\x1f\x7f-\x9f]/g, '').trim();
        if (cleanLine && 
            !cleanLine.includes('Windows Subsystem for Linux') && 
            !cleanLine.includes('----') &&
            !cleanLine.includes('The following') &&
            !cleanLine.includes('distributions')) {
          
          const distName = cleanLine.replace(/^\*\s*/, '').split(/\s+/)[0];
          if (distName && distName.length > 1) {
            distributions.push(distName);
          }
        }
      }
      
      if (distributions.length === 0) {
        this.log("❌ No WSL distributions found");
        this.log("   Please install a Linux distribution:");
        this.log("   wsl --install -d Ubuntu");
        return null;
      }
      
      const selectedDist = distributions[0]; // Use first available
      this.log(`✅ Found WSL distributions: ${distributions.join(', ')}`);
      this.log(`✅ Will use: ${selectedDist}`);
      
      // Update config file
      const configPath = path.join(this.projectDir, "config.json");
      try {
        const configContent = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configContent);
        config.wslDistribution = selectedDist;
        config.selectedDistributionInfo = {
          name: selectedDist,
          detectedAt: new Date().toISOString(),
          autoDetected: true
        };
        
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        this.log(`✅ Updated config to use ${selectedDist}`);
      } catch (error) {
        this.log("⚠️  Could not update config file", error.message);
      }
      
      return selectedDist;
    } catch (error) {
      this.log("❌ WSL detection failed", error.message);
      return null;
    }
  }

  async testWSLConnection(distribution) {
    if (!distribution) return false;
    
    this.log(`Testing WSL connection to ${distribution}...`);
    
    try {
      const { stdout } = await execAsync(`wsl -d ${distribution} -- echo "Connection test successful"`);
      if (stdout.includes("Connection test successful")) {
        this.log(`✅ WSL connection to ${distribution} is working`);
        return true;
      } else {
        this.log(`⚠️  WSL connection test gave unexpected output`);
        return false;
      }
    } catch (error) {
      this.log(`❌ WSL connection to ${distribution} failed`, error.message);
      return false;
    }
  }

  async fixClaudeDesktopConfig() {
    const platform = process.platform;
    let configPath;
    
    if (platform === "win32") {
      configPath = path.join(process.env.APPDATA, "Claude", "claude_desktop_config.json");
    } else if (platform === "darwin") {
      configPath = path.join(process.env.HOME, "Library", "Application Support", "Claude", "claude_desktop_config.json");
    } else {
      configPath = path.join(process.env.HOME, ".config", "Claude", "claude_desktop_config.json");
    }

    this.log("Checking Claude Desktop configuration...");
    
    try {
      // Read existing config
      let config = {};
      try {
        const configContent = await fs.readFile(configPath, 'utf8');
        config = JSON.parse(configContent);
        this.log("✅ Found existing Claude Desktop config");
      } catch (error) {
        this.log("ℹ️  No existing Claude Desktop config found, creating new one");
        // Create directory if needed
        await fs.mkdir(path.dirname(configPath), { recursive: true });
      }
      
      // Ensure mcpServers exists
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
      
      // Get the current distribution from our config
      let distribution = "auto-detect";
      try {
        const serverConfigPath = path.join(this.projectDir, "config.json");
        const serverConfig = JSON.parse(await fs.readFile(serverConfigPath, 'utf8'));
        distribution = serverConfig.wslDistribution || "auto-detect";
      } catch (error) {
        this.log("⚠️  Could not read server config, using auto-detect");
      }
      
      // Add/update our MCP server
      const serverPath = path.join(this.projectDir, "src", "index.js").replace(/\\/g, "\\\\");
      
      config.mcpServers["linux-bash"] = {
        command: "node",
        args: [serverPath],
        env: {}
      };
      
      // Add distribution if not auto-detect
      if (distribution !== "auto-detect") {
        config.mcpServers["linux-bash"].env.WSL_DISTRIBUTION = distribution;
      }
      
      // Write updated config
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      this.log("✅ Updated Claude Desktop configuration");
      this.log(`   Server path: ${serverPath}`);
      if (distribution !== "auto-detect") {
        this.log(`   WSL Distribution: ${distribution}`);
      }
      
    } catch (error) {
      this.log("❌ Failed to update Claude Desktop config", error.message);
      throw error;
    }
  }

  async runQuickFix() {
    console.log("🚀 Linux Bash MCP Server Quick Fix\n");
    console.log("This will attempt to automatically fix common issues.\n");
    
    try {
      // 1. Install dependencies
      await this.installDependencies();
      console.log("");
      
      // 2. Create default config
      await this.createDefaultConfig();
      console.log("");
      
      // 3. Detect and configure WSL
      const distribution = await this.detectAndConfigureWSL();
      console.log("");
      
      // 4. Test WSL connection
      if (distribution) {
        await this.testWSLConnection(distribution);
        console.log("");
      }
      
      // 5. Fix Claude Desktop config
      await this.fixClaudeDesktopConfig();
      console.log("");
      
      // Success message
      console.log("🎉 Quick fix completed!");
      console.log("");
      console.log("📋 Next steps:");
      console.log("1. Restart Claude Desktop application");
      console.log("2. Try using the linux-bash MCP server");
      console.log("3. If still having issues, run: npm run debug");
      console.log("");
      console.log("💡 Test commands to try in Claude Desktop:");
      console.log("  - 'Check WSL status'");
      console.log("  - 'List files in home directory'");
      console.log("  - 'Show system information'");
      
    } catch (error) {
      console.log("");
      console.log("❌ Quick fix failed:", error.message);
      console.log("");
      console.log("🔧 Manual troubleshooting:");
      console.log("1. Run: npm run debug");
      console.log("2. Check the debug output for specific issues");
      console.log("3. See README.md for detailed instructions");
      process.exit(1);
    }
  }
}

// Run quick fix
const quickFix = new QuickFix();
quickFix.runQuickFix();
