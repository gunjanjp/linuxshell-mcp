# Contributing to Linux Bash MCP Server

We love your input! We want to make contributing to Linux Bash MCP Server as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/linux-bash-mcp-server.git
   cd linux-bash-mcp-server
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Run tests**
   ```bash
   npm test
   ```
5. **Make your changes**
6. **Test thoroughly**
7. **Submit a pull request**

## 🐛 Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Environment:**
- OS: [e.g. Windows 11]
- WSL Distribution: [e.g. Ubuntu 22.04]
- Node.js Version: [e.g. 18.17.0]
- Claude Desktop Version: [e.g. 0.10.14]

**Describe the bug:**
A clear and concise description of what the bug is.

**To Reproduce:**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior:**
A clear and concise description of what you expected to happen.

**Actual behavior:**
What actually happened.

**Screenshots/Logs:**
If applicable, add screenshots or logs to help explain your problem.

**Diagnostic Output:**
Please run `npm run debug` and include the output.

**Additional context:**
Add any other context about the problem here.
```

## 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful** to most users

## 🔧 Development Process

We use GitHub flow, so all code changes happen through pull requests:

1. Fork the repo and create your branch from `master`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 📝 Pull Request Process

1. **Update the README.md** with details of changes to the interface, if applicable
2. **Update the CHANGELOG.md** with your changes
3. **Increase the version numbers** in any examples files and the README.md to the new version that this Pull Request would represent
4. **Ensure all tests pass** (`npm test`)
5. **Run diagnostics** (`npm run debug`) to verify everything works
6. **The PR will be merged** once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you

## 🧪 Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run diagnostics
npm run debug

# Test specific distributions
npm run test -- --distribution=Ubuntu
```

### Writing Tests
- Add tests for any new functionality
- Ensure tests cover edge cases
- Test with multiple WSL distributions when possible
- Include both positive and negative test cases

### Test Structure
```javascript
describe('Feature Name', () => {
  it('should do something specific', async () => {
    // Test implementation
  });
  
  it('should handle error cases', async () => {
    // Error case testing
  });
});
```

## 📚 Documentation Guidelines

### Code Documentation
- Use clear, descriptive variable and function names
- Add JSDoc comments for public APIs
- Include inline comments for complex logic
- Update README.md for user-facing changes

### Example Documentation
```javascript
/**
 * Execute a bash command in the configured WSL distribution
 * @param {Object} args - Command arguments
 * @param {string} args.command - The bash command to execute
 * @param {string} [args.workingDirectory="."] - Working directory
 * @param {number} [args.timeout] - Timeout in milliseconds
 * @returns {Promise<Object>} Command execution result
 */
async executeBashCommand(args) {
  // Implementation
}
```

## 🎨 Coding Standards

### JavaScript Style Guide
- Use ES6+ features
- Use async/await instead of callbacks
- Use meaningful variable names
- Keep functions small and focused
- Use proper error handling

### Formatting
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters

### Example Code Style
```javascript
const { command, workingDirectory = ".", timeout = 30000 } = args;

if (!command || typeof command !== "string") {
  throw new Error("Command is required and must be a string");
}

try {
  const result = await execAsync(wslCommand, { timeout });
  return this.formatResponse(result);
} catch (error) {
  return this.formatError(error);
}
```

## 🌟 Feature Development

### Adding New Tools
1. **Define the tool** in `setupToolHandlers()`
2. **Implement the handler** method
3. **Add input validation**
4. **Include error handling**
5. **Write tests**
6. **Update documentation**
7. **Add examples**

### Tool Template
```javascript
{
  name: "tool_name",
  description: "Clear description of what the tool does",
  inputSchema: {
    type: "object",
    properties: {
      parameter: {
        type: "string",
        description: "Parameter description"
      }
    },
    required: ["parameter"]
  }
}
```

## 🔧 Configuration Changes

### Adding Configuration Options
1. **Update `config.json` default values**
2. **Add validation** in `loadConfig()`
3. **Update documentation**
4. **Add migration logic** if needed
5. **Test with existing configurations**

## 🐧 Platform Support

### Adding New Linux Distributions
1. **Test compatibility** with the distribution
2. **Update detection logic** if needed
3. **Add distribution-specific handling** if required
4. **Update documentation**
5. **Add to test matrix**

### Distribution-Specific Features
- Package manager detection
- Service management commands
- File system conventions
- Default user configurations

## 📋 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Create GitHub release
- [ ] Tag the release

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's goals and vision

### Communication
- Use GitHub issues for bugs and feature requests
- Use GitHub discussions for questions and ideas
- Be clear and concise in communication
- Provide context and examples

## 📞 Getting Help

- **Documentation**: Check README.md and TROUBLESHOOTING.md
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub discussions for questions
- **Diagnostics**: Run `npm run debug` for troubleshooting

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- CHANGELOG.md for significant contributions
- README.md acknowledgments section

Thank you for contributing to Linux Bash MCP Server! 🚀
