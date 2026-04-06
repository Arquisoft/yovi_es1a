# Yovi_es1a - Game Y at UniOvi

[![Release — Test, Build, Publish, Deploy](https://github.com/arquisoft/yovi_es1a/actions/workflows/release-deploy.yml/badge.svg)](https://github.com/arquisoft/yovi_es1a/actions/workflows/release-deploy.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_yovi_es1a&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Arquisoft_yovi_es1a)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_yovi_es1a&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Arquisoft_yovi_es1a)
[![CodeScene Average Code Health](https://codescene.io/projects/76239/status-badges/average-code-health)](https://codescene.io/projects/76239)

This project is a complete microservices-based platform for the Game of Y, developed for the ASW labs.

# Contributors

- José Iván Díaz Potenciano UO302531.
- Adrián Gutiérrez García UO300627.
- Fernando Remis Figueroa UO302109.
- Hugo Carbajales Quintana UO300051.
- Sergio Argüelles Huerta UO299741.

# URL Deployment: https://20.199.88.71/

## Project Structure

The project follows a microservices architecture orchestrated by Docker Compose:

- `webapp/`: A Single Page Application (SPA) built with React, Vite, and TypeScript.
- `users/`: A Node.js/Express REST API for user management, MongoDB interactions, and JWT authentication.
- `multiplayer/`: A Node.js microservice handling real-time gameplay via WebSockets (Socket.io).
- `gamey/`: The core game engine and AI bot service built in Rust.
- `docs/`: Architecture documentation sources following the Arc42 template.
- `nginx.conf`: Configuration file for the API Gateway and Reverse Proxy.
- `docker-compose.yml`: Infrastructure as Code to deploy the entire stack.

## Key Features

- **Authentication & Security**: Secure user registration and login using JWT and password hashing.
- **Real-Time Multiplayer**: Play 1vs1 matches instantly against other users using WebSocket rooms.
- **Advanced AI Opponents**: Play against various bot strategies calculated natively in Rust.
- **Cloud Database**: Persistent storage for users, clans, and match history using MongoDB Atlas.
- **API Gateway**: Nginx acts as a reverse proxy, enforcing HTTPS and routing traffic securely.
- **Observability**: Built-in metrics and monitoring dashboards using Prometheus and Grafana.

## Components

### API Gateway (Nginx)
Acts as the single entry point for the application. It handles SSL/TLS termination and routes traffic based on the URL path (`/api/gamey`, `/api/bot`, `/socket.io/`, etc.) to the isolated internal Docker containers.

### Webapp
The `webapp` is the frontend client created with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/). It connects to the backend exclusively via the Nginx gateway using REST for data and WebSockets for live gameplay.

### Users Service
The `users` service handles the business logic. It connects to MongoDB Atlas to manage credentials, validates JWT tokens, and acts as a middleware to route AI requests to the Rust engine.

### Multiplayer Service
A dedicated Socket.io server that handles active game sessions. It isolates the heavy memory overhead of maintaining persistent TCP connections from the main REST API.

### Gamey (Rust Engine)
The algorithmic core built with [Rust](https://www.rust-lang.org/). It calculates winning paths using Union-Find algorithms and processes AI strategies via the YEN notation format.

---

## Running the Project

Given the microservices topology and the Nginx API Gateway, **running the project via Docker is strictly required**.

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.
- `mkcert` installed on your machine (to generate local SSL certificates).

### 1. Generate SSL Certificates
Nginx requires certificates to enable HTTPS. Create a `certs` folder in the root directory and generate them:

```bash
mkdir certs
cd certs
mkcert -install
mkcert -cert-file cert.pem -key-file key.pem localhost 127.0.0.1
cd ..
```
### 2. Environment Variables
Ensure you have a `.env` file in the `users/` and `multiplayer/` directories containing your `MONGO_URI` and `JWT_SECRET`.

### 3. Build and Run
From the root directory of the project, run:

```bash
docker-compose up -d --build
```