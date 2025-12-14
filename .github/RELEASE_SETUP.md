# Release Setup Guide

This document explains how the automated release and publishing workflow is configured for the Own UI project.

## Overview

The project uses [Changesets](https://github.com/changesets/changesets) for version management and automated publishing to npm. The workflow is designed to:

- ✅ Only publish packages that have changes
- ✅ Automatically version packages based on changesets
- ✅ Create GitHub releases
- ✅ Publish to npm with proper authentication
- ✅ Generate publish summaries

## Prerequisites

### 1. NPM Token Setup

To enable automated publishing to npm, you need to configure an NPM access token as a GitHub secret.

#### Creating an NPM Token

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Click on your profile picture → **Access Tokens**
3. Click **Generate New Token** → **Classic Token**
4. Select **Automation** type (recommended for CI/CD)
5. Copy the generated token

#### Adding Token to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **Add secret**

### 2. Package Access Configuration

All publishable packages are configured with:
```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

This ensures packages are published as public to npm (required for scoped packages like `@ownui/*`).

## Workflow Architecture

### File: `.github/workflows/release.yml`

The release workflow runs on every push to the `main` branch and performs the following steps:

1. **Checkout & Setup**
   - Checks out the repository with full history
   - Sets up Node.js 20 with npm registry configuration
   - Sets up pnpm 10
   - Configures pnpm cache for faster builds

2. **Build & Test**
   - Installs dependencies with frozen lockfile
   - Builds all packages using Turbo
   - Runs all tests to ensure quality

3. **Release**
   - Uses `changesets/action@v1` to:
     - Create a "Version Packages" PR if there are unreleased changesets
     - Or publish packages to npm if the "Version Packages" PR is merged
   - Only publishes packages that have changes
   - Generates a summary of published packages

4. **Publish Summary**
   - Shows which packages were published
   - Displays package names and versions
   - Visible in the GitHub Actions workflow summary

## How to Use

### For Contributors

When making changes to a package:

1. Make your code changes
2. Run tests: `pnpm test`
3. Create a changeset:
   ```bash
   pnpm changeset
   ```
4. Follow the prompts:
   - Select packages that changed
   - Choose version bump type (major/minor/patch)
   - Write a change summary
5. Commit the changeset file along with your changes
6. Create a Pull Request

### For Maintainers

#### Automatic Release Flow

1. **PRs with changesets get merged to `main`**
   - The workflow automatically creates or updates a "Version Packages" PR
   - This PR contains version updates and changelog entries

2. **Merge the "Version Packages" PR**
   - The workflow automatically publishes changed packages to npm
   - GitHub releases are created
   - Changelog is updated

#### Manual Release (Emergency)

If you need to manually publish:

```bash
# Ensure you're on main and up to date
git checkout main
git pull

# Build all packages
pnpm build

# Publish (requires NPM_TOKEN in environment)
pnpm release
```

## Published Packages

The following packages are automatically published when they have changes:

| Package | Description | npm |
|---------|-------------|-----|
| `@ownui/tw-theme` | Tailwind CSS theme plugin | [![npm](https://img.shields.io/npm/v/@ownui/tw-theme.svg)](https://www.npmjs.com/package/@ownui/tw-theme) |
| `@ownui/ui` | Main UI component package | [![npm](https://img.shields.io/npm/v/@ownui/ui.svg)](https://www.npmjs.com/package/@ownui/ui) |
| `@ownui/button` | Button component | [![npm](https://img.shields.io/npm/v/@ownui/button.svg)](https://www.npmjs.com/package/@ownui/button) |
| `@ownui/dropdown` | Dropdown component | [![npm](https://img.shields.io/npm/v/@ownui/dropdown.svg)](https://www.npmjs.com/package/@ownui/dropdown) |
| `@ownui/loader` | Loader component | [![npm](https://img.shields.io/npm/v/@ownui/loader.svg)](https://www.npmjs.com/package/@ownui/loader) |
| `@ownui/dom-utils` | DOM utility functions | [![npm](https://img.shields.io/npm/v/@ownui/dom-utils.svg)](https://www.npmjs.com/package/@ownui/dom-utils) |

## Changeset Configuration

### File: `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": true,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

Key settings:
- **commit**: Automatically commits version updates
- **access**: All packages are public
- **baseBranch**: Releases are based on `main`
- **updateInternalDependencies**: Workspace dependencies get patch bumps

## NPM Authentication

### File: `.npmrc`

```
strict-peer-dependencies=false
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

The `NPM_TOKEN` environment variable is:
- Set in the GitHub workflow from the `NPM_TOKEN` secret
- Used by pnpm to authenticate with npm registry
- Required for publishing packages

## Troubleshooting

### Publishing Fails with Authentication Error

**Problem**: `npm ERR! code ENEEDAUTH` or `401 Unauthorized`

**Solution**:
1. Verify `NPM_TOKEN` secret exists in GitHub repository settings
2. Check that the token hasn't expired on npmjs.com
3. Ensure the token has "Automation" permissions
4. Regenerate token if necessary and update GitHub secret

### Packages Not Publishing Despite Changes

**Problem**: Workflow runs but no packages are published

**Solution**:
1. Ensure changesets were created for the changes: `pnpm changeset status`
2. Check that the "Version Packages" PR was merged (not just closed)
3. Verify packages have `publishConfig.access: "public"` in their `package.json`
4. Check workflow logs for specific errors

### Version PR Not Created

**Problem**: Changes merged but no "Version Packages" PR appears

**Solution**:
1. Verify changesets exist in `.changeset/` directory
2. Check that commits include `.changeset/*.md` files
3. Ensure the workflow has permissions to create PRs
4. Review workflow logs for errors in the changesets action

## Monitoring Releases

### GitHub Actions

- View workflow runs: `https://github.com/ferbbo/own-ui/actions/workflows/release.yml`
- Check publish summaries in workflow run details
- Review step logs for detailed information

### NPM Registry

- Check published versions: `npm view @ownui/<package> versions`
- View package page: `https://www.npmjs.com/package/@ownui/<package>`

## Security Considerations

1. **Token Permissions**: Use "Automation" tokens, not "Publish" tokens
2. **Token Scope**: Limit token to `@ownui` scope if possible
3. **Token Rotation**: Regularly rotate npm tokens (every 90-180 days)
4. **Secret Access**: Only maintainers should have access to GitHub secrets
5. **2FA**: Enable 2FA on npm account for additional security

## Additional Resources

- [Changesets Documentation](https://github.com/changesets/changesets/tree/main/docs)
- [GitHub Actions - Publishing packages](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [npm Token Management](https://docs.npmjs.com/about-access-tokens)
- [pnpm Publishing](https://pnpm.io/cli/publish)
