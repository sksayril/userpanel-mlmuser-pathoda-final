# Routing Guide

This document outlines the routing structure implemented in the MLM User Panel application.

## Route Structure

### Public Routes
- `/login` - User login page
- `/signup` - User registration page

### Protected Routes
- `/` - Redirects to `/dashboard`
- `/dashboard` - Main dashboard page
- `/network` - My Network page
- `/levels` - My Levels page
- `/trade` - Trade page
- `/profile` - User profile page

### Catch-all Route
- `*` - Any undefined route redirects to `/dashboard`

## Navigation Flow

1. **Unauthenticated Users**: Redirected to `/login`
2. **Login Success**: Redirected to `/dashboard`
3. **Signup Success**: Redirected to `/dashboard`
4. **Logout**: Redirected to `/login`
5. **Direct URL Access**: Protected routes require authentication

## Components

### Core Routing Components
- `App.tsx` - Main router configuration
- `ProtectedRoute.tsx` - Wrapper for authenticated routes
- `Layout.tsx` - Layout wrapper with sidebar/navigation
- `Login.tsx` - Login page component
- `Signup.tsx` - Signup page component

### Navigation Components
- `Sidebar.tsx` - Desktop navigation
- `BottomNavigation.tsx` - Mobile navigation
- `LoginForm.tsx` - Shared login/signup form

## Features

- **Automatic Redirects**: Users are automatically redirected based on authentication status
- **Protected Routes**: All main app routes require authentication
- **Responsive Navigation**: Different navigation for desktop and mobile
- **URL-based Navigation**: Direct URL access works correctly
- **State Persistence**: Authentication state persists across page refreshes

## Usage

The routing system is fully integrated with the authentication context and provides seamless navigation throughout the application. Users can navigate using the sidebar (desktop) or bottom navigation (mobile), and all routes are properly protected and accessible.
