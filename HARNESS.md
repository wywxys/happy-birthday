# Harness Deployment Plan

This document outlines the deployment plan and pipeline architecture for the Happy Birthday Yunbao application. It provides a comprehensive guide to our continuous integration and continuous delivery processes using Harness.

## 1. Architecture Overview

The Happy Birthday Yunbao application is a modern web-based game designed to celebrate a special occasion. It combines high-performance game rendering with a modern web framework.

### Core Technologies
- **Next.js 16 App Router**: We use Next.js 16 for the core application structure, routing, and page layout. The App Router provides efficient rendering and routing capabilities.
- **Phaser 4 Game Engine**: The interactive game canvas is powered by Phaser 4. This engine handles game physics, asset loading, animations, and user input.
- **TypeScript**: The entire codebase is written in TypeScript. This ensures type safety, reduces runtime errors, and improves developer productivity.
- **Tailwind CSS 4**: We use Tailwind CSS 4 for styling the web interface surrounding the game canvas. It provides utility-first styling with high performance.
- **Bun Package Manager**: Bun is our package manager of choice. It speeds up dependency installation, running scripts, and building the application.

### Deployment Model
The application is built as a static site. Phaser 4 game assets and Next.js pages are compiled into static HTML, CSS, and JavaScript files. No server-side runtime is required to run the game itself.

To deploy this static site reliably in a cloud environment, we package the compiled assets into a lightweight Docker container. This container uses a web server like Nginx to serve the static files. Our approach allows us to deploy the application to a Kubernetes cluster, ensuring high availability, easy scaling, and simple rollback capabilities.

---

## 2. Pipeline Architecture Diagram (ASCII DAG)

The following diagram illustrates the flow of our continuous integration and continuous delivery pipelines. Automated triggers run the CI pipeline on code changes, while the CD pipeline manages deployment across environments.

```
[Lint] ──┐
         ├──► [Build] ──► [Docker Push] ──► [Deploy Staging] ──► [Approval] ──► [Deploy Prod]
[TypeCheck] ─┘
```

The pipeline starts with parallel execution of linting and type checking. Once both stages pass, the build stage compiles the application. The built assets are then packaged into a Docker image and pushed to the registry. Finally, the CD pipeline deploys the image to staging, waits for manual approval, and deploys to production.

---

## 3. Environment Strategy

We use a multi-environment strategy to ensure that code is thoroughly tested before it reaches our users. Each environment has a specific purpose and configuration.

### Staging Environment
The staging environment is our primary preview and testing ground. It's defined in `.harness/environments/staging.yaml`.
- **Purpose**: Preview deployments, integration testing, and manual verification.
- **Trigger**: Automatically deploys whenever a pull request is merged into the `main` branch.
- **Configuration**: Targets the `staging` namespace in our Kubernetes cluster. It runs two replicas of the application to simulate a production-like environment.

### Production Environment
The production environment is where the live game is hosted for users. It's defined in `.harness/environments/production.yaml`.
- **Purpose**: Serving the live application to users.
- **Trigger**: Requires a manual approval gate in the Harness UI after a successful staging deployment.
- **Configuration**: Targets the `production` namespace in our Kubernetes cluster. It runs three replicas of the application to handle user traffic and ensure high availability.

### Feature Branches (Optional)
For active development, developers can optionally spin up ephemeral preview environments. These environments are created dynamically for individual feature branches, allowing developers to test changes in isolation before opening a pull request.

---

## 4. CI Stages Explained

Our continuous integration pipeline is defined in `.harness/pipelines/ci-pipeline.yaml`. It consists of four main stages designed to validate code quality and package the application.

### Stage 1: Lint (Biome)
- **Command**: `bun run lint`
- **Purpose**: Checks code quality, formatting, and style consistency.
- **Details**: We use Biome for fast linting and formatting. This stage enforces strict rules, such as forbidding the use of `any` types and preventing leftover `console.log` statements in production code. It runs on a Linux Amd64 container.

### Stage 2: TypeCheck
- **Command**: `bun run typecheck`
- **Purpose**: Verifies TypeScript type safety.
- **Details**: This stage runs `tsc --noEmit` to compile the TypeScript code without generating output files. It ensures that there are no type mismatches or compiler errors. Successful completion of the Lint stage is required before this stage can run.

### Stage 3: Build
- **Command**: `bun run build`
- **Purpose**: Compiles the Next.js application.
- **Details**: This stage runs the Next.js production build using Turbopack. It compiles the React components, Phaser game assets, and Tailwind styles into optimized static files. Both Lint and TypeCheck stages must pass before this stage executes.

### Stage 4: Docker Push
- **Purpose**: Packages the application into a container image.
- **Details**: Once the build succeeds, the pipeline builds a Docker image containing the static assets and Nginx configuration. It then pushes this image to our Docker registry, tagging it with the commit SHA for traceability.

---

## 5. CD Stages Explained

Our continuous delivery pipeline is defined in `.harness/pipelines/cd-pipeline.yaml`. It manages the deployment of our Docker images to Kubernetes.

### Stage 1: Deploy Staging
- **Purpose**: Deploys the application to the staging environment.
- **Details**: This stage pulls the latest Docker image from the registry and deploys it to the `staging` namespace in Kubernetes. It uses a rolling update strategy to replace old pods with new ones, ensuring zero downtime. If the deployment fails, it automatically rolls back to the previous stable version.

### Stage 2: Approval Gate
- **Purpose**: Pauses the pipeline for manual verification.
- **Details**: Before code can reach production, a manual approval is required. Harness pauses the pipeline and sends a notification. Designated release managers must review the staging deployment and approve the transition to production in the Harness UI. This gate can also be configured to send alerts to Slack or Jira.

### Stage 3: Deploy Production
- **Purpose**: Deploys the approved image to the production environment.
- **Details**: Once approved, this stage deploys the image to the `production` namespace in Kubernetes. It uses a rolling update strategy with three replicas. Automated rollback steps are included to handle failures. If the production deployment fails or health checks fail, it immediately rolls back to the last known good deployment.

---

## 6. Quality Gates

We enforce strict quality gates throughout our pipeline to maintain high standards of code quality and application stability.

### Required Gates
1. **TypeScript Strict Mode**: The TypeCheck stage must complete with zero errors. Any type mismatch or compiler warning treated as an error will fail the pipeline.
2. **Biome Lint**: The Lint stage must complete with zero errors. While formatting warnings are allowed, code quality violations will block the build.
3. **Next.js Build Success**: The Build stage must exit with code 0. Any compilation or static generation failure will halt the pipeline.

### Future Gates
We plan to introduce additional quality gates in future iterations:
- **Playwright End-to-End Tests**: Automated browser tests to verify game mechanics, UI interactions, and user flows.
- **Lighthouse Performance Audit**: Automated performance, accessibility, and SEO audits to ensure the game runs smoothly on all devices.

---

## 7. Feature Flag Strategy

We use Harness Feature Management (FME) to control application behavior dynamically without redeploying code. This is particularly useful for managing game features and themes.

### Key Feature Flags
- **Birthday Themes**: This flag allows us to switch between different character skins, backgrounds, and music tracks dynamically. We can enable special themes for the birthday celebration and revert to the default theme afterward.
- **Difficulty Presets**: This flag controls the game difficulty (easy, normal, or hard) by adjusting enemy speed, spawn rates, or player health. Players can experience different challenge levels based on real-time adjustments.
- **Victory Threshold Adjustment**: This flag dynamically changes the score required to win the game. Fine-tuning the game balance becomes simple and fast.

By using feature flags, we can safely test new features in production by enabling them only for specific users or internal testers before rolling them out to everyone.

---

## 8. Monitoring and Alerting

Monitoring is essential to ensure that the birthday celebration runs smoothly and players have a great experience.

### Performance Tracking
We track Core Web Vitals to monitor page load times, visual stability, and interactivity. This helps us identify any performance bottlenecks in the Next.js wrapper or Phaser game canvas.

### Error Tracking
We recommend integrating Sentry for real-time error tracking. Sentry captures any unhandled exceptions in the Phaser game engine or Next.js components, providing detailed stack traces and user context to help us debug issues quickly.

### Uptime Monitoring
We use Harness Service Reliability Management (SRM) or external uptime monitors to track the availability of our staging and production environments. It performs regular health checks on our endpoints.

### Alerting Channels
All pipeline events, deployment statuses, and critical alerts are sent to our `#deployments` Slack channel. This keeps the team informed of successful rollouts or any issues that require immediate attention.

---

## 9. Harness AI and Worker Agents

Harness provides several AI-powered capabilities and worker agents that help us automate and optimize our development workflow.

### CI Autofix Agent
If the Lint or TypeCheck stages fail, the CI Autofix Agent can analyze the error logs and automatically suggest or apply fixes. This saves developers time by resolving minor formatting or type issues without manual intervention.

### Code Review Agent
The Code Review Agent automatically analyzes pull requests. It checks for security vulnerabilities, code quality issues, and adherence to best practices, providing feedback directly in the pull request.

### Feature Flag Cleanup Agent
Once a feature flag is fully rolled out and no longer needed, the Feature Flag Cleanup Agent can automatically identify and remove the flag's code references, keeping our codebase clean and maintainable.

### Natural Language Pipeline Creation
We can use Harness AI to create or modify our pipelines using natural language. For example, we can ask Harness AI to "add a security scanning stage after the build stage," and it will generate the corresponding YAML configuration.

---

## 10. Connector and Secret Requirements

To run our pipelines successfully, Harness requires several connectors and secrets to interact with external services.

### Required Connectors

| Connector | Type | Purpose |
|-----------|------|---------|
| `YOUR_GITHUB_CONNECTOR` | GitHub | Accesses the source code repository to pull code and manifests. |
| `YOUR_DOCKER_CONNECTOR` | Docker Registry | Authenticates with the container registry to push and pull images. |
| `YOUR_K8S_CONNECTOR` | Kubernetes | Connects to the Kubernetes cluster to deploy the application. |

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `github_pat` | Personal Access Token for GitHub authentication. |
| `docker_token` | Authentication token for the Docker container registry. |
| `slack_webhook` | Webhook URL for sending deployment notifications to Slack. |

These secrets must be configured securely in the Harness Secret Manager and referenced in the pipeline YAML files.

---

## Troubleshooting and Common Issues

This section provides guidance on resolving common issues that may arise during pipeline execution or deployment.

### 1. Lint or TypeCheck Failures
If the Lint or TypeCheck stage fails, check the build logs in the Harness UI. Common causes include:
- Unused imports or variables.
- Missing type definitions for third-party libraries.
- Leftover `console.log` statements in production code.
You can use the CI Autofix Agent to automatically suggest fixes for these issues.

### 2. Docker Build Failures
If the Docker Push stage fails, verify that:
- The Dockerfile is present in the repository root.
- The base image is accessible from the build environment.
- All required build arguments and environment variables are correctly set.

### 3. Kubernetes Deployment Failures
If the deployment to staging or production fails, check the Kubernetes event logs. Common issues include:
- Insufficient cluster resources (CPU or memory).
- Incorrect image path or tag in the service definition.
- Missing or incorrect secrets in the target namespace.
Harness will automatically roll back the deployment to the previous stable version if health checks fail.

---

## Getting Started with Harness

To get started with this deployment plan, follow these steps:

1. **Create a Harness Project**: Log in to the Harness UI and create a new project for the Happy Birthday Yunbao application.
2. **Add Connectors**: Configure the required GitHub, Docker, and Kubernetes connectors in your project settings.
3. **Add Secrets**: Store the required secrets (GitHub PAT, Docker token, Slack webhook) in the Harness Secret Manager.
4. **Import Pipelines**: Import the pipeline configurations from `.harness/pipelines/ci-pipeline.yaml` and `.harness/pipelines/cd-pipeline.yaml` into your project.
5. **Run the Pipeline**: Trigger the CI pipeline by pushing a commit or opening a pull request to start the automated build and deployment process.

For more detailed information and advanced configurations, refer to the [Harness Documentation](https://developer.harness.io).
