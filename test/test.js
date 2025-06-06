#!/usr/bin/env node

import { spawn } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPServerTester {
  constructor() {
    this.wslDistribution = null;
    this.tests = [
      { name: "Load Configuration", method: this.testLoadConfig },
      { name: "WSL Status Check", method: this.testWSLStatus },
      { name: "Basic Command Execution", method: this.testBasicCommand },
      { name: "Directory Listing", method: this.testDirectoryListing },
      { name: "Script Creation", method: this.testScriptCreation },
      { name: "Script Execution", method: this.testScriptExecution },
      { name: "System Information", method: this.testSystemInfo },
    ];
  }

  async loadConfig() {
    try {
      // Try to get WSL distribution from environment variable first
      this.wslDistribution = process.env.WSL_DISTRIBUTION;
      
      if (!this.wslDistribution) {
        // Try to load from config file
        const configPath = path.join(__dirname, "..", "config.json");
        const configContent = await fs.readFile(configPath, "utf8");
        const config = JSON.parse(configContent);
        this.wslDistribution = config.wslDistribution;
      }
      
      if (!this.wslDistribution || this.wslDistribution === "auto-detect") {
        // Auto-detect WSL distribution
        this.wslDistribution = await this.detectDefaultWSLDistribution();
      }
      
      console.log(`   Using WSL distribution: ${this.wslDistribution}`);
      
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  async detectDefaultWSLDistribution() {
    try {
      const { stdout } = await execAsync("wsl -l");
      const lines = stdout.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const cleanLine = line.replace(/[\x00-\x1f\x7f-\x9f]/g, '').trim();
        if (cleanLine && !cleanLine.includes('Windows Subsystem for Linux') && !cleanLine.includes('----')) {
          const distName = cleanLine.replace(/^\*\s*/, '').split(/\s+/)[0];
          if (distName && distName !== 'The' && distName !== 'following') {
            return distName;
          }
        }
      }
      
      throw new Error("No WSL distributions found");
    } catch (error) {
      throw new Error(`Failed to detect WSL distribution: ${error.message}`);
    }
  }

  async runTests() {
    console.log("🧪 Starting Linux Bash MCP Server Tests...\n");
    
    let passed = 0;
    let failed = 0;

    for (const test of this.tests) {
      try {
        console.log(`📋 Running: ${test.name}`);
        await test.method.call(this);
        console.log(`✅ PASSED: ${test.name}\n`);
        passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
        failed++;
      }
    }

    console.log(`\n📊 Test Results:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${this.tests.length}`);
    
    if (failed === 0) {
      console.log(`\n🎉 All tests passed! MCP Server is ready to use with ${this.wslDistribution}.`);
    } else {
      console.log(`\n⚠️  Some tests failed. Please check your WSL2 setup for ${this.wslDistribution}.`);
    }
  }

  async testLoadConfig() {
    await this.loadConfig();
    
    if (!this.wslDistribution) {
      throw new Error("No WSL distribution configured or detected");
    }
    
    console.log(`   Configuration loaded successfully`);
  }

  async testWSLStatus() {
    // Check if WSL2 is available
    const { stdout } = await execAsync("wsl -l -v");
    if (!stdout.includes(this.wslDistribution)) {
      throw new Error(`WSL distribution '${this.wslDistribution}' not found`);
    }
    
    // Test basic WSL command
    const { stdout: testOutput } = await execAsync(`wsl -d ${this.wslDistribution} -- echo 'test'`);
    if (!testOutput.includes("test")) {
      throw new Error(`WSL ${this.wslDistribution} not responding correctly`);
    }
    
    console.log(`   WSL2 ${this.wslDistribution} is accessible`);
  }

  async testBasicCommand() {
    const command = `wsl -d ${this.wslDistribution} -- echo 'Hello from Linux'`;
    const { stdout } = await execAsync(command);
    
    if (!stdout.includes("Hello from Linux")) {
      throw new Error("Basic command execution failed");
    }
    
    console.log("   Basic command execution works");
  }

  async testDirectoryListing() {
    const command = `wsl -d ${this.wslDistribution} -- ls /`;
    const { stdout } = await execAsync(command);
    
    if (!stdout.includes("home") || !stdout.includes("usr")) {
      throw new Error("Directory listing failed - expected directories not found");
    }
    
    console.log("   Directory listing works");
  }

  async testScriptCreation() {
    const scriptContent = "#!/bin/bash\\necho 'Test script executed'\\ndate\\nuname -s";
    const scriptPath = "/tmp/mcp_test_script.sh";
    
    // Create script
    const createCommand = `wsl -d ${this.wslDistribution} -- bash -c "echo '${scriptContent}' > '${scriptPath}'"`;
    await execAsync(createCommand);
    
    // Make executable
    const chmodCommand = `wsl -d ${this.wslDistribution} -- chmod +x '${scriptPath}'`;
    await execAsync(chmodCommand);
    
    // Verify script exists
    const checkCommand = `wsl -d ${this.wslDistribution} -- test -f '${scriptPath}' && echo 'exists'`;
    const { stdout } = await execAsync(checkCommand);
    
    if (!stdout.includes("exists")) {
      throw new Error("Script creation failed");
    }
    
    console.log("   Script creation works");
  }

  async testScriptExecution() {
    const scriptPath = "/tmp/mcp_test_script.sh";
    
    // Execute the script created in previous test
    const execCommand = `wsl -d ${this.wslDistribution} -- bash '${scriptPath}'`;
    const { stdout } = await execAsync(execCommand);
    
    if (!stdout.includes("Test script executed")) {
      throw new Error("Script execution failed");
    }
    
    console.log("   Script execution works");
  }

  async testSystemInfo() {
    const commands = ["uname -s", "whoami", "pwd"];
    
    for (const cmd of commands) {
      const wslCommand = `wsl -d ${this.wslDistribution} -- ${cmd}`;
      const { stdout } = await execAsync(wslCommand);
      
      if (!stdout.trim()) {
        throw new Error(`System info command '${cmd}' returned empty result`);
      }
    }
    
    console.log("   System information commands work");
  }

  async cleanup() {
    try {
      // Clean up test script
      await execAsync(`wsl -d ${this.wslDistribution} -- rm -f /tmp/mcp_test_script.sh`);
      console.log("🧹 Cleanup completed");
    } catch (error) {
      console.log("⚠️  Cleanup warning:", error.message);
    }
  }

  async detectAllDistributions() {
    try {
      const { stdout } = await execAsync("wsl -l -v");
      console.log("📋 Available WSL distributions:");
      console.log(stdout);
      console.log("");
    } catch (error) {
      console.log("⚠️  Could not list WSL distributions:", error.message);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPServerTester();
  
  // Show available distributions first
  tester.detectAllDistributions()
    .then(() => tester.runTests())
    .then(() => tester.cleanup())
    .catch((error) => {
      console.error("❌ Test suite failed:", error);
      process.exit(1);
    });
}

export default MCPServerTester;
