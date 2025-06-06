#!/usr/bin/env node

import { promisify } from "util";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import readline from "readline";

const execAsync = promisify(exec);

class SetupScript {
  constructor() {
    this.projectDir = process.cwd();
    this.configPath = this.getClaudeConfigPath();
    this.serverConfigPath = path.join(this.projectDir, "config.json");
    this.selectedDistribution = null;
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

  async promptUser(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  async detectWSLDistributions() {
    console.log("🔍 Detecting available WSL distributions...\n");
    
    try {
      const { stdout } = await execAsync("wsl -l -v");
      
      // Parse WSL output to extract distribution names and states
      const lines = stdout.split('\n').filter(line => line.trim());
      const distributions = [];
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (line) {
          // Remove special characters and parse
          const cleanLine = line.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
          const parts = cleanLine.split(/\s+/);
          
          if (parts.length >= 3) {
            const name = parts[0].replace(/^\*\s*/, ''); // Remove default marker
            const state = parts[1];
            const version = parts[2];
            
            if (state === "Running" || state === "Stopped") {
              distributions.push({
                name: name,
                state: state,
                version: version,
                isDefault: line.includes('*')
              });
            }
          }
        }
      }
      
      return distributions;
    } catch (error) {
      throw new Error(`Failed to detect WSL distributions: ${error.message}`);
    }
  }

  async selectDistribution(distributions) {
    if (distributions.length === 0) {
      throw new Error("No WSL distributions found. Please install a Linux distribution first.");
    }

    console.log("📋 Available WSL distributions:");
    distributions.forEach((dist, index) => {
      const defaultMarker = dist.isDefault ? " (default)" : "";
      const stateIcon = dist.state === "Running" ? "🟢" : "🔴";
      console.log(`${index + 1}. ${stateIcon} ${dist.name} - ${dist.state}, WSL${dist.version}${defaultMarker}`);
    });
    console.log("");

    let selectedIndex;
    
    if (distributions.length === 1) {
      console.log(`🎯 Only one distribution available: ${distributions[0].name}`);
      selectedIndex = 0;
    } else {
      const answer = await this.promptUser("Select distribution number (or press Enter for default): ");
      
      if (answer === "") {
        // Find default distribution
        const defaultDist = distributions.find(d => d.isDefault);
        if (defaultDist) {
          selectedIndex = distributions.indexOf(defaultDist);
          console.log(`📌 Using default distribution: ${defaultDist.name}`);
        } else {
          selectedIndex = 0;
          console.log(`📌 Using first distribution: ${distributions[0].name}`);
        }
      } else {
        selectedIndex = parseInt(answer) - 1;
        
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= distributions.length) {
          throw new Error("Invalid selection. Please run setup again.");
        }
      }
    }

    const selected = distributions[selectedIndex];
    console.log(`✅ Selected: ${selected.name}\n`);
    
    return selected;
  }

  async testDistribution(distribution) {
    console.log(`🧪 Testing ${distribution.name}...`);
    
    try {
      // Start the distribution if it's stopped
      if (distribution.state === "Stopped") {
        console.log(`   Starting ${distribution.name}...`);
        await execAsync(`wsl -d ${distribution.name} -- echo "starting"`);
      }
      
      // Test basic commands
      const tests = [
        { cmd: "echo 'Hello WSL'", desc: "Basic echo test" },
        { cmd: "whoami", desc: "User identification" },
        { cmd: "pwd", desc: "Working directory" },
        { cmd: "uname -s", desc: "Operating system" }
      ];
      
      for (const test of tests) {
        try {
          const { stdout } = await execAsync(`wsl -d ${distribution.name} -- ${test.cmd}`);
          console.log(`   ✅ ${test.desc}: ${stdout.trim()}`);
        } catch (error) {
          console.log(`   ⚠️  ${test.desc}: ${error.message}`);
        }
      }
      
      console.log(`✅ ${distribution.name} is working correctly\n`);
      
    } catch (error) {
      throw new Error(`Failed to test ${distribution.name}: ${error.message}`);
    }
  }

  async checkPrerequisites() {
    console.log("🔍 Checking prerequisites...\n");

    // Check Node.js version
    try {
      const { stdout } = await execAsync("node --version");
      const version = stdout.trim();
      console.log(`✅ Node.js: ${version}`);
      
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      if (majorVersion < 18) {
        throw new Error("Node.js 18+ is required");
      }
    } catch (error) {
      console.log("❌ Node.js not found or version too old");
      throw error;
    }

    // Check WSL
    try {
      const { stdout } = await execAsync("wsl --version");
      console.log("✅ WSL is installed");
    } catch (error) {
      console.log("❌ WSL not found");
      throw new Error("WSL2 is required but not installed");
    }

    // Detect and select WSL distribution
    try {
      const distributions = await this.detectWSLDistributions();
      this.selectedDistribution = await this.selectDistribution(distributions);
      await this.testDistribution(this.selectedDistribution);
    } catch (error) {
      console.log("❌ WSL distribution setup failed");
      throw error;
    }

    console.log("✅ All prerequisites check passed!\n");
  }

  async updateServerConfig() {
    console.log("⚙️  Updating server configuration...\n");
    
    try {
      // Read existing config
      let config = {};
      try {
        const configContent = await fs.readFile(this.serverConfigPath, "utf8");
        config = JSON.parse(configContent);
      } catch (error) {
        // Use default config if file doesn't exist
        config = {
          wslDistribution: "auto-detect",
          defaultTimeout: 30000,
          scriptTimeout: 60000,
          maxBufferSize: 10485760,
          debugMode: false
        };
      }
      
      // Update with selected distribution
      config.wslDistribution = this.selectedDistribution.name;
      config.selectedDistributionInfo = {
        name: this.selectedDistribution.name,
        state: this.selectedDistribution.state,
        version: this.selectedDistribution.version,
        isDefault: this.selectedDistribution.isDefault,
        configuredAt: new Date().toISOString()
      };
      
      // Write updated config
      await fs.writeFile(this.serverConfigPath, JSON.stringify(config, null, 2));
      
      console.log(`✅ Server configured to use: ${this.selectedDistribution.name}`);
      console.log(`📄 Configuration saved to: ${this.serverConfigPath}\n`);
      
    } catch (error) {
      throw new Error(`Failed to update server configuration: ${error.message}`);
    }
  }

  async installDependencies() {
    console.log("📦 Installing Node.js dependencies...\n");
    
    try {
      const { stdout, stderr } = await execAsync("npm install", { cwd: this.projectDir });
      console.log("✅ Dependencies installed successfully");
      if (stderr) {
        console.log("⚠️  Warnings:", stderr);
      }
    } catch (error) {
      console.log("❌ Failed to install dependencies");
      throw error;
    }
    
    console.log("");
  }

  async runTests() {
    console.log("🧪 Running tests to verify setup...\n");
    
    try {
      // Set environment variable for tests to use selected distribution
      process.env.WSL_DISTRIBUTION = this.selectedDistribution.name;
      
      const { stdout } = await execAsync("npm test", { 
        cwd: this.projectDir,
        env: { ...process.env, WSL_DISTRIBUTION: this.selectedDistribution.name }
      });
      console.log(stdout);
    } catch (error) {
      console.log("❌ Tests failed");
      console.log(error.stdout || error.message);
      throw error;
    }
  }

  async loadExistingClaudeConfig() {
    try {
      const configContent = await fs.readFile(this.configPath, "utf8");
      return JSON.parse(configContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty config
        return {};
      } else if (error instanceof SyntaxError) {
        // Invalid JSON, backup and start fresh
        const backupPath = `${this.configPath}.backup.${Date.now()}`;
        await fs.copyFile(this.configPath, backupPath);
        console.log(`⚠️  Invalid JSON in config file. Backed up to: ${backupPath}`);
        return {};
      } else {
        throw error;
      }
    }
  }

  async generateConfig() {
    console.log("⚙️  Updating Claude Desktop configuration...\n");
    
    const serverPath = path.join(this.projectDir, "src", "index.js").replace(/\\/g, "\\\\");
    
    const newMcpServer = {
      "linux-bash": {
        command: "node",
        args: [serverPath],
        env: {
          WSL_DISTRIBUTION: this.selectedDistribution.name
        }
      }
    };

    // Load existing configuration
    let existingConfig = await this.loadExistingClaudeConfig();
    
    // Ensure mcpServers exists
    if (!existingConfig.mcpServers) {
      existingConfig.mcpServers = {};
      console.log("📄 Creating new Claude Desktop configuration");
    } else {
      console.log("📄 Found existing Claude Desktop configuration");
      
      // Show existing MCP servers
      const existingServers = Object.keys(existingConfig.mcpServers);
      if (existingServers.length > 0) {
        console.log("📋 Existing MCP servers:");
        existingServers.forEach(server => {
          console.log(`   • ${server}`);
        });
      }
    }

    // Check if our server already exists
    if (existingConfig.mcpServers["linux-bash"]) {
      console.log("⚠️  'linux-bash' MCP server already exists - updating configuration");
    } else {
      console.log("➕ Adding new 'linux-bash' MCP server");
    }

    // Merge configurations - add our server without affecting others
    const mergedConfig = {
      ...existingConfig,
      mcpServers: {
        ...existingConfig.mcpServers,
        ...newMcpServer
      }
    };

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });

    // Write merged configuration
    await fs.writeFile(this.configPath, JSON.stringify(mergedConfig, null, 2));
    
    console.log(`✅ Configuration updated at: ${this.configPath}`);
    
    // Show final MCP servers list
    const finalServers = Object.keys(mergedConfig.mcpServers);
    console.log("📋 All configured MCP servers:");
    finalServers.forEach(server => {
      const isNew = server === "linux-bash";
      const icon = isNew ? "🆕" : "📌";
      const label = isNew ? " (newly added)" : "";
      console.log(`   ${icon} ${server}${label}`);
    });
    console.log("");

    return this.configPath;
  }

  async printInstructions(configPath) {
    console.log("🎉 Setup completed successfully!\n");
    
    console.log("📋 Configuration Summary:");
    console.log(`   • WSL Distribution: ${this.selectedDistribution.name}`);
    console.log(`   • Distribution State: ${this.selectedDistribution.state}`);
    console.log(`   • WSL Version: ${this.selectedDistribution.version}`);
    console.log(`   • Server Config: ${this.serverConfigPath}`);
    console.log(`   • Claude Config: ${configPath}\n`);
    
    console.log("🔧 Claude Desktop Integration:");
    console.log("   ✅ MCP server 'linux-bash' has been added to your Claude Desktop configuration");
    console.log("   ✅ Existing MCP servers have been preserved");
    console.log("   ✅ No existing configurations were modified or removed\n");
    
    console.log("📋 Next steps:");
    console.log("1. 🔄 Restart Claude Desktop application");
    console.log("2. 🛠️  The 'linux-bash' MCP server should now be available alongside your existing servers");
    console.log("3. 🧪 Try these example commands in Claude Desktop:");
    console.log("   - 'Check WSL status and show system information'");
    console.log("   - 'List files in /home directory'");
    console.log("   - 'Show Linux distribution information'");
    console.log("   - 'Create a system monitoring script and run it'\n");
    
    console.log("📁 Project files:");
    console.log(`   - Server: ${path.join(this.projectDir, "src", "index.js")}`);
    console.log(`   - Server Config: ${this.serverConfigPath}`);
    console.log(`   - Claude Config: ${configPath}`);
    console.log(`   - Examples: ${path.join(this.projectDir, "examples")}`);
    console.log(`   - Tests: ${path.join(this.projectDir, "test")}\n`);
    
    console.log("🔧 Available tools in 'linux-bash' MCP server:");
    console.log("   - execute_bash_command: Run single bash commands");
    console.log("   - execute_bash_script: Run bash script files with arguments");
    console.log("   - create_bash_script: Create new bash scripts");
    console.log("   - list_directory: List directory contents");
    console.log("   - get_system_info: Get comprehensive system information");
    console.log("   - check_wsl_status: Check WSL2 status and distribution info\n");
    
    console.log("🔄 To change WSL distribution later:");
    console.log("   Run 'npm run setup' again to reconfigure\n");
    
    console.log("🔗 Integration notes:");
    console.log("   • This server works alongside any existing MCP servers you have");
    console.log("   • Your existing Claude Desktop configuration has been preserved");
    console.log("   • You can use multiple MCP servers simultaneously in Claude Desktop\n");
    
    console.log("📖 For more information, see README.md");
  }

  async run() {
    try {
      console.log("🚀 Linux Bash MCP Server Setup\n");
      
      await this.checkPrerequisites();
      await this.updateServerConfig();
      await this.installDependencies();
      await this.runTests();
      const configPath = await this.generateConfig();
      await this.printInstructions(configPath);
      
    } catch (error) {
      console.log("\n❌ Setup failed:", error.message);
      console.log("\n🔧 Troubleshooting:");
      console.log("1. Ensure WSL2 is installed: 'wsl --install'");
      console.log("2. Install a Linux distribution: 'wsl --install -d Ubuntu' or 'wsl --install -d Debian'");
      console.log("3. Update WSL: 'wsl --update'");
      console.log("4. Check Node.js version: 'node --version' (requires 18+)");
      console.log("5. List WSL distributions: 'wsl -l -v'");
      console.log("6. See README.md for detailed instructions");
      process.exit(1);
    }
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new SetupScript();
  setup.run();
}

export default SetupScript;
