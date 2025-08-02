# Salary Management System

## Overview

This is a comprehensive salary management system built as a full-stack web application for managing employee salaries, attendance tracking, and payroll calculations. The system provides a complete solution for HR departments to handle employee data, track daily attendance, calculate salaries with deductions (ESI, PF), and export payroll data to Excel format. The interface is designed with Hindi language support for better accessibility in the Indian market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API development
- **Language**: TypeScript throughout the entire stack for consistency and type safety
- **API Design**: RESTful endpoints following standard HTTP conventions
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request/response logging and performance monitoring

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Management**: Shared schema definitions between frontend and backend
- **Validation**: Zod schemas for runtime type validation and data integrity
- **Fallback Storage**: In-memory storage implementation for development and testing

### Database Schema Design
- **Employees Table**: Stores employee information (name, position, salary components, attendance records)
- **Salary Sheets Table**: Stores monthly payroll data with calculated totals
- **JSON Fields**: Flexible storage for attendance arrays and employee data collections
- **UUID Primary Keys**: Using PostgreSQL's gen_random_uuid() for unique identifiers

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Storage**: Session-based approach prepared with connect-pg-simple for PostgreSQL session storage
- **Security**: Basic security headers and input validation in place

### Data Processing Features
- **Attendance Tracking**: Support for multiple attendance codes (P=Present, A=Absent, H=Half day, PP=Double shift)
- **Salary Calculations**: Automated calculation of gross salary, ESI (1.75%), PF (12%), and net salary
- **Export Functionality**: CSV/Excel export capability for payroll data with Hindi headers
- **Real-time Updates**: Optimistic updates with automatic cache invalidation

### UI/UX Design Patterns
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Architecture**: Modular component structure with reusable UI elements
- **Accessibility**: Full ARIA support through Radix UI primitives
- **Internationalization**: Hindi language support for Indian market requirements
- **Dark Mode**: Theme system prepared with CSS custom properties

### Development Workflow
- **Type Safety**: End-to-end TypeScript with shared types between client and server
- **Hot Reload**: Vite HMR for frontend and tsx for backend development
- **Build Process**: Separate build steps for client (Vite) and server (esbuild)
- **Path Aliases**: Configured import aliases for cleaner code organization

## External Dependencies

### Database Integration
- **Neon Database**: Serverless PostgreSQL database using @neondatabase/serverless driver
- **Drizzle Kit**: Database migration and schema management tools
- **Connection Pooling**: Built-in connection pooling through Neon's serverless driver

### UI Component Libraries
- **Radix UI**: Complete set of accessible, unstyled UI primitives including dialogs, dropdowns, forms, and navigation components
- **Lucide React**: Comprehensive icon library for consistent visual elements
- **Embla Carousel**: Carousel/slider functionality for enhanced user experience

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment including error overlays and cartographer for debugging
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **Class Variance Authority**: Utility for creating type-safe component variants
- **CLSX**: Utility for conditional CSS class composition

### Form and Validation
- **React Hook Form**: Performance-optimized form library with minimal re-renders
- **Hookform Resolvers**: Integration layer for validation libraries
- **Zod**: Schema validation library for runtime type checking and form validation
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for consistent validation

### Utility Libraries
- **Date-fns**: Modern date utility library for date formatting and manipulation
- **Nanoid**: Unique ID generation for client-side operations
- **CMDK**: Command palette component for enhanced user interactions

### Session Management
- **Connect PG Simple**: PostgreSQL session store for Express sessions (prepared for future authentication)