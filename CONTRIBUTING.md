# Contributing to Harmoni

Thank you for considering contributing to Harmoni! This document will guide you through the contribution process.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (to be added).

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

- Use the bug report template when creating an issue.
- Be clear and descriptive in your report.
- Include as much information as possible.

### Suggesting Features

This section guides you through submitting a feature suggestion.

- Use the feature request template when creating an issue.
- Provide a clear and detailed explanation of the feature.
- Explain why this feature would be useful to most Harmoni users.

### Pull Requests

- Fill in the required template.
- Do not include issue numbers in the PR title.
- Include screenshots and animated GIFs in your pull request whenever possible.
- Follow the coding style used throughout the project.
- Include thorough tests.
- Document new code.
- End all files with a newline.

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.

### JavaScript/TypeScript Styleguide

- Use 2 spaces for indentation.
- Use semicolons.
- Prefer `const` over `let`. Do not use `var`.
- Place imports in the following order:
  - External packages (React, etc.)
  - Internal modules
  - Styles
- Use PascalCase for components and camelCase for instances.
- Use meaningful variable names.

### CSS Styleguide

- Use 2 spaces for indentation.
- Use kebab-case for class names.
- Use semantic class names.
- Use comments to separate logical sections.

## Development Process

1. Fork the repository.
2. Create a new branch from `main`.
3. Make your changes.
4. Run tests to ensure they pass.
5. Submit a pull request.

## Testing Guidelines

Harmoni uses Vitest and React Testing Library for testing. Please follow these guidelines when writing tests:

### Component Tests

- Focus on testing behavior rather than implementation details
- Use React Testing Library's queries (getBy, queryBy, findBy) to locate elements
- Test user interactions with fireEvent or userEvent
- Mock external dependencies (services, hooks) when necessary

### Audio-Related Tests

- Properly mock the Web Audio API when testing audio-related functionality
- Use vi.useFakeTimers() when testing timeout or interval-based functionality
- For complex async behavior, use await and waitFor appropriately

### Test Structure

- Arrange: Set up the component or function with the necessary props and mocks
- Act: Perform the action being tested
- Assert: Verify the expected outcome

### Running Tests

- Before submitting a PR, ensure all tests pass by running `npm test`
- If you add new functionality, also add appropriate tests
- See TESTING.md for more detailed information about the testing framework

Thank you for contributing!