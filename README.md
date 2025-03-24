# SocialMediaDetox (https://www.dopaminedetoxtoday.com/)

A site to help a user curb their Social Media use by providing content from YouTube and Twitter/X based on Topics, SubTopics, and Channels. The content is refreshed weekly (can be updated to be more frequent) and helps the user avoid visiting YouTube or Twitter/X and sliding down the doom scroll scenario.

A user also can make notes and save the result so that an email will be generated at the end of the week with the links to that video/post with notes and then cleared for new content.

This is the front end project using Angular 17 with angular bootrap for styling for the Social Media Detox site. In order to run, the Social Media Detox API (https://github.com/rroethle7474/DopamineDetoxAPI) needs to be running locally as well to access the records to display for YouTube and Twitter.

SignalR is used (@microsoft/signalr) to receive messages when new results are received. In order to connect to this service, there is a seperate Azure Functions Project (https://github.com/rroethle7474/DopamineDetoxFunction) where the url's are accessible.

# Database (https://github.com/rroethle7474/ProjectDb)
In github, a combined database with other projects is being used (and hosted within Azure) to save on costs.
The db's for the Social Media Detox project are al the tables located underneath dbo.Tables (https://github.com/rroethle7474/ProjectDb/tree/main/dbo/Tables)
It uses Identity to handle user's with two roles (Admin and Demo (unused)). Admin allows for setting up content types and default topics. The demo role has yet to be implemented.

# Login/Users
Users can register using a unique username and password or by using their google gmail account.
There is a demo account that can be used as well to see functionality found underneath the Login/Register dropdown.
There is basic functionality associated with changing passwords, username, and roles. Each user can have specific topics, subtopics, and channels associated with them.

# Daily Quotes
Each week (or whenever the azure function is ran) a new quote and image should be generated on the landing page for inspiration.

# Topics/SubTopics/Channels
More details will follow but each sub-topic needs a topic for organization. A general topic will be used for search in both YouTube and Twitter/X, and then any associated sub-topics. There is no limit currently to how many (but in the future there will be do to the daily limit of using YouTubeAPI). The channels are either the YouTube channel or Twitter/X account associated with the record (by identifier).

# Technical Architecture

## Directives
The application includes custom form validation directives:

1. **EmailValidatorDirective** - Validates email inputs using a regex pattern to ensure they have a valid format.
2. **PasswordValidatorDirective** - Enforces password policy requiring at least one uppercase letter, one digit, one special character, and a minimum length of 7 characters.

These directives are implemented as standalone components and can be used directly in form templates with the respective `appEmailValidator` and `appPasswordValidator` selectors.

## Guards
The application uses Angular route guards to protect routes:

1. **AuthGuard** - Prevents unauthorized access by ensuring the user is logged in. Redirects to the home page if the user is not authenticated.
2. **AdminGuard** - Restricts access to admin features by verifying the user has admin privileges. Displays a toastr error message and redirects to the home page if the user is not an admin.

## Interceptors
HTTP interceptors modify outgoing requests and incoming responses:

1. **LoadingInterceptor** - Shows and hides a loading spinner during HTTP requests (except for GET requests with a 'noSpinner' header), providing visual feedback during data loading.
2. **CacheInterceptor** - Implements client-side caching for GET requests and search results to improve performance and reduce API calls. The cache persists for 1 hour in sessionStorage.

## Error Handling and Logging
The application includes a robust error handling system:

1. **GlobalErrorHandler** - A custom error handler that catches all unhandled exceptions in the application and delegates them to the ErrorLoggingService.
2. **ErrorLoggingService** - Logs errors locally in localStorage and periodically syncs them with the server. It attempts to retry server connections up to 3 times before giving up.

# Known Issues
To save money (this is hosted in azure), there is a warmup period associated with the API used so the first requests from the front end to the API may take some time. An hourly warm-up request should be added to the Azure Functions.

The performance right now of the site is not great and I've noticed some high memory issues when using chrome. This will be addressed in future deployments.

# Development Notes
- The application uses Angular's standalone components approach.
- HTTP requests are processed through interceptors for caching and loading indication.
- Error handling is centralized through the GlobalErrorHandler.
- Authentication is role-based with 'Admin' and 'Demo' roles.
- The application routes are protected using AuthGuard and AdminGuard where appropriate.

# Local Development Setup

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Angular CLI](https://angular.io/cli) (v17.1.x)
- [Git](https://git-scm.com/) for cloning the repository
- [Social Media Detox API](https://github.com/rroethle7474/DopamineDetoxAPI) running locally

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/rroethle7474/social-media-detox.git
   cd social-media-detox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   - Make sure the Social Media Detox API is running locally
   - If needed, update the API URL in the environment configuration files located in `src/environments/`

4. **Start the development server**
   ```bash
   npm start
   ```
   Or alternatively, you can use the Angular CLI directly:
   ```bash
   ng serve
   ```
   This will start the Angular development server. Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

5. **Build for production**
   ```bash
   npm run build
   ```
   The build artifacts will be stored in the `dist/` directory.

## Running the Required Backend Services

For full functionality, you'll need to run:

1. **Social Media Detox API**
   - Clone from: https://github.com/rroethle7474/DopamineDetoxAPI
   - Follow the setup instructions in its README

2. **Azure Functions for SignalR** (optional for real-time updates)
   - Clone from: https://github.com/rroethle7474/DopamineDetoxFunction
   - Follow the setup instructions in its README

## Troubleshooting

- If you encounter CORS issues, ensure the API is configured to allow requests from your frontend origin (`http://localhost:4200`)
- For authentication issues, check if the API is properly configured for local development
- The first API request may be slow due to the "warm-up" period mentioned in the Known Issues section
