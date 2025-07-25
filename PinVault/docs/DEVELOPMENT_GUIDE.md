# PIN Vault Development Guide

This guide provides comprehensive instructions for setting up the development
environment and following best practices when contributing to PIN Vault.

## Table of Contents

- [Quick Start](#quick-start)
- [Development Tools](#development-tools)
- [Code Quality](#code-quality)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Expo CLI**: `npm install -g @expo/cli`
- **Git** for version control
- **VS Code** (recommended) with suggested extensions

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/DavidPeltz/Pincode_Vault.git
   cd Pincode_Vault/PinVault
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm start
   ```

4. **Run on specific platforms**
   ```bash
   npm run android  # Android
   npm run ios      # iOS (requires macOS)
   npm run web      # Web browser
   ```

## Development Tools

### Code Quality Tools

The project uses several tools to maintain code quality:

- **ESLint**: Static code analysis and error detection
- **Prettier**: Code formatting and style consistency
- **Husky**: Git hooks for pre-commit quality checks
- **lint-staged**: Run linters only on staged files

### Available Scripts

```bash
# Development
npm start                # Start Expo development server
npm run android          # Run on Android
npm run ios             # Run on iOS
npm run web             # Run on web

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Run ESLint with auto-fix
npm run format          # Format code with Prettier
npm run format:check    # Check if code is formatted
npm run quality         # Run both linting and format check
npm run quality:fix     # Fix all linting and formatting issues
```

### VS Code Setup

#### Recommended Extensions

The project includes VS Code extension recommendations in
`.vscode/extensions.json`:

- **esbenp.prettier-vscode**: Code formatting
- **dbaeumer.vscode-eslint**: JavaScript linting
- **ms-vscode.vscode-react-native**: React Native development
- **christian-kohler.path-intellisense**: Auto-complete for file paths
- **eamodio.gitlens**: Enhanced Git integration

#### Workspace Settings

VS Code settings are configured to:

- Auto-format on save
- Run ESLint auto-fix on save
- Use Prettier as the default formatter
- Set consistent indentation (2 spaces)
- Enable helpful extensions

## Code Quality

### ESLint Configuration

The project uses a comprehensive ESLint configuration with:

- **React Native** specific rules
- **React** best practices
- **JSDoc** documentation validation
- **Import/Export** organization
- **Security** and **performance** rules

### Prettier Configuration

Code formatting is standardized with:

- **100 character** line width
- **2 space** indentation
- **Single quotes** for strings
- **Trailing commas** for ES5 compatibility
- **LF line endings** for cross-platform compatibility

### Pre-commit Hooks

Husky runs quality checks before every commit:

1. **lint-staged** processes only staged files
2. **ESLint** checks for code issues and fixes auto-fixable problems
3. **Prettier** formats code consistently
4. Commit is blocked if checks fail

## Git Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/add-new-authentication`
- `bugfix/fix-grid-save-issue`
- `hotfix/security-patch`
- `docs/update-api-documentation`

### Commit Messages

Follow conventional commit format:

```
type(scope): description

Examples:
feat(auth): add biometric authentication support
fix(storage): resolve grid deletion bug
docs(api): update component documentation
refactor(components): extract smaller components
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** following code quality standards
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Create pull request** with clear description
6. **Address review feedback**
7. **Merge** after approval

## Testing

### Test Structure

```
PinVault/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── utils/          # Utility function tests
│   └── integration/    # Integration tests
```

### Testing Guidelines

- **Unit tests** for utility functions
- **Component tests** for React components
- **Integration tests** for user workflows
- **Mock** external dependencies
- **Aim for 80%+** test coverage

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Best Practices

### Code Organization

1. **Small, focused components** (< 200 lines)
2. **Separate concerns** (logic, UI, data)
3. **Consistent file structure**
4. **Meaningful naming conventions**

### Documentation

1. **JSDoc comments** for all functions
2. **PropTypes** for React components
3. **README updates** for new features
4. **API documentation** for utilities

### Security

1. **Authentication** for sensitive operations
2. **Input validation** and sanitization
3. **Secure storage** practices
4. **No sensitive data** in logs

### Performance

1. **Lazy loading** for large components
2. **Memoization** for expensive calculations
3. **Optimized images** and assets
4. **Bundle size** monitoring

## Troubleshooting

### Common Issues

#### ESLint Errors

```bash
# Fix auto-fixable issues
npm run lint:fix

# Check specific files
npx eslint path/to/file.js
```

#### Prettier Formatting

```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check
```

#### Pre-commit Hook Failures

```bash
# Fix all quality issues
npm run quality:fix

# Bypass hooks (not recommended)
git commit --no-verify
```

#### Development Server Issues

```bash
# Clear Metro cache
npx expo start --clear

# Reset npm cache
npm start -- --reset-cache
```

### Development Environment

#### VS Code Not Applying Settings

1. Restart VS Code
2. Check extension installation
3. Verify workspace settings in `.vscode/settings.json`

#### Git Hooks Not Working

```bash
# Reinstall husky
npm run prepare

# Check hook permissions
chmod +x .husky/pre-commit
```

### Performance Issues

#### Slow Linting

```bash
# Check ESLint cache
rm -rf .eslintcache

# Exclude large directories
# Update .eslintignore
```

## Configuration Files

### Project Structure

```
PinVault/
├── .eslintrc.js         # ESLint configuration
├── .prettierrc.js       # Prettier configuration
├── .eslintignore        # ESLint ignore rules
├── .prettierignore      # Prettier ignore rules
├── .editorconfig        # Editor configuration
├── .husky/              # Git hooks
├── .vscode/             # VS Code settings
│   ├── settings.json    # Workspace settings
│   └── extensions.json  # Recommended extensions
├── constants/           # Application constants
├── docs/               # Documentation
└── package.json        # Dependencies and scripts
```

### Environment Variables

The project doesn't use environment variables by default, but if needed:

1. Create `.env` file in project root
2. Add variables: `EXPO_PUBLIC_API_URL=https://api.example.com`
3. Access in code: `process.env.EXPO_PUBLIC_API_URL`
4. Never commit sensitive data

## Contributing

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] PropTypes are defined
- [ ] JSDoc comments are complete
- [ ] Security considerations addressed
- [ ] Performance impact considered

### Release Process

1. **Update version** in `package.json`
2. **Update changelog** with new features/fixes
3. **Create release notes**
4. **Tag release** in Git
5. **Build and test** release candidate
6. **Deploy** to app stores

---

## Support

For questions or issues:

1. **Check documentation** first
2. **Search existing issues** on GitHub
3. **Create new issue** with detailed description
4. **Include reproduction steps** and environment details

---

_This guide is for PIN Vault v1.6+. Keep it updated as the project evolves._
