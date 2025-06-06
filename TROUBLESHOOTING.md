# 🚨 MCP Server Troubleshooting Guide

Your MCP server is not working. Let's fix it! I've updated the code and created diagnostic tools to help identify and resolve the issue.

## 🔧 Quick Fix (Try This First)

```bash
cd D:\claude\debian-bash-mcp-server
npm run fix
```

This will automatically:
- ✅ Install/update dependencies
- ✅ Create default configuration
- ✅ Detect your WSL distributions  
- ✅ Test WSL connections
- ✅ Fix Claude Desktop configuration
- ✅ Set up everything correctly

## 🔍 If Quick Fix Doesn't Work

Run the diagnostic tool to see exactly what's wrong:

```bash
npm run debug
```

This will check:
- Node.js version and dependencies
- Project file structure
- WSL availability and distributions
- Configuration files
- Claude Desktop integration

## 📋 Common Issues & Solutions

### 1. **Dependencies Missing**
```bash
npm install
```

### 2. **WSL Not Available**
```bash
# Install WSL
wsl --install

# Install a Linux distribution
wsl --install -d Ubuntu
```

### 3. **Wrong WSL Distribution Name**
```bash
# Check available distributions
wsl -l -v

# Update config.json with correct name
# Or set environment variable
```

### 4. **Claude Desktop Config Issues**
```bash
# Check your configuration
npm run check-config

# Or manually fix at:
# %APPDATA%\Claude\claude_desktop_config.json
```

### 5. **File Path Issues**
Make sure the path in Claude Desktop config matches your actual file location:
```json
{
  "mcpServers": {
    "linux-bash": {
      "command": "node",
      "args": ["D:\\claude\\debian-bash-mcp-server\\src\\index.js"],
      "env": {
        "WSL_DISTRIBUTION": "Ubuntu"
      }
    }
  }
}
```

## 🎯 Step-by-Step Manual Fix

If automated tools don't work:

### Step 1: Check Dependencies
```bash
cd D:\claude\debian-bash-mcp-server
npm install
```

### Step 2: Verify WSL
```bash
wsl --version
wsl -l -v
```

### Step 3: Test WSL Connection
```bash
wsl -d Ubuntu -- echo "test"
# Replace "Ubuntu" with your distribution name
```

### Step 4: Update Configuration
Edit `config.json`:
```json
{
  "wslDistribution": "YourDistributionName",
  "defaultTimeout": 30000,
  "scriptTimeout": 60000,
  "maxBufferSize": 10485760,
  "debugMode": true
}
```

### Step 5: Update Claude Desktop Config
Edit `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "linux-bash": {
      "command": "node",
      "args": ["D:\\claude\\debian-bash-mcp-server\\src\\index.js"],
      "env": {
        "WSL_DISTRIBUTION": "YourDistributionName"
      }
    }
  }
}
```

### Step 6: Test the Server
```bash
npm test
```

### Step 7: Restart Claude Desktop
- Close Claude Desktop completely
- Restart the application
- Try using the linux-bash MCP server

## 🐛 Enhanced Debugging

The updated server now includes extensive debugging output. You can:

1. **Enable debug mode** in `config.json`:
   ```json
   {
     "debugMode": true
   }
   ```

2. **Check server logs** when Claude Desktop starts the MCP server

3. **Use diagnostic commands**:
   ```bash
   npm run debug     # Full diagnostics
   npm run fix       # Auto-fix common issues
   npm run test      # Test functionality
   npm run check-config  # Verify configurations
   ```

## 🔧 What I Fixed in the Code

1. **Enhanced error handling** with detailed logging
2. **Better WSL distribution detection** 
3. **Improved configuration loading** with fallbacks
4. **Added validation checks** for all components
5. **Created diagnostic tools** for troubleshooting
6. **Fixed potential startup issues** 

## 📞 Still Having Issues?

If none of the above works:

1. **Run full diagnostics**: `npm run debug`
2. **Share the diagnostic output** so I can see exactly what's failing
3. **Check the updated README.md** for additional information
4. **Verify your manual configuration** matches the examples exactly

## 🎯 Test Commands for Claude Desktop

Once working, try these commands:
- "Check WSL status and show system information"
- "List files in the home directory"  
- "Execute the command 'uname -a' in Linux"
- "Show disk usage with df -h"

---

**The key changes:**
- Fixed server startup issues
- Added comprehensive error handling
- Created auto-fix and diagnostic tools
- Enhanced WSL distribution detection
- Improved configuration management

Run `npm run fix` first, then `npm run debug` if needed!
