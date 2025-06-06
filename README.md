# Linux Bash MCP Server

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/linux-bash-mcp-server/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A powerful Model Context Protocol (MCP) server that enables Claude Desktop to execute bash commands and scripts in any WSL2 Linux distribution on Windows. Features universal Linux compatibility, intelligent distribution detection, and comprehensive safety measures.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/linux-bash-mcp-server.git
cd linux-bash-mcp-server

# 2. Run automated setup
npm run fix

# 3. Restart Claude Desktop
# 4. Start using Linux commands in Claude!
```

## ✨ Features

- **🐧 Universal Linux Support** - Works with Ubuntu, Debian, Fedora, openSUSE, Alpine, and more
- **🔍 Smart Distribution Detection** - Automatically detects and configures available WSL distributions
- **🛡️ Safe Configuration Merging** - Preserves existing MCP servers when setting up
- **🔧 Comprehensive Diagnostics** - Built-in troubleshooting and auto-fix tools
- **⚡ High Performance** - Optimized command execution with configurable timeouts
- **📊 Detailed Logging** - Debug mode for troubleshooting and monitoring
- **🔄 Easy Management** - Simple scripts for setup, testing, and maintenance

## 🛠️ Available Tools

| Tool | Description | Example Use |
|------|-------------|-------------|
| `execute_bash_command` | Run single bash commands | `ps aux \| grep nginx` |
| `execute_bash_script` | Execute bash scripts with args | Run monitoring scripts |
| `create_bash_script` | Create new bash scripts | Generate automation scripts |
| `list_directory` | List directory contents | Browse file systems |
| `get_system_info` | Comprehensive system info | Check OS, memory, disk usage |
| `check_wsl_status` | WSL and distribution status | Verify connectivity |

## 📋 Prerequisites

- **Windows with WSL2 installed**
- **Any Linux distribution in WSL2** (Ubuntu, Debian, etc.)
- **Node.js 18+**
- **Claude Desktop App**

## 🎯 Installation & Setup

### Option 1: Automated Setup (Recommended)
```bash
git clone https://github.com/yourusername/linux-bash-mcp-server.git
cd linux-bash-mcp-server
npm run fix
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm install

# Run interactive setup
npm run setup

# Test functionality
npm test
```

### Option 3: Quick Diagnostics
```bash
# Check for issues
npm run debug

# Verify configuration
npm run check-config
```

## ⚙️ Configuration

The server automatically detects your WSL distributions and configures itself. Manual configuration is available in `config.json`:

```json
{
  "wslDistribution": "auto-detect",
  "defaultTimeout": 30000,
  "scriptTimeout": 60000,
  "maxBufferSize": 10485760,
  "debugMode": false
}
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run fix` | Auto-fix common issues and setup |
| `npm run setup` | Interactive configuration wizard |
| `npm run debug` | Comprehensive diagnostics |
| `npm run test` | Test all functionality |
| `npm run check-config` | Verify configurations |
| `npm start` | Start the MCP server |

## 🐧 Supported Linux Distributions

- **Ubuntu** (most common)
- **Debian**
- **Fedora**
- **openSUSE**
- **Alpine Linux**
- **Kali Linux**
- **Oracle Linux**
- **And many more...**

## 💡 Usage Examples

Once configured, use these commands in Claude Desktop:

### System Administration
- *"Show comprehensive system information for my Linux environment"*
- *"Check disk usage and available space"*
- *"List running processes sorted by CPU usage"*

### File Operations
- *"List all files in /var/log with detailed information"*
- *"Find files modified in the last 24 hours"*
- *"Show directory sizes in /home"*

### Development Tasks
- *"Check if Docker is running"*
- *"Show git status for repositories in my home directory"*
- *"List installed Python packages"*

### Automation
- *"Create a backup script for my documents"*
- *"Generate a system monitoring script"*
- *"Create a log rotation script"*

## 🛡️ Safety Features

- **Configuration Preservation** - Never overwrites existing MCP servers
- **Automatic Backups** - Creates backups of corrupted configurations
- **Input Validation** - Validates all commands and parameters
- **Timeout Protection** - Prevents hanging commands
- **Error Handling** - Comprehensive error reporting and recovery

## 🔍 Troubleshooting

### Quick Fixes
```bash
npm run fix        # Auto-resolve common issues
npm run debug      # Detailed diagnostics
```

### Common Issues

**WSL Not Found**
```bash
wsl --install
wsl --install -d Ubuntu
```

**Dependencies Missing**
```bash
npm install
```

**Configuration Issues**
```bash
npm run check-config
npm run setup
```

**Server Not Starting**
```bash
npm run debug
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## 🤝 Integration with Other MCP Servers

This server works seamlessly alongside:
- PowerShell MCP Server (Windows commands)
- Memory MCP Server (Persistent notes)
- File MCP Server (File operations)
- Git MCP Server (Version control)
- Any other MCP servers

## 📚 Project Structure

```
linux-bash-mcp-server/
├── src/
│   └── index.js              # Main MCP server
├── test/
│   └── test.js               # Comprehensive tests
├── examples/
│   ├── system_info.sh        # Example monitoring script
│   └── file_operations.sh    # Example file operations
├── config.json               # Server configuration
├── setup.js                  # Interactive setup
├── debug.js                  # Diagnostic tool
├── quick-fix.js             # Auto-fix utility
├── check-config.js          # Configuration checker
└── README.md                # This file
```

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Universal Linux distribution support
- ✅ Intelligent WSL distribution detection
- ✅ Safe configuration merging
- ✅ Comprehensive diagnostic tools
- ✅ Auto-fix utilities
- ✅ Enhanced error handling
- ✅ Debug mode support

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/linux-bash-mcp-server/issues)
- **Documentation**: [Project Wiki](https://github.com/yourusername/linux-bash-mcp-server/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/linux-bash-mcp-server/discussions)

## 🙏 Acknowledgments

- **Anthropic** for the Model Context Protocol
- **Microsoft** for WSL2 technology
- **The open-source community** for Linux distributions and tools

---

**Made with ❤️ for the Claude Desktop and Linux community**

⭐ **Star this repository if you find it useful!**
