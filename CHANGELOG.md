# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-06

### Added
- 🎉 **Initial release** of Linux Bash MCP Server
- 🐧 **Universal Linux distribution support** for WSL2 (Ubuntu, Debian, Fedora, openSUSE, Alpine, etc.)
- 🔍 **Intelligent WSL distribution detection** and auto-configuration
- 🛡️ **Safe configuration merging** that preserves existing MCP servers
- 🔧 **Comprehensive diagnostic tools** (`npm run debug`)
- ⚡ **Auto-fix utilities** (`npm run fix`) for common issues
- 📊 **Enhanced error handling** with detailed logging and debug mode
- 🛠️ **Six powerful tools** for Linux system interaction:
  - `execute_bash_command` - Execute single bash commands
  - `execute_bash_script` - Run bash scripts with arguments
  - `create_bash_script` - Create new bash scripts
  - `list_directory` - List directory contents
  - `get_system_info` - Get comprehensive system information
  - `check_wsl_status` - Check WSL2 status and distribution info
- 📋 **Interactive setup wizard** (`npm run setup`)
- 🔧 **Configuration management tools** (`npm run check-config`)
- 📖 **Comprehensive documentation** with troubleshooting guide
- 🧪 **Complete test suite** for verification
- 💻 **Cross-distribution compatibility** with universal shell scripts
- 🔄 **Environment variable support** for distribution override
- 📦 **Example scripts** for system monitoring and file operations
- 🛡️ **Security features** including timeout protection and input validation
- 🔧 **Multi-server integration** compatibility with other MCP servers

### Technical Features
- **Automatic backup creation** for corrupted configurations
- **Timeout and buffer size configuration** for optimal performance
- **Fallback mechanisms** for robust error handling
- **Debug mode** with extensive logging
- **Configuration validation** and error recovery
- **WSL2 connection testing** and verification
- **Package manager detection** for different Linux distributions
- **Safe script execution** with proper escaping and validation

### Developer Experience
- **Automated setup process** with minimal user intervention
- **Comprehensive diagnostics** for troubleshooting
- **Auto-fix utilities** for common configuration issues
- **Clear error messages** and resolution guidance
- **Extensive documentation** with examples and best practices
- **Multiple installation methods** (automated, manual, diagnostic)

### Documentation
- **Complete README.md** with installation and usage instructions
- **TROUBLESHOOTING.md** with step-by-step problem resolution
- **Example scripts** demonstrating Linux operations
- **Configuration examples** for various setups
- **Integration guides** for multiple MCP server setups

## [Unreleased]
### Planned Features
- Web-based configuration interface
- Additional Linux distribution support
- Enhanced script templates
- Performance optimizations
- Extended diagnostic capabilities

---

**Release Notes**: This initial release provides a robust, production-ready MCP server for Linux command execution via WSL2, with comprehensive tooling for setup, troubleshooting, and maintenance.
