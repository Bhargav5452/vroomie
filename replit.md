# Overview

Vroomie is a student-exclusive ride-sharing mobile web application designed specifically for college students. The platform allows students to offer and find rides between colleges, local areas, and transportation hubs. It features a gamification system with "Vroomie Points", carbon footprint tracking, and buddy matching based on college, branch, and year to enhance the social aspect of ride sharing.

## Recent Changes (December 2024)

✓ **Complete Application Built and Deployed**
- Implemented full-stack ride-sharing platform with React + TypeScript frontend
- Set up Express.js backend with PostgreSQL database using Drizzle ORM
- Integrated Replit authentication system for student verification
- Created responsive mobile-first design with Tailwind CSS and Shadcn/UI components

✓ **Core Features Implemented**
- Landing page with student verification and beautiful UI
- Dashboard with eco impact tracking and quick action cards
- Offer ride functionality with location selection, pricing, and recurring options
- Find ride feature with buddy matching algorithm based on college/branch/year
- Booking management system for both passengers and drivers
- Gamified leaderboard with points system and weekly rewards
- User profile with statistics, navigation, and settings

✓ **Database Schema Complete**
- Users table with college, year, branch, points, and carbon savings tracking
- Rides table with locations, timing, pricing, and carbon calculations
- Bookings table for managing ride requests and confirmations
- Notifications table for real-time updates and messaging
- Session storage for authentication persistence

✓ **Authentication & Security**
- Replit OpenID Connect integration for student identity verification
- Session management with PostgreSQL storage
- Protected routes and middleware for secure API access
- Buddy matching algorithm for enhanced safety and social connections

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design system including color variables and component styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Mobile-First Design**: Responsive design optimized for mobile devices with a bottom navigation pattern

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for development server with hot reloading
- **Authentication**: OpenID Connect (OIDC) integration with Replit authentication system
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful API with structured route handlers and error handling middleware

## Data Storage Architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Validation**: Zod schemas for runtime type validation and API request/response validation

## Database Schema Design
- **Users**: Stores student profiles with college, year, branch, points, and carbon savings
- **Rides**: Contains ride offers with pickup/destination locations, timing, and pricing
- **Bookings**: Manages ride requests and passenger-driver relationships
- **Notifications**: Handles in-app messaging and ride status updates
- **Sessions**: Stores user session data for authentication persistence

## Authentication & Authorization
- **Provider**: Replit OpenID Connect for student identity verification
- **Session Storage**: PostgreSQL-backed sessions with automatic cleanup
- **Security**: HTTP-only cookies with secure flags and CSRF protection
- **User Management**: Automatic user profile creation and updates from OIDC claims

## Key Features Architecture
- **Ride Matching**: Location-based search with real-time availability
- **Buddy System**: Algorithm for matching students based on college, branch, and year
- **Gamification**: Point system for ride completion and carbon savings tracking
- **Leaderboard**: Ranking system based on user points and environmental impact
- **Mobile Navigation**: Bottom tab navigation for core user journeys

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database for data persistence
- **Authentication**: Replit OpenID Connect service for student verification
- **Hosting**: Replit platform for application deployment and development environment

## UI & Styling
- **Component Library**: Radix UI for accessible, unstyled UI primitives
- **Design System**: Shadcn/UI for pre-styled components with consistent theming
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)

## State Management & API
- **Data Fetching**: TanStack React Query for server state management and caching
- **Form Validation**: Zod for schema validation and type safety
- **HTTP Client**: Native fetch API with custom wrapper for API requests

## Development Tools
- **Build Tool**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript for static type analysis
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Code Quality**: ESLint configuration for code standards

## Runtime Dependencies
- **ORM**: Drizzle ORM for type-safe database operations
- **Date Handling**: date-fns for date manipulation and formatting
- **Utilities**: clsx and class-variance-authority for conditional styling
- **Session Management**: connect-pg-simple for PostgreSQL session storage