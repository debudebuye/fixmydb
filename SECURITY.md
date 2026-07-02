# Security Policy

## Reporting a Vulnerability

FixMyDB is an open source schema analysis tool. We take security seriously.

If you discover a security vulnerability, please **do not** open a public issue.
Instead, report it privately via email or GitHub's private vulnerability reporting.

### How to Report

1. **GitHub**: Use the [Security Advisory](https://github.com/debudebuye/fixmydb/security/advisories/new) feature
2. **Email**: Reach out to the repository owner through GitHub

### What to Include

- Description of the vulnerability
- Steps to reproduce (proof of concept)
- Affected versions
- Potential impact
- Any suggested fix (if available)

### Response Timeline

- **Acknowledgment**: within 48 hours
- **Initial assessment**: within 5 business days
- **Fix released**: depends on severity, typically within 14 days

## Security Considerations for This Project

### API Key Safety

- Frontend never stores or exposes API keys in client code
- Backend API keys are read from environment variables only
- Never commit `.env` files to the repository

### Input Handling

- SQL input is parsed server-side with strict error handling
- File uploads are limited to 10MB and specific extensions (.sql, .txt, .json)
- Uploaded files are deleted after analysis completes

### CSP Policy

The frontend applies a Content-Security-Policy meta tag restricting script sources
to trusted origins. If you modify the CSP, ensure it remains restrictive enough
to prevent XSS attacks while allowing Monaco Editor to function.
