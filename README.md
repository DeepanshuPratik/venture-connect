# VentureConnect 🚀

**Empowering Entrepreneurial Journeys & Opportunities**

![VentureConnect Screenshot Placeholder](https://via.placeholder.com/1200x600?text=VentureConnect+App+Screenshot)
*(Replace this with actual screenshots or a GIF of your running application!)*

## Table of Contents

1.  [About VentureConnect](#about-ventureconnect)
2.  [Features](#features)
3.  [Technology Stack](#technology-stack)
4.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Firebase Setup](#firebase-setup)
    *   [Environment Variables](#environment-variables)
    *   [Running the Application](#running-the-application)
5.  [Project Structure](#project-structure)
6.  [Usage Guide](#usage-guide)
7.  [Contributing](#contributing)
8.  [License](#license)
9.  [Contact](#contact)

---

## 1. About VentureConnect

VentureConnect is a modern web platform designed to foster a vibrant community for entrepreneurs and individuals seeking opportunities within the startup ecosystem. It provides a dedicated space for entrepreneurs to share their vision, post job openings, and celebrate milestones, while also enabling talent to discover exciting roles and express interest in innovative ventures. With a focus on intuitive user experience and real-time data, VentureConnect aims to be the go-to hub for entrepreneurial connections and growth.

## 2. Features

VentureConnect offers a rich set of functionalities tailored for both entrepreneurs and talent:

### User Management
*   **Authentication:** Secure user registration and login using Email/Password (and potentially social logins like Google).
*   **User Roles:** Differentiated experiences for `Entrepreneur` and `Talent` users, influencing available features and profile sections.

### Enhanced Profile Management
*   **Personalized Profiles:** Users can create and update their profiles with basic information like Name, Bio.
*   **Structured Work History:**
    *   Users can add multiple previous job or startup experiences, including:
        *   Company Name & Job Title
        *   Start and End Dates (with "Present" option)
        *   Calculated Duration (e.g., "3 years, 6 months")
        *   A description field to highlight proud achievements or responsibilities.
    *   Experiences are displayed chronologically for clear overview.
*   **Entrepreneur-Specific Profile Details:**
    *   **Dedicated "My Running Startup" Section:** Entrepreneurs can switch between managing their current startup details and their general work history.
    *   **Detailed Startup Information:**
        *   Startup Name
        *   Tagline
        *   **Industry / Niche (Dropdown with "Other" input):** Select from predefined categories or specify a custom one.
        *   Startup Website / Link
        *   Detailed Startup Vision
    *   **Startup Stage Slider:** A dynamic indicator to update their startup's current development phase:
        *   **Ideation / Discovery:** Just forming the idea, market research.
        *   **MVP / Early Traction:** Minimum Viable Product built, getting initial users/feedback.
        *   **Seed Stage / Fundraising:** Actively seeking seed investment, proving initial traction.
        *   **Growth / Scaling:** Established product, growing user base, expanding operations.
*   **Talent-Specific Profile Fields:**
    *   **Skills Showcase:** List relevant skills using a tag-based input.
    *   **Portfolio/Resume Links:** Option to link to external professional assets.
*   **Intelligent Display:** Profile fields are dynamically hidden if they are not provided, ensuring a clean and relevant display.
*   **Real-time Updates:** Profile changes are reflected instantly across the application without requiring a page refresh, thanks to Firebase Firestore's real-time listeners.

### Opportunity Board
*   **Job Posting:** Entrepreneurs can create detailed job listings for their startups, including:
    *   Job Title
    *   Responsibilities and Requirements
    *   Required Skills (tag-based)
    *   Optional Pay Range (e.g., "$60k - $80k" or "Equity-based")
*   **Express Interest:** Talent users can easily express interest in job postings with a single click.
*   **Applicant Tracking:** Entrepreneurs can view profiles of all individuals who have expressed interest in their job posts, allowing for efficient talent discovery.

### Community & Sharing
*   **Achievement Posts:** Entrepreneurs can share and celebrate their startup milestones and successes with the community.
*   **Meetup Listings (Add-on):** Post and discover community meetups, webinars, or networking events related to entrepreneurship.
*   **Entrepreneurial Journey Posts (Add-on):** A blog-like section for users to share their insights, challenges, and lessons learned from their entrepreneurial path.

## 3. Technology Stack

*   **Frontend:**
    *   [React.js](https://react.dev/) - A JavaScript library for building user interfaces.
    *   [React Router](https://reactrouter.com/) - Declarative routing for React.
    *   [Chakra UI](https://chakra-ui.com/) - A simple, modular, and accessible component library for React, enabling rapid and beautiful UI development.
*   **Backend & Database:**
    *   [Firebase Authentication](https://firebase.google.com/docs/auth) - For secure user authentication and management.
    *   [Firestore](https://firebase.google.com/docs/firestore) - A flexible, scalable NoSQL cloud database for real-time data, hosted in **`asia-south1 (Mumbai)`** for optimal performance for users in India.
    *   [Firebase Storage](https://firebase.google.com/docs/storage) (Optional, for profile images or achievement media) - Cloud storage for user-generated content.
*   **Environment Variables:**
    *   [`dotenv`](https://www.npmjs.com/package/dotenv) (handled by Create React App) - For managing sensitive API keys and configuration.

## 4. Getting Started

Follow these instructions to get a copy of VentureConnect up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed:
*   [Node.js](https://nodejs.org/en/download/) (LTS recommended, e.g., v18.x or v20.x)
*   [npm](https://www.npmjs.com/get-npm) (comes with Node.js) or [Yarn](https://yarnpkg.com/getting-started/install)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/venture-connect.git
    cd venture-connect
    ```

2.  **Clean up previous installs (Recommended for a fresh start):**
    This step ensures there are no lingering caches or old dependencies causing issues.
    ```bash
    # Stop your development server if running (Ctrl + C)
    npm cache clean --force # Clears npm's cache
    rm -rf node_modules package-lock.json # Deletes local dependencies and lock file
    # If you use yarn, use: rm -rf node_modules yarn.lock
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```

### Firebase Setup

1.  **Create a Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click "Add project" and follow the steps.

2.  **Add a Web App to your Project:**
    *   In your Firebase project, look for the `</>` (Web) icon to add a new web app.
    *   Register your app and copy the Firebase configuration object (it looks like `firebaseConfig = { apiKey: "...", ... }`).

3.  **Enable Firebase Services:**
    *   **Authentication:** Navigate to "Authentication" -> "Get started". Enable "Email/Password" provider. (Optional: Enable Google Sign-in).
    *   **Firestore Database:** Navigate to "Firestore Database" -> "Create database". Choose **"Start in production mode"**. **Crucially, select `asia-south1 (Mumbai)` as your location.** This choice is permanent.
    *   **Firebase Storage:** (Optional, if you plan to allow image uploads) Navigate to "Storage" -> "Get started". Choose **"Start in production mode"** and ensure the location is also `asia-south1 (Mumbai)`.

4.  **Firestore Security Rules:**
    *   **WARNING:** The following rules are for **DEVELOPMENT ONLY** and are highly insecure. **DO NOT USE IN PRODUCTION.**
    *   In the Firebase Console, go to "Firestore Database" -> "Rules" tab. Replace the content with:
        ```firestore
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Users collection rules
            match /users/{userId} {
              allow read: if request.auth != null; // Anyone logged in can read any user profile
              allow create: if request.auth != null && request.auth.uid == userId; // Only create own profile on signup
              allow update: if request.auth != null && request.auth.uid == userId; // Only update own profile
              allow delete: if false; // No deletion from client
            }

            // Job Posts collection rules
            match /job_posts/{jobId} {
              allow read: if request.auth != null; // Any logged-in user can read job posts
              allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'entrepreneur'; // Only entrepreneurs can create
              // Allow update for the owner, and also for talent to update interestedUsers array
              allow update: if request.auth != null && (
                request.auth.uid == resource.data.postedBy || // Owner can update
                (request.auth.uid != resource.data.postedBy && request.resource.data.interestedUsers.size() > resource.data.interestedUsers.size() && request.resource.data.interestedUsers.hasAny([request.auth.uid])) // Talent can add themselves to interestedUsers
              );
              allow delete: if false; // No deletion from client
            }

            // Achievements collection rules
            match /achievements/{achievementId} {
              allow read: if request.auth != null; // Any logged-in user can read achievements
              allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'entrepreneur'; // Only entrepreneurs can create
              allow update: if request.auth != null && request.auth.uid == resource.data.postedBy; // Only owner can update
              allow delete: if false; // No deletion from client
            }

            // Note: Add rules for meetups and journey_posts when you implement them
          }
        }
        ```
    *   Click **`Publish`**.

### Environment Variables

Create a `.env` file in the root of your project (same level as `package.json`). Populate it with your Firebase configuration details, ensuring each variable is prefixed with `REACT_APP_` for Create React App to recognize it.

```dotenv
# .env file
REACT_APP_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
REACT_APP_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
REACT_APP_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
REACT_APP_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" # Optional, for Google Analytics


### Running the Application
Once everything is set up, you can start the development server:
npm start
# OR
yarn start
Use code with caution.
Bash
The application will open in your browser at http://localhost:3000.
5. Project Structure
venture-connect/
├── public/
├── src/
│   ├── assets/                 # Images, icons
│   ├── components/             # Reusable UI components (e.g., Navbar, Footer, LoadingSpinner)
│   ├── contexts/               # React Context for global state (e.g., AuthContext)
│   │   └── AuthContext.js
│   ├── firebase/               # Firebase initialization and utility functions
│   │   └── firebase.js         # Firebase config, export auth, db
│   ├── hooks/                  # Custom React hooks (e.g., useAuth)
│   │   └── useAuth.js
│   ├── pages/                  # Top-level page components
│   │   ├── Auth/               # Login, Signup
│   │   ├── Dashboard/          # User Dashboard
│   │   ├── JobPostings/        # List, Create, Detail of Job Posts
│   │   ├── Profile/            # User Profile, Edit Profile
│   │   ├── Achievements/       # List, Create Achievements
│   │   ├── Meetups/            # (Add-on)
│   │   ├── Journeys/           # (Add-on)
│   │   └── NotFoundPage.js
│   ├── App.js                  # Main application component, handles routing
│   ├── index.js                # Entry point, ChakraProvider setup
│   └── styles/                 # Global CSS (optional, Chakra handles most styling)
│       └── tailwind.css        # (Now empty or removed, replaced by Chakra UI)
├── .env                        # Environment variables (gitignore'd)
├── package.json
└── README.md
Use code with caution.
6. Usage Guide
Upon launching the application:
Sign Up / Log In: Create an account. During signup, select your role (Entrepreneur or Talent).
Complete Your Profile: Navigate to your profile section.
For all users: Fill in your basic info (Name, Bio) and add detailed Work History / Startup Experience entries using the intuitive modal form.
For Entrepreneurs: Switch to the "My Running Startup" tab to input details like Startup Name, Tagline, select an Industry (or specify "Other"), provide a Website, detailed Vision, and update your Startup Stage via the slider.
For Talent: List your key Skills (tag-based input) and provide links to your Portfolio and Resume.
All changes will update in real-time.
For Entrepreneurs:
Post a Job: Go to the "Job Postings" section and create a new listing for your startup.
View Interests: On your job post's detail page, see who has expressed interest and view their profiles.
Share Achievements: Post your latest startup milestones and successes to the community feed.
For Talent:
Browse Jobs: Explore exciting opportunities from innovative startups.
Express Interest: Click the "Express Interest" button on any job that catches your eye.
Discover: Explore achievement posts, meetups, and journey articles from the community.
7. Contributing
We welcome contributions to VentureConnect! If you have suggestions for improvements, new features, or find a bug, please feel free to:
Fork the repository.
Create a new branch (git checkout -b feature/your-feature-name or bugfix/issue-name).
Make your changes and ensure tests pass (if any).
Commit your changes (git commit -m 'feat: Add new feature X').
Push to your branch (git push origin feature/your-feature-name).
Open a Pull Request to the main branch of this repository.
Please follow conventional commits if possible (feat:, fix:, chore:, etc.).
8. License
This project is licensed under the MIT License - see the LICENSE file for details.
9. Contact
For any questions or inquiries, please reach out:
Your Name/Email: your.email@example.com
Your GitHub: github.com/your-username