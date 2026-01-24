# Contributing to BVSRadio

Thank you for your interest in contributing to BVSRadio! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BVSRadio.git
   cd BVSRadio
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/BasJunior/BVSRadio.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:
- A clear description of the enhancement
- Why this enhancement would be useful
- Possible implementation approaches

### Contributing Code

We welcome code contributions! Areas where you can help:
- Bug fixes
- New features
- Documentation improvements
- Performance improvements
- Test coverage

## Development Workflow

1. **Sync with upstream** before starting work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Make your changes**:
   - Write clean, readable code
   - Follow the coding standards
   - Add tests for new features
   - Update documentation as needed

4. **Test your changes**:
   ```bash
   # Backend tests
   cd backend
   npm test

   # Frontend tests
   cd frontend
   npm test
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/my-new-feature
   ```

7. **Create a Pull Request** on GitHub

## Coding Standards

### JavaScript/Node.js
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Database
- Use parameterized queries to prevent SQL injection
- Add indexes for frequently queried fields
- Include proper foreign key constraints
- Document schema changes

### React Components
- Use functional components with hooks
- Keep components small and reusable
- Use PropTypes or TypeScript for type checking
- Follow React best practices

## Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT authentication
fix(cart): resolve checkout calculation error
docs(readme): update installation instructions
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update the README.md** with details of changes if applicable
5. **Follow the PR template**
6. **Request review** from maintainers
7. **Address review feedback** promptly

### PR Checklist
- [ ] Code follows the project's coding standards
- [ ] Tests have been added/updated
- [ ] Documentation has been updated
- [ ] Commit messages follow the convention
- [ ] No merge conflicts
- [ ] All CI checks pass

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
- Test all affected features
- Check on different browsers (if frontend)
- Verify database migrations work correctly
- Test API endpoints with tools like Postman

## Code Review

All contributions require code review before merging:
- Be open to feedback
- Respond to comments constructively
- Make requested changes promptly
- Ask questions if something is unclear

## Questions?

If you have questions:
- Check existing issues and documentation
- Ask in the issue you're working on
- Contact the maintainers

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Our contributors page

Thank you for contributing to BVSRadio! 🎵
