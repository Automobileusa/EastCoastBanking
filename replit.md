# East Coast Credit Union Banking Application

## Overview

This is a full-stack Canadian credit union banking application built with React, Express.js, and PostgreSQL. The application provides secure online banking features including account management, transactions, bill payments, cheque ordering, and external account linking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming and East Coast Credit Union branding
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite with TypeScript support and path aliases

### Backend Architecture

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Express sessions with PostgreSQL session store using connect-pg-simple
- **Password Security**: bcrypt for password hashing
- **Email Service**: Nodemailer with Gmail SMTP for OTP delivery
- **Validation**: Zod schemas for API request/response validation

## Key Components

### Authentication System

- **Session-based Authentication**: Uses express-session with persistent storage in PostgreSQL
- **Two-Factor Authentication**: OTP codes sent via email for secure operations
- **Password Security**: bcrypt hashing with salt rounds for secure password storage
- **Session Management**: Automatic session cleanup and expiration handling

### Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **Users**: Customer information, credentials, and account status
- **Accounts**: Multiple account types (chequing, savings, TFSA, term deposits) with balances
- **Transactions**: Complete transaction history with categorization and reference numbers
- **OTP Codes**: Time-limited verification codes for secure operations
- **Bill Payments**: Bill payment records with status tracking
- **Cheque Orders**: Cheque order management with delivery options
- **External Accounts**: External bank account linking with verification
- **Sessions**: Secure session storage for user authentication

### Banking Features

- **Account Dashboard**: Real-time balance display with transaction summaries
- **Transaction History**: Filterable and searchable transaction lists with pagination
- **Bill Payments**: Secure bill payment system with predefined payees and OTP verification
- **Cheque Orders**: Online cheque ordering with style selection and delivery options
- **External Account Linking**: Add external bank accounts with micro-deposit verification
- **Account Management**: View multiple account types with detailed information

## Data Flow

1. **Authentication Flow**: User login → OTP verification via email → session creation
2. **Banking Operations**: Authenticated requests → OTP verification for sensitive operations → database updates
3. **Real-time Updates**: TanStack Query provides automatic cache invalidation and refetching
4. **Email Notifications**: Automatic OTP delivery via Nodemailer for security operations

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect

### Authentication & Security
- **bcrypt**: Password hashing
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Email Service
- **Nodemailer**: Email delivery for OTP codes using Gmail SMTP

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Wouter**: Lightweight routing

## Deployment Strategy

### Development
- **Development Server**: Vite dev server for frontend with HMR
- **Backend Server**: tsx for TypeScript execution in development
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Assets**: Frontend assets served from Express in production
- **Database**: Drizzle Kit push for schema deployment

### Environment Configuration
- **DATABASE_URL**: Required PostgreSQL connection string
- **SESSION_SECRET**: Secret key for session encryption
- **Email Credentials**: Gmail SMTP configuration for OTP delivery

The application follows a monorepo structure with shared TypeScript types between frontend and backend, ensuring type safety across the entire stack. The modular architecture allows for easy feature expansion and maintenance.