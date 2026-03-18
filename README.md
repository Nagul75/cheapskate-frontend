# Cheapskate Frontend

Frontend for **Cheapskate**, a modern personal finance tracking application with a focus on performance, usability, and real-time analytics.

![MacBook_Pro_Cheapskate](https://github.com/user-attachments/assets/e5043526-6f9c-4ee5-8665-a940b6ac55a7)

## Overview

A responsive and performance-optimized React application enabling users to manage finances and visualize spending patterns through interactive dashboards.

## Tech Stack

- React (Vite)
- TypeScript
- shadcn/ui
- React Query
- Axios
- React Hook Form + Zod
- Recharts

## Features

- **Authentication**
  - Secure login/register flow
  - Token-based session management
  - Protected routes

- **Dashboard & Analytics**
  - Summary cards (income, expenses, net)
  - Category-wise spending visualization
  - Time-series financial trends

- **Transactions**
  - Filtering, sorting, and pagination
  - Create, edit, and delete
  - CSV export

- **Budgets**
  - Budget tracking with progress indicators
  - Create, edit, delete with optimistic updates
  - Integrated with transactions and budgets
 
- **Accounts**
  - Net worth tracking across accounts
  - Multi-currency support integrated across the app
  - Create, edit, and delete

- **UX Enhancements**
  - Intuitive empty states and onboarding flows
  - Skeleton loaders
  - Optimistic UI updates
  - Fully responsive layout
  - Light/Dark mode

## Performance

- 100/100 Lighthouse score (Landing Page)
- 96/100 Lighthouse score (Dashboard)
- Reduced bundle size from **1.7MB → <500KB (~70% reduction)**

## Architecture Highlights

- Centralized API layer with Axios interceptors
- Automatic token refresh handling
- Server-state management via React Query
- Form validation with Zod + react-hook-form

## Deployment

- AWS S3 (Static Hosting)
- AWS CloudFront (CDN)

## Notes

- Designed for high responsiveness and smooth user experience
- Handles large datasets efficiently with optimized rendering
