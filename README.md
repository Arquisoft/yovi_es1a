# Yovi_es1a - Game Y at UniOvi

[![Release — Test, Build, Publish, Deploy](https://github.com/arquisoft/yovi_es1a/actions/workflows/release-deploy.yml/badge.svg)](https://github.com/arquisoft/yovi_es1a/actions/workflows/release-deploy.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_yovi_es1a&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Arquisoft_yovi_es1a)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_yovi_es1a&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Arquisoft_yovi_es1a)
[![CodeScene Average Code Health](https://codescene.io/projects/76239/status-badges/average-code-health)](https://codescene.io/projects/76239)

This project is a complete microservices-based platform for the Game of Y, developed for the Software Architecture course (2026) at the University of Oviedo.

# URL Deployment: https://20.199.88.71/

# API Documentation: https://localhost/api-docs/api

# ENDPOINTS Documentation: https://localhost/api-docs/endpoints

# Contributors

- José Iván Díaz Potenciano UO302531.
- Adrián Gutiérrez García UO300627.
- Fernando Remis Figueroa UO302109.
- Hugo Carbajales Quintana UO300051.
- Sergio Argüelles Huerta UO299741.


## Project Structure

The project follows a microservices architecture orchestrated by Docker Compose:

- `webapp/`: A Single Page Application (SPA) built with React, Vite, and TypeScript.
- `users/`: A backend service for user management, MongoDB interactions, and JWT authentication.
- `multiplayer/`: A Node.js microservice handling real-time gameplay via WebSockets (Socket.io).
- `gamey/`: The core game engine and AI bot service built in Rust.
- `docs/`: Architecture documentation sources following the Arc42 template.
- `nginx.conf`: Configuration file for the API Gateway and Reverse Proxy.
- `docker-compose.yml`: Infrastructure as Code to deploy the entire stack.

## Components
### Webapp (`webapp/`)
The webapp is a Single-Page Application (SPA) created with **Vite**, **React**, and **TypeScript**.
- `src/main.tsx` & `src/App.tsx`: The main entry points and root components of the application.
- `src/components/` & `src/pages/`: Contains the reusable UI components and the main views of the application.
- `src/services/`: Handles external API calls and frontend logic (e.g., `auth.service.ts`).
- `src/idiomaConf/`: Configuration and context for internationalization (i18n).
- `test/`: Contains the End-to-End (E2E) tests
- `vite.config.ts`: Configuration file for the Vite bundler.
- `Dockerfile`: Defines the Docker image for serving the webapp.

### Users Service (`users/`)
A Node.js REST API built with **Express** and **TypeScript**, managing users, matches, and authentication.
- `src/index.ts`: The main entry point that initializes the Express server and routes.
- `src/database.ts`: Handles the connection to the MongoDB database.
- `src/controller/`: Contains Express route handlers (e.g., `user-controller.ts`, `match-controller.ts`).
- `src/service/`: Encapsulates the core business logic (e.g., `user-service.ts`) separated from the HTTP layer.
- `src/models/`: Defines the Mongoose schemas for the database entities.
- `src/middleware/auth-middleware.ts`: Intercepts requests to verify JWT tokens.
- `Dockerfile`: Defines the Docker image for the users microservice.

### Multiplayer Service (`multiplayer/`)
A real-time Node.js microservice using **Socket.io** to handle live gameplay and rooms.
- `src/index.ts`: Initializes the WebSocket server and core event listeners.
- `src/handlers/`: Contains the WebSocket event handlers (e.g., `room.handler.ts`) for real-time communication.
- `src/services/`: Manages the state and logic of active rooms and clans (`room.service.ts`).
- `__test__/`: Contains unit tests for the multiplayer logic using Vitest.
- `Dockerfile`: Defines the Docker image for the multiplayer microservice.

### Game Engine & AI (`gamey/`)
The core game engine and bot server built in **Rust** using the **Axum** framework.
- `src/main.rs`: The entry point for the Axum HTTP server.
- `src/lib.rs`: The root of the Rust library, exposing core game modules.
- `src/core/` & `src/notation/`: Handles the game rules, board state, and YEN string parsing.
- `src/bot/` & `src/bot_server/`: Contains the AI implementations (e.g., Monte Carlo) and the HTTP API endpoints to request moves.
- `Cargo.toml`: The Rust package manager manifest, listing dependencies.
- `Dockerfile`: Defines the Docker image for compiling and running the Rust server.

## Getting Started
You can run this project using Docker (recommended for a seamless setup) or locally without Docker for active development.
### With Docker
This is the easiest way to get the entire microservices ecosystem running together. You need to have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.
1. **Build and run the containers:** From the root directory of the project, run:
   ```bash
   docker-compose up --build
   ```
This command will build the Docker images for the webapp, users, multiplayer, gamey services, and the Nginx proxy, then start them all.
Access the application:

2. Access the application:
	- Web application: http://localhost (Served via Nginx)
	- User service API: http://localhost:3000
	- Gamey API: http://localhost:4000
	(Note: Ensure no local services are already using these ports before running Compose).
	
### Without Docker (Local Development)
To run the project locally without Docker, you will need to open separate terminal windows for each component.
Prerequisites: Node.js, npm, and Rust/Cargo installed on your machine.
1. Running the User Service
Navigate to the users directory:
```bash
	cd users
	npm install
	npm start
```
The user service will be available at http://localhost:3000.

2. Running the Multiplayer Service
Navigate to the multiplayer directory:
```bash
cd multiplayer
npm install
npm start
```
The WebSocket service will start listening for real-time game connections.

3. Running the GameY Engine
Navigate to the gamey directory:
```bash
cd gamey
```
You can run the game engine in two modes:
	- Interactive mode (play in terminal): cargo run
	- Server mode (API for Web App and external bots): cargo run -- --mode server --port 4000
	The Game Engine API will be available at http://localhost:4000.
	
4. Running the Web Application
Navigate to the webapp directory:
```bash
	cd webapp
	npm install
	npm run dev
```
The web application will be available at http://localhost:5173.

## Security & API Gateway (Nginx)
This project uses **Nginx** as a Reverse Proxy and API Gateway, acting as the single public entry point for the entire ecosystem.
All traffic is managed through ports `80` and `443`, with HTTP traffic automatically redirected to HTTPS. It handles SSL/TLS termination and intelligently routes requests to the isolated internal microservices.
### Routing Strategy
| Path | Target Service | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| `/api/gamey/*` | `gamey` | `4000` | Rust Core Game Engine & API |
| `/api/bot/*` | `users` | `3000` | AI Bot Engine endpoints |
| `/api/matches/*` | `users` | `3000` | Match history and management |
| `/api/clans/*` | `users` | `3000` | Clan creation and management |
| `/api/*` | `users` | `3000` | Core User API (Auth, Profiles) |
| `/api-docs` | `users` | `3000` | OpenAPI / Swagger Documentation |
| `/socket.io/*` | `multiplayer` | `5000` | Real-time WebSocket connections |
| `/*` | `webapp` | `80` | React/Vite SPA Frontend |

###Key Gateway Features
- **HTTP to HTTPS Redirection:** Port 80 strictly returns a `301` redirect to secure all incoming traffic.
- **WebSocket Support:** Native configuration for `Upgrade` and `Connection` headers to perfectly support real-time bidirectional communication via Socket.io.
- **Internal Isolation:** Microservices (Ports 3000, 4000, 5000) are not exposed directly to the host network; all external access must pass through the Nginx Gateway.
- **Local Certificates:** For local development, self-signed certificates (`cert.pem`, `key.pem`) are utilized to mimic production-level HTTPS environments.

## Available Scripts
Each component has its own set of scripts defined in its package.json or Cargo.toml. Here are the most important ones:
### Webapp (webapp/package.json)
	- npm run dev: Starts the Vite development server.
	- npm test: Runs the unit tests using Vitest.
	- npm run test:e2e:run: Executes the End-to-End tests using Playwright and Cucumber.
	- npm run start:all: A convenience script to start the webapp, users, and gamey services concurrently.
 
### Users (users/package.json)
	- npm start: Starts the Express user service.
	- npm test: Runs the unit tests for the authentication and user logic.

### Multiplayer (multiplayer/package.json)
	- npm start: Starts the Socket.io multiplayer service.
	- npm test: Runs the tests for room and clan handlers.
### Gamey (gamey/Cargo.toml)
	- cargo build: Compiles the Rust application.
	- cargo test: Runs the Rust unit and integration tests.
	- cargo run: Runs the GameY application in standard interactive mode.
	- cargo run -- --mode server --port 4000: Runs the GameY bot server API.
	- cargo doc --open: Generates and opens the HTML documentation for the GameY engine.