#!/usr/bin/env node

import { promisify } from "util";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReleaseHelper {
  constructor() {
    this.projectDir = __dirname;
  }

  async log(message, details = null) {
    console.log(`🚀 ${message}`);
    if (details) console.log(`   ${details}`);
  }

  async getVersion() {
    try {
      const packageJsonPath = path.join(this.projectDir, "package.json");
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      return packageJson.version;
    } catch (error) {
      throw new Error(`Could not read version from package.json: ${error.message}`);
    }
  }

  async checkGitStatus() {
    try {
      const { stdout } = await execAsync("git status --porcelain");
      if (stdout.trim()) {
        this.log("⚠️  Warning: You have uncommitted changes");
        console.log(stdout);
        return false;
      }
      this.log("✅ Git working directory is clean");
      return true;
    } catch (error) {
      this.log("❌ Error checking git status", error.message);
      return false;
    }
  }

  async runTests() {
    this.log("Running tests before release...");
    try {
      await execAsync("npm test");
      this.log("✅ All tests passed");
      return true;
    } catch (error) {
      this.log("❌ Tests failed", error.message);
      return false;
    }
  }

  async runDiagnostics() {
    this.log("Running diagnostics...");
    try {
      await execAsync("npm run debug");
      this.log("✅ Diagnostics completed");
      return true;
    } catch (error) {
      this.log("❌ Diagnostics failed", error.message);
      return false;
    }
  }

  async createGitCommands() {
    const version = await this.getVersion();
    
    this.log("Git commands for releasing to GitHub:");
    console.log("");
    console.log("🔧 Repository Setup Commands:");
    console.log("=" .repeat(50));
    console.log("");
    
    // Basic git setup
    console.log("# 1. Add all files to git");
    console.log("git add .");
    console.log("");
    
    console.log("# 2. Create initial commit");
    console.log(`git commit -m "feat: Initial release v${version}"`);
    console.log("");
    
    console.log("# 3. Ensure you're on master branch");
    console.log("git branch -M master");
    console.log("");
    
    console.log("# 4. Add your GitHub repository as remote");
    console.log("# Replace 'yourusername' with your actual GitHub username");
    console.log("git remote add origin https://github.com/yourusername/linux-bash-mcp-server.git");
    console.log("");
    
    console.log("# 5. Push to GitHub");
    console.log("git push -u origin master");
    console.log("");
    
    console.log("🏷️  Release Tag Commands:");
    console.log("=" .repeat(50));
    console.log("");
    
    console.log("# 6. Create and push release tag");
    console.log(`git tag -a v${version} -m "Release version ${version}"`);
    console.log(`git push origin v${version}`);
    console.log("");
    
    console.log("📋 GitHub Release Information:");
    console.log("=" .repeat(50));
    console.log("");
    console.log(`Release Title: Linux Bash MCP Server v${version}`);
    console.log("");
    console.log("Release Description:");
    console.log("```");
    console.log(`🎉 **Linux Bash MCP Server v${version}** - Initial Release`);
    console.log("");
    console.log("## ✨ Features");
    console.log("- 🐧 **Universal Linux Support** - Works with Ubuntu, Debian, Fedora, openSUSE, Alpine, and more");
    console.log("- 🔍 **Smart Distribution Detection** - Automatically detects and configures WSL distributions");
    console.log("- 🛡️ **Safe Configuration Merging** - Preserves existing MCP servers");
    console.log("- 🔧 **Comprehensive Tools** - 6 powerful tools for Linux system interaction");
    console.log("- 🚀 **Auto-Fix Utilities** - Automatic problem resolution");
    console.log("- 📊 **Enhanced Diagnostics** - Built-in troubleshooting tools");
    console.log("");
    console.log("## 🛠️ Available Tools");
    console.log("- `execute_bash_command` - Run single bash commands");
    console.log("- `execute_bash_script` - Execute bash scripts with arguments");
    console.log("- `create_bash_script` - Create new bash scripts");
    console.log("- `list_directory` - List directory contents");
    console.log("- `get_system_info` - Get comprehensive system information");
    console.log("- `check_wsl_status` - Check WSL2 status and distribution info");
    console.log("");
    console.log("## 🚀 Quick Start");
    console.log("```bash");
    console.log("git clone https://github.com/yourusername/linux-bash-mcp-server.git");
    console.log("cd linux-bash-mcp-server");
    console.log("npm run fix");
    console.log("```");
    console.log("");
    console.log("## 📋 Requirements");
    console.log("- Windows with WSL2");
    console.log("- Any Linux distribution in WSL2");
    console.log("- Node.js 18+");
    console.log("- Claude Desktop App");
    console.log("");
    console.log("## 🔧 Support");
    console.log("- Run `npm run debug` for diagnostics");
    console.log("- Run `npm run fix` for auto-repair");
    console.log("- See TROUBLESHOOTING.md for detailed help");
    console.log("");
    console.log("Made with ❤️ for the Claude Desktop and Linux community!");
    console.log("```");
    console.log("");
    
    console.log("🌐 After pushing to GitHub:");
    console.log("=" .repeat(50));
    console.log("1. Go to your GitHub repository");
    console.log("2. Click 'Releases' → 'Create a new release'");
    console.log(`3. Select tag 'v${version}'`);
    console.log("4. Use the title and description above");
    console.log("5. Attach any additional assets if needed");
    console.log("6. Click 'Publish release'");
    console.log("");
    
    console.log("📝 Don't forget to:");
    console.log("- Update the repository URLs in package.json");
    console.log("- Update the README.md with your GitHub username");
    console.log("- Set up GitHub Pages for documentation (optional)");
    console.log("- Configure GitHub Actions for CI/CD (optional)");
  }

  async generateReleaseNotes() {
    const version = await this.getVersion();
    const releaseNotesPath = path.join(this.projectDir, `RELEASE_NOTES_v${version}.md`);
    
    const releaseNotes = `# Release Notes - Linux Bash MCP Server v${version}

## 🎉 Initial Release

This is the initial release of Linux Bash MCP Server, a powerful Model Context Protocol server that enables Claude Desktop to execute bash commands and scripts in any WSL2 Linux distribution.

## ✨ Key Features

### 🐧 Universal Linux Distribution Support
- Works with Ubuntu, Debian, Fedora, openSUSE, Alpine Linux, Kali Linux, and more
- Automatic detection and configuration of available WSL distributions
- No hardcoded distribution names - fully dynamic

### 🛡️ Safe Configuration Management
- Preserves existing MCP servers when configuring Claude Desktop
- Automatic backup creation for corrupted configurations
- Intelligent merging that never overwrites existing settings

### 🔧 Comprehensive Tool Suite
Six powerful tools for Linux system interaction:

1. **execute_bash_command** - Execute single bash commands with full output
2. **execute_bash_script** - Run bash scripts with arguments and working directory control
3. **create_bash_script** - Create new executable bash scripts
4. **list_directory** - List directory contents with optional detailed view
5. **get_system_info** - Get comprehensive system information (OS, memory, disk, etc.)
6. **check_wsl_status** - Check WSL2 status and distribution information

### 🚀 Developer Experience
- **One-command setup**: \`npm run fix\` automatically configures everything
- **Comprehensive diagnostics**: \`npm run debug\` identifies and reports issues
- **Interactive setup wizard**: \`npm run setup\` for manual configuration
- **Auto-fix utilities**: Automatic resolution of common problems
- **Extensive testing**: Full test suite with cross-distribution compatibility

### 📊 Enhanced Debugging & Monitoring
- Debug mode with extensive logging
- Real-time command execution monitoring
- Detailed error reporting and stack traces
- Configuration validation and verification
- WSL connection testing and health checks

## 🛠️ Installation Methods

### Quick Setup (Recommended)
\`\`\`bash
git clone https://github.com/yourusername/linux-bash-mcp-server.git
cd linux-bash-mcp-server
npm run fix
\`\`\`

### Manual Setup
\`\`\`bash
npm install
npm run setup
npm test
\`\`\`

### Diagnostic Mode
\`\`\`bash
npm run debug
npm run check-config
\`\`\`

## 🎯 Use Cases

### System Administration
- Monitor system resources and performance
- Check running processes and services
- Manage file systems and permissions
- View system logs and configuration files

### Development & DevOps
- Git repository management
- Docker container operations
- Package management across distributions
- Environment setup and configuration

### File Operations
- Browse and search file systems
- Create and manage scripts
- Backup and archive operations
- Log analysis and monitoring

### Learning & Exploration
- Learn Linux commands interactively
- Explore different distribution features
- Test scripts and commands safely
- Practice system administration

## 🔒 Security Features

- Input validation and sanitization
- Command timeout protection
- Secure script creation with proper escaping
- Working directory isolation
- Error handling without data exposure

## 📋 System Requirements

- **Operating System**: Windows 10/11 with WSL2
- **Linux Distributions**: Any WSL2-compatible distribution
- **Node.js**: Version 18.0.0 or higher
- **Claude Desktop**: Latest version
- **Memory**: 512MB+ available for Node.js processes
- **Disk Space**: 50MB+ for installation

## 🌟 What's Next

Future releases may include:
- Web-based configuration interface
- Additional Linux distribution support
- Performance optimizations
- Extended diagnostic capabilities
- Integration with cloud Linux instances
- Advanced script templates and examples

## 🤝 Contributing

We welcome contributions! Please see:
- [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- [GitHub Issues](https://github.com/yourusername/linux-bash-mcp-server/issues) for bug reports
- [GitHub Discussions](https://github.com/yourusername/linux-bash-mcp-server/discussions) for feature requests

## 📞 Support

- **Documentation**: README.md and TROUBLESHOOTING.md
- **Diagnostics**: Run \`npm run debug\` for automated problem detection
- **Issues**: GitHub Issues for bug reports and feature requests
- **Community**: GitHub Discussions for questions and ideas

## 🙏 Acknowledgments

Special thanks to:
- **Anthropic** for the Model Context Protocol
- **Microsoft** for WSL2 technology
- **The Linux community** for the amazing distributions
- **Open source contributors** who make projects like this possible

---

**Download**: [Linux Bash MCP Server v${version}](https://github.com/yourusername/linux-bash-mcp-server/releases/tag/v${version})

**Installation**: \`git clone https://github.com/yourusername/linux-bash-mcp-server.git && cd linux-bash-mcp-server && npm run fix\`

Made with ❤️ for the Claude Desktop and Linux community!
`;

    await fs.writeFile(releaseNotesPath, releaseNotes);
    this.log(`✅ Release notes created: ${releaseNotesPath}`);
  }

  async createReleaseChecklist() {
    const checklistPath = path.join(this.projectDir, "RELEASE_CHECKLIST.md");
    
    const checklist = `# Release Checklist

Use this checklist to ensure a complete and successful release.

## Pre-Release Validation

- [ ] **Code Quality**
  - [ ] All tests pass (\`npm test\`)
  - [ ] Diagnostics run without errors (\`npm run debug\`)
  - [ ] No linting errors
  - [ ] Code follows project standards

- [ ] **Documentation**
  - [ ] README.md is up to date
  - [ ] CHANGELOG.md includes all changes
  - [ ] API documentation is current
  - [ ] Examples work correctly

- [ ] **Configuration**
  - [ ] package.json version is correct
  - [ ] Repository URLs are updated
  - [ ] Dependencies are up to date
  - [ ] Author information is correct

## Git & GitHub Preparation

- [ ] **Git Status**
  - [ ] All changes are committed
  - [ ] Working directory is clean
  - [ ] On correct branch (master)
  - [ ] No pending merges

- [ ] **GitHub Repository**
  - [ ] Repository is created on GitHub
  - [ ] Repository is public (if intended)
  - [ ] Description and topics are set
  - [ ] License is configured

## Release Process

- [ ] **Version Management**
  - [ ] Version number follows semantic versioning
  - [ ] Version is updated in package.json
  - [ ] CHANGELOG.md reflects current version

- [ ] **Git Operations**
  - [ ] \`git add .\`
  - [ ] \`git commit -m "feat: Release v1.0.0"\`
  - [ ] \`git tag -a v1.0.0 -m "Release version 1.0.0"\`
  - [ ] \`git push origin master\`
  - [ ] \`git push origin v1.0.0\`

- [ ] **GitHub Release**
  - [ ] Create release from tag
  - [ ] Release title is descriptive
  - [ ] Release notes are comprehensive
  - [ ] Assets are attached (if any)

## Post-Release Verification

- [ ] **Functionality**
  - [ ] Clone fresh repository
  - [ ] Installation works (\`npm run fix\`)
  - [ ] Basic functionality works
  - [ ] Documentation links work

- [ ] **Community**
  - [ ] Release announcement (if applicable)
  - [ ] Update project listings
  - [ ] Respond to initial feedback
  - [ ] Monitor for issues

## Release Artifacts

- [ ] **Source Code**
  - [ ] All source files included
  - [ ] .gitignore properly excludes files
  - [ ] No sensitive information included

- [ ] **Documentation Files**
  - [ ] README.md
  - [ ] CHANGELOG.md
  - [ ] CONTRIBUTING.md
  - [ ] LICENSE
  - [ ] TROUBLESHOOTING.md

- [ ] **Configuration Files**
  - [ ] package.json
  - [ ] .gitignore
  - [ ] config.json (example)
  - [ ] claude_desktop_config.example.json

## Quality Assurance

- [ ] **Cross-Platform Testing**
  - [ ] Tested on Windows 10
  - [ ] Tested on Windows 11
  - [ ] Tested with multiple WSL distributions
  - [ ] Tested with different Node.js versions

- [ ] **Integration Testing**
  - [ ] Works with Claude Desktop
  - [ ] Doesn't conflict with other MCP servers
  - [ ] Configuration merging works correctly
  - [ ] All tools function properly

## Success Criteria

- [ ] Repository is publicly accessible
- [ ] Release is properly tagged
- [ ] Installation instructions work
- [ ] Basic functionality is verified
- [ ] Documentation is complete and accurate

## Notes

Add any specific notes or considerations for this release:

---

**Release Completed**: _______________

**Released By**: _______________

**Verified By**: _______________
`;

    await fs.writeFile(checklistPath, checklist);
    this.log(`✅ Release checklist created: ${checklistPath}`);
  }

  async prepareRelease() {
    console.log("🚀 Linux Bash MCP Server - Release Preparation\n");
    
    try {
      const version = await this.getVersion();
      this.log(`Preparing release for version ${version}`);
      console.log("");

      // Pre-release checks
      const gitClean = await this.checkGitStatus();
      console.log("");
      
      if (!gitClean) {
        this.log("⚠️  Please commit or stash your changes before release");
      }

      // Generate release artifacts
      await this.generateReleaseNotes();
      await this.createReleaseChecklist();
      console.log("");

      // Show git commands
      await this.createGitCommands();

    } catch (error) {
      console.log("");
      console.log("❌ Release preparation failed:", error.message);
      process.exit(1);
    }
  }
}

// Run release preparation
const releaseHelper = new ReleaseHelper();
releaseHelper.prepareRelease();
