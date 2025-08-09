# Implementation Plan

- [x] 1. Set up project foundation and dependencies
  - Initialize Next.js 15 project with TypeScript and App Router
  - Install and configure Tailwind CSS, shadcn/ui, React Query, and Neon database client
  - Install Drizzle ORM and Drizzle Kit for database operations
  - Set up basic project structure with folders for components, lib, and API routes
  - _Requirements: 5.1, 6.2_

- [x] 2. Configure Neon database schema and data loading
  - Set up Neon database connection and configure Drizzle ORM
  - Create Drizzle schema definitions for products and companies tables
  - Generate and apply database migrations using Drizzle Kit
  - Update parse_and_load script to use Drizzle ORM instead of Supabase client
  - Load CSV data into database using updated Drizzle-based script
  - Set up PostgreSQL full-text search indexes for product names and notification numbers
  - _Requirements: 5.1, 5.2_

- [x] 3. Implement core data models and validation
  - Create Product interface with ProductStatus and RiskLevel enums
  - Implement Zod schemas for runtime validation of search queries and products
  - Create utility functions for data transformation and validation
  - _Requirements: 5.6, 1.2, 1.6_

- [x] 4. Add Zod validation schemas
  - Install Zod for runtime validation
  - Create validation schemas for search queries, products, and API responses
  - Add input sanitization and error handling utilities
  - _Requirements: 1.2, 1.6, 5.6_

- [x] 5. Build search API endpoint
  - Create /api/products/search route with proper error handling
  - Implement full-text search query using Drizzle ORM against Neon products table
  - Add input validation using Zod schemas with proper error responses
  - Write unit tests for API endpoint functionality
  - _Requirements: 1.1, 1.3, 1.4, 5.2, 5.3_

- [x] 6. Create alternatives API endpoint
  - Implement /api/products/alternatives route for safer product suggestions
  - Add logic to randomly select 3+ approved products excluding current product
  - Handle cases where no alternatives are found with appropriate responses
  - Write unit tests for alternatives endpoint
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 7. Implement core UI components with shadcn/ui
  - Create RiskIndicator component with color-coded safety status display
  - Build ProductCard component to display individual product information
  - Create LoadingSpinner and ErrorMessage components for user feedback
  - Add proper accessibility attributes and ARIA labels
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 7.1_

- [x] 8. Build search input component with validation
  - Create SearchInput component with real-time validation
  - Implement minimum 3-character validation with user-friendly error messages
  - Add debouncing to prevent excessive API calls during typing
  - Write component tests for validation behavior
  - _Requirements: 1.2, 1.6, 6.3_

- [x] 9. Implement search results display
  - Create SearchResults component to display product list with risk indicators
  - Implement empty state handling for "No products found" scenarios
  - Add proper loading states with skeleton screens during search
  - Write component tests for different result states
  - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 6.4_

- [x] 10. Build product details and cancellation reasons
  - Create ProductDetails component for expandable product information
  - Implement display of cancellation reasons with fallback for missing data
  - Add proper formatting for user-friendly cancellation reason display
  - Write tests for product details rendering
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 11. Implement safer alternatives section
  - Create AlternativesSection component for displaying safer product options
  - Integrate with alternatives API to fetch and display alternative products
  - Handle empty alternatives state with "No safer alternatives found" message
  - Add click handling to view alternative product details
  - Write component tests for alternatives display
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 12. Integrate React Query for state management
  - Set up React Query client with proper configuration
  - Create custom hooks for product search and alternatives fetching
  - Implement proper error handling and retry logic in queries
  - Add loading and error states management through React Query
  - _Requirements: 5.3, 5.4, 6.1_

- [x] 13. Build main search interface page
  - Create main page component that combines SearchInput and SearchResults
  - Implement proper layout with header and responsive design
  - Add error boundary for graceful error handling
  - Ensure proper accessibility with ARIA labels and semantic HTML
  - _Requirements: 6.5, 7.1, 7.2, 7.3, 7.6_

- [x] 14. Add comprehensive error handling
  - Implement error boundaries for React components
  - Add proper error messages for different failure scenarios
  - Create user-friendly error displays with recovery options
  - Write tests for error handling scenarios
  - _Requirements: 2.5, 3.5, 5.4, 5.6_

- [x] 15. Implement responsive design and accessibility
  - Ensure mobile-responsive layout using Tailwind CSS breakpoints
  - Add proper ARIA labels, roles, and semantic HTML structure
  - Implement keyboard navigation support for all interactive elements
  - Validate color contrast meets WCAG AA standards
  - _Requirements: 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 16. Write comprehensive component tests
  - Create unit tests for all React components using React Testing Library
  - Test user interactions, validation, and error states
  - Add integration tests for component interactions with React Query
  - Ensure test coverage for accessibility features
  - _Requirements: All requirements validation through testing_

- [x] 17. Final integration and deployment setup
  - Wire all components together in the main application
  - Configure environment variables for production deployment
  - Set up Vercel deployment configuration
  - Perform final testing of complete user workflows
  - _Requirements: 5.1, 6.1, 6.2_
