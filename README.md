# RentGuard 360

A cloud-native platform that helps Israeli renters understand and negotiate lease agreements using AI-powered analysis.

Upload a PDF contract, get a risk score, clause-by-clause explanations, and actionable negotiation suggestions—all without running servers.

---

## The Problem

Reading a rental contract is stressful: legal jargon, hidden risks, and no clear guidance on what to negotiate. **RentGuard 360** transforms complex leases into structured, actionable insights.

---

## What It Does

- **PDF Upload** — Secure upload to S3 using presigned URLs
- **Text Extraction** — Azure Document Intelligence (OCR)
- **Privacy Protection** — PII redaction before AI processing
- **AI Analysis** — Amazon Bedrock (Claude) for legal analysis
- **Risk Scoring** — Issue breakdown with severity levels
- **Recommendations** — Suggested contract modifications
- **Admin Dashboard** — User management and system statistics

---

## Architecture Overview

```
User → CloudFront → S3 (Frontend)
                 ↘ API Gateway → Lambda Functions
                                        ↓
PDF Upload → S3 → EventBridge → Step Functions
                                      ↓
                    ┌─────────────────┼─────────────────┐
                    ↓                 ↓                 ↓
              Azure OCR      Privacy Shield      AI Analyzer
                                                      ↓
                                               DynamoDB → SES
```

**Full serverless** — Lambda, Step Functions, API Gateway, DynamoDB, S3, Cognito, CloudFront, WAF.

---

## Tech Stack

**Frontend:** React 19, Vite, React Router, TanStack Query, MUI X Charts, Framer Motion, AWS Amplify Auth

**Backend:** Python 3.11 Lambdas, API Gateway (REST), Step Functions, DynamoDB, S3, Cognito, CloudFront + WAF, SES

**External:** Azure Document Intelligence (OCR), Amazon Bedrock (Claude AI)

---

## Project Structure

```
frontend/          React application (Vite)
backend/
  lambdas/         Python Lambda handlers
  api-gateway/     OpenAPI specification
  step-functions/  Workflow definition
infrastructure/
  cloudformation.yaml   Full IaC template (1500+ lines)
  deploy-cloudshell.sh  Deployment script
docs/              API documentation
```

---

## Deployment

The entire infrastructure deploys via a single CloudFormation template.

```bash
# AWS CloudShell
unzip RentGuard360-Deployment.zip
cd infrastructure
cp config.env.template config.env
# Edit config.env with your Azure keys and SES email
./deploy-cloudshell.sh
```

Supports **multi-stack isolation** — deploy separate test environments in the same AWS account using `NAME_SUFFIX`.

Full instructions: [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md)

---

## Security

- JWT authentication via Cognito
- WAF protection (SQLi, XSS, rate limiting)
- S3 encryption at rest
- PII redaction before AI processing
- Time-limited presigned URLs
- No secrets in repository

---

## Team

**Ron Blanki** · **Moty Sakhartov** · **Dan Gutman**

Cloud Computing Course Project, 2026

---

## License

Academic project. Contact the team for usage inquiries.
