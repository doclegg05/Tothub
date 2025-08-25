# Branch Protection Setup Instructions

This document provides step-by-step instructions to enable branch protection for the `main` branch in your GitHub repository.

## 🚨 Why Branch Protection?

Branch protection ensures that:
- Code quality is maintained
- All tests pass before merging
- Code reviews are required
- History is preserved
- Security vulnerabilities are caught early

## 📋 Prerequisites

- Repository admin access on GitHub
- CI workflow already configured (✅ Done)
- Status checks configured (✅ Done)

## 🔧 Step-by-Step Setup

### 1. Navigate to Repository Settings

1. Go to your GitHub repository: `https://github.com/your-username/tothub`
2. Click on **Settings** tab
3. In the left sidebar, click **Branches**

### 2. Add Branch Protection Rule

1. Click **Add rule** button
2. In the **Branch name pattern** field, enter: `main`
3. Click **Create**

### 3. Configure Protection Settings

#### ✅ **Require a pull request before merging**
- Check this box
- This ensures all changes go through PR review

#### ✅ **Require approvals**
- Check this box
- Set **Required number of reviewers** to `1` (or more)
- Check **Dismiss stale PR approvals when new commits are pushed**
- Check **Require review from code owners** (if you have CODEOWNERS file)

#### ✅ **Require status checks to pass before merging**
- Check this box
- In **Status checks that are required**, add:
  - `lint` - ESLint checks
  - `typecheck` - TypeScript compilation
  - `test` - Playwright tests
  - `build` - Build verification
  - `security` - Security audit

#### ✅ **Require branches to be up to date before merging**
- Check this box
- This ensures PRs are based on the latest main branch

#### ✅ **Require conversation resolution before merging**
- Check this box
- Ensures all review comments are addressed

#### ✅ **Require signed commits**
- **Optional but recommended**
- Check this box if you want to enforce commit signing

#### ✅ **Require linear history**
- **Optional but recommended**
- Check this box to prevent merge commits
- Creates a clean, linear git history

#### ✅ **Require deployments to succeed before merging**
- **Optional**
- Check this box if you have deployment environments
- Useful for staging/production deployments

### 4. Additional Settings

#### **Restrict pushes that create files that are larger than 100 MB**
- Check this box
- Prevents large files from being committed

#### **Allow force pushes**
- **Leave unchecked**
- Prevents dangerous force pushes to main

#### **Allow deletions**
- **Leave unchecked**
- Prevents accidental branch deletion

### 5. Save the Rule

1. Scroll to the bottom
2. Click **Create** button
3. Confirm the rule creation

## 🔍 Verification

### Test the Protection

1. Create a new branch: `git checkout -b test-protection`
2. Make a small change
3. Push and create a PR to main
4. Verify that:
   - CI checks run automatically
   - PR cannot be merged until checks pass
   - At least one approval is required

### Check Status

- Go to **Settings** → **Branches**
- Verify the rule is active
- Check that all required status checks are listed

## 📝 Example Configuration

Here's what your branch protection rule should look like:

```
Branch name pattern: main

✅ Require a pull request before merging
✅ Require approvals (1 reviewer)
✅ Dismiss stale PR approvals when new commits are pushed
✅ Require review from code owners

✅ Require status checks to pass before merging
Required status checks:
- lint
- typecheck  
- test
- build
- security

✅ Require branches to be up to date before merging
✅ Require conversation resolution before merging
✅ Require signed commits
✅ Require linear history

✅ Restrict pushes that create files that are larger than 100 MB
❌ Allow force pushes
❌ Allow deletions
```

## 🚨 Troubleshooting

### Common Issues

#### **Status checks not showing up**
- Ensure CI workflow is properly configured
- Check that workflow names match exactly
- Verify workflow runs on pull requests

#### **Can't merge even with approvals**
- Check that all required status checks have passed
- Ensure branch is up to date with main
- Verify conversation resolution

#### **CI checks failing**
- Check the Actions tab for error details
- Verify local tests pass: `pnpm test`
- Check for dependency issues: `pnpm install`

### Reset Protection

If you need to temporarily disable protection:

1. Go to **Settings** → **Branches**
2. Click on the main branch rule
3. Click **Edit**
4. Uncheck problematic settings
5. Click **Save changes**

**⚠️ Warning**: Only disable protection temporarily and for debugging purposes.

## 🔄 Maintenance

### Regular Reviews

- Monthly: Review protection settings
- Quarterly: Update required status checks
- Annually: Review and update protection policies

### Updates

- Keep CI workflow names in sync with protection rules
- Update required reviewers as team changes
- Monitor protection rule effectiveness

## 📚 Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/troubleshooting-required-status-checks)
- [Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

## ✅ Checklist

- [ ] Branch protection rule created for `main`
- [ ] PR requirement enabled
- [ ] Review requirement configured
- [ ] Status checks required
- [ ] Up-to-date requirement enabled
- [ ] Conversation resolution required
- [ ] Large file restriction enabled
- [ ] Force push disabled
- [ ] Deletion disabled
- [ ] Protection rule tested with PR
- [ ] All CI checks passing
- [ ] Team members notified of new requirements

---

**Remember**: Branch protection is a safety net, not a replacement for good development practices. Encourage your team to run tests locally and review code thoroughly before submitting PRs.