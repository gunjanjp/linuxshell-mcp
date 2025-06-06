#!/usr/bin/env node

import { promisify } from "util";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

class ProjectMonitor {
  constructor() {
    this.repoUrl = this.getRepoUrl();
  }

  getRepoUrl() {
    // This will be extracted from package.json or git config
    return "https://github.com/yourusername/linux-bash-mcp-server";
  }

  async checkHealth() {
    console.log("🔍 Linux Bash MCP Server - Project Health Check\n");
    
    try {
      // Check if tests pass
      console.log("🧪 Running test suite...");
      await execAsync("npm test");
      console.log("✅ All tests passing\n");
      
      // Check for common issues
      console.log("🔧 Checking for common issues...");
      await execAsync("npm run debug");
      console.log("✅ Diagnostics completed\n");
      
      // Check dependencies
      console.log("📦 Checking dependencies...");
      const { stdout } = await execAsync("npm audit --audit-level=high");
      if (stdout.trim()) {
        console.log("⚠️  Security audit found issues:");
        console.log(stdout);
      } else {
        console.log("✅ No high-severity security issues found");
      }
      
      console.log("\n🎉 Project health check completed successfully!");
      console.log("\n📊 Project Status:");
      console.log(`   Repository: ${this.repoUrl}`);
      console.log("   Status: ✅ Healthy");
      console.log("   Tests: ✅ Passing");
      console.log("   Security: ✅ No high-risk issues");
      
    } catch (error) {
      console.log(`\n❌ Health check failed: ${error.message}`);
      console.log("\n🔧 Recommended actions:");
      console.log("1. Fix failing tests");
      console.log("2. Run 'npm run debug' for detailed diagnostics");
      console.log("3. Update dependencies if needed");
    }
  }

  async generateProjectStats() {
    console.log("📊 Project Statistics\n");
    
    try {
      // Count lines of code
      const { stdout: lines } = await execAsync("find . -name '*.js' -not -path './node_modules/*' | xargs wc -l | tail -1");
      console.log(`📝 Lines of code: ${lines.trim().split(/\s+/)[0]}`);
      
      // Count files
      const { stdout: files } = await execAsync("find . -name '*.js' -not -path './node_modules/*' | wc -l");
      console.log(`📄 JavaScript files: ${files.trim()}`);
      
      // Check documentation
      const { stdout: docs } = await execAsync("find . -name '*.md' | wc -l");
      console.log(`📚 Documentation files: ${docs.trim()}`);
      
      // Check test coverage (approximate)
      const { stdout: tests } = await execAsync("find . -name '*test*.js' -not -path './node_modules/*' | wc -l");
      console.log(`🧪 Test files: ${tests.trim()}`);
      
    } catch (error) {
      console.log("❌ Could not generate statistics:", error.message);
    }
  }

  async suggestImprovements() {
    console.log("\n💡 Suggested Improvements:\n");
    
    const suggestions = [
      "🔄 Set up GitHub Actions for automated testing",
      "📈 Add code coverage reporting",
      "🎯 Create issue templates for bugs and features",
      "📝 Add examples for advanced use cases",
      "🌐 Consider creating a project website/docs",
      "📱 Add support for more Linux distributions",
      "🔧 Implement configuration validation",
      "📊 Add performance monitoring",
      "🎨 Create a project logo/branding",
      "🤝 Add contribution guidelines and code of conduct"
    ];
    
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
  }

  async run() {
    await this.checkHealth();
    console.log("\n" + "=".repeat(50));
    await this.generateProjectStats();
    console.log("\n" + "=".repeat(50));
    await this.suggestImprovements();
  }
}

// Run monitor
const monitor = new ProjectMonitor();
monitor.run().catch(console.error);
