# FreoBus Platform Branching Strategy

## Overview
This document outlines the branching strategy for the FreoBus Platform project, which includes both the marketplace and wallet integration components.

## Branch Types

### Main Branches
- `main` - Production-ready code
  - Always deployable
  - Protected branch
  - Requires pull request and review
- `develop` - Integration branch
  - Latest delivered development changes
  - Pre-production testing
  - Integration point for features

### Feature Branches
Feature branches are created from `develop` and follow the naming convention: `feat/*`

Current feature branches:
- `feat/wallet-integration` - FreoWallet integration features
- `feat/marketplace` - FreoBus marketplace components
- `feat/session-management` - Session handling system
- `feat/security` - Security features and enhancements

### Release Branches
Created from `develop` when ready to prepare a new release.
Naming convention: `release/vX.Y.Z`

Example:
- `release/v1.0.0` - First major release
- `release/v1.1.0` - Feature release
- `release/v1.0.1` - Patch release

### Hotfix Branches
Created from `main` for urgent fixes.
Naming convention: `hotfix/*`

Example:
- `hotfix/security-vulnerability`
- `hotfix/critical-bug`

## Workflow

### Feature Development
```bash
# Create feature branch
git checkout -b feat/new-feature develop

# Work on feature
git commit -m "feat: add new feature"

# Push to remote
git push origin feat/new-feature

# Create PR to develop
```

### Release Process
```bash
# Create release branch
git checkout -b release/v1.0.0 develop

# Version bump and final testing
git commit -m "chore: bump version to 1.0.0"

# Merge to main and develop
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"

git checkout develop
git merge --no-ff release/v1.0.0

# Delete release branch
git branch -d release/v1.0.0
```

### Hotfix Process
```bash
# Create hotfix branch
git checkout -b hotfix/security-fix main

# Fix the issue
git commit -m "fix: security vulnerability"

# Merge to main and develop
git checkout main
git merge --no-ff hotfix/security-fix
git tag -a v1.0.1 -m "Version 1.0.1"

git checkout develop
git merge --no-ff hotfix/security-fix

# Delete hotfix branch
git branch -d hotfix/security-fix
```

## Branch Protection Rules

### Main Branch (`main`)
- Requires pull request reviews
- Requires status checks to pass
- No direct pushes
- No force pushes
- Maintains linear history

### Develop Branch (`develop`)
- Requires pull request reviews
- Requires status checks to pass
- No direct pushes
- Allows force pushes with lease

### Feature Branches
- Allows direct pushes
- Requires status checks to pass before merge
- Auto-delete after merge

## Commit Message Convention

We follow the Conventional Commits specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks

Example:
```bash
feat(wallet): add session management
fix(security): address token validation vulnerability
docs(api): update integration guide
```

## Code Review Process

1. Create Pull Request
2. Automated checks run
3. Code review by at least one team member
4. Address feedback
5. Final approval
6. Merge

## Tools and Automation

- GitHub Actions for CI/CD
- Automated testing on PR
- Automated deployment to staging
- Version bumping automation
- Changelog generation 