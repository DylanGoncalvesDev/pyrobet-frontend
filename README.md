PyroBet
A Premium Decoupled Sports Prediction Platform

PyroBet is a modern sports prediction platform where users can predict match outcomes, earn points, and compete in a global leaderboard.

Built with a decoupled architecture, PyroBet combines a React frontend with a Laravel REST API to deliver a responsive and interactive experience.

Tech Stack
Frontend
React — Component-based user interface.
Vite — Frontend development and build tooling.
Axios — HTTP client for API communication.
React Router — Client-side navigation and protected routes.
CSS Variables — Centralized design system with Light and Dark themes.
Backend
Laravel — RESTful API and application logic.
Laravel Passport — OAuth2 authentication using Bearer tokens.
Swagger UI / OpenAPI — API documentation and endpoint testing.
Relational Database — Persistent storage for application data.
Core Features
Public / Guest
Browse available matches and fixtures.
View match schedules, teams, and competitions.
Check match statuses and results.
Explore platform rules.
Access registration and login.
Registered Users
Create an account and authenticate securely.
Submit match outcome predictions.
Predict exact match scores.
View personal prediction history.
Edit or delete eligible pending predictions.
Track earned points.
Compete in the global leaderboard.
Access personal profile information.
Admin Panel
Centralized administration dashboard.
Overview of platform statistics.
Monitor users, matches, teams, and competitions.
Create, edit, and delete matches.
Manage teams and their logos.
Upload team logo image files.
Create, edit, and delete competitions.
Monitor prediction counts for individual matches.
Architecture

PyroBet follows a decoupled architecture:

Frontend: React single-page application.
Backend: Laravel REST API.
Authentication: OAuth2 Bearer token authentication through Laravel Passport.
Communication: HTTP requests using Axios.
API Documentation: OpenAPI specifications available through Swagger UI.

The frontend and backend are maintained as separate applications and communicate through the REST API.

Git Workflow

Development follows the GitFlow branching model.

Main branches:

main — Stable production-ready code.
develop — Integration branch for ongoing development.
feature/* — New features and functionality.
fix/* — Bug fixes.

Commit messages follow the Conventional Commits specification.

Examples:

feat(admin): add administration dashboard
feat(auth): implement authentication flow
fix(matches): correct match editing behavior
refactor(api): improve service structure
docs(readme): update project documentation
Installation & Setup
Prerequisites

Make sure you have the following installed:

PHP
Composer
Node.js
npm
A configured database
1. Backend Setup

Navigate to the Laravel API directory:

cd pyrobet-api

Install PHP dependencies:

composer install

Create the environment file:

copy .env.example .env

Generate the application key:

php artisan key:generate

Configure your database credentials in .env.

Run database migrations:

php artisan migrate

Create the public storage symbolic link:

php artisan storage:link

Generate the API documentation:

php artisan l5-swagger:generate

Start the Laravel development server:

php artisan serve

The API will be available at:

http://localhost:8000

Swagger documentation:

http://localhost:8000/api/documentation
2. Frontend Setup

Open another terminal and navigate to the React project:

cd pyrobet-frontend

Install dependencies:

npm install

Create a .env.local file in the frontend root directory:

VITE_API_BASE_URL=http://localhost:8000/api

Start the Vite development server:

npm run dev

Vite will display the local development URL in the terminal.

Project Goals

PyroBet aims to provide a modern sports prediction experience through a clean interface, secure authentication, centralized administration, and a competitive points-based ranking system.

Predict matches. Earn points. Compete globally.
