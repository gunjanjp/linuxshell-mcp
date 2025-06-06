# Release Checklist

Use this checklist to ensure a complete and successful release.

## Pre-Release Validation

- [ ] **Code Quality**
  - [ ] All tests pass (`npm test`)
  - [ ] Diagnostics run without errors (`npm run debug`)
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
  - [ ] `git add .`
  - [ ] `git commit -m "feat: Release v1.0.0"`
  - [ ] `git tag -a v1.0.0 -m "Release version 1.0.0"`
  - [ ] `git push origin master`
  - [ ] `git push origin v1.0.0`

- [ ] **GitHub Release**
  - [ ] Create release from tag
  - [ ] Release title is descriptive
  - [ ] Release notes are comprehensive
  - [ ] Assets are attached (if any)

## Post-Release Verification

- [ ] **Functionality**
  - [ ] Clone fresh repository
  - [ ] Installation works (`npm run fix`)
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
