# Gemini Content Explorer

Gemini Content Explorer is an interactive, single-page web application that allows users to explore categorized articles. It features a mock user login system, a dynamic sidebar for navigating different content flows, and cascading dropdowns to filter and display content cards fetched from a mock API.

The application is built with modern web technologies, including React, TypeScript, and Tailwind CSS, focusing on a clean, responsive, and user-friendly experience.

## ✨ Features

- **User Authentication**: A simple and clean login page with mock authentication (`user` / `password`).
- **Responsive UI**: The layout is fully responsive and works seamlessly on desktop and mobile devices.
- **Modern Tech Stack**: Built with React 18, TypeScript, and styled with Tailwind CSS for a professional look and feel.
- **Dynamic Sidebar Navigation**: An icon-based sidebar with tooltips allows users to switch between three distinct content flows: Technology, Health, and Finance.
- **Cascading Filters**: Each content flow features a two-level filtering system. Selecting a primary category dynamically populates the topics available in the second dropdown.
- **Reusable Combobox Component**: A custom, accessible combobox component that supports searching and filtering within dropdown options.
- **Asynchronous Data Fetching**: All content (dropdown options, articles) is fetched from a mock API service that simulates network latency, complete with loading and error states.
- **Dynamic Article Display**: Filtered articles are displayed in a clean grid of cards, each showing an image, title, snippet, and tags.
- **State Management**: Clean and efficient state management using React hooks (`useState`, `useEffect`, `useCallback`).

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **Dependencies**: Loaded via CDN using import maps (no build step required).
- **Backend**: A mock API service (`services/mockApi.ts`) is included to simulate backend responses for a full-stack experience without a real backend.

## 🚀 Getting Started

This project is set up to run directly in a browser-based development environment that supports this file structure. No local installation or build steps are necessary.

1.  Open `index.html` to view and interact with the application.
2.  The main application logic starts in `index.tsx`, which mounts the main `App` component to the DOM.

### Login Credentials

To access the main application, use the following credentials on the login page:

-   **Username**: `user`
-   **Password**: `password`

## 📂 File Structure

The project is organized into logical folders and components:

```
.
├── App.tsx                 # Root component, handles authentication state.
├── README.md               # You are here!
├── components/
│   ├── ArticleCard.tsx     # Displays a single article.
│   ├── Combobox.tsx        # Reusable dropdown with search functionality.
│   ├── FlowPage.tsx        # Manages the state and layout for a content flow.
│   ├── Header.tsx          # Top header bar with user info and logout.
│   ├── LoginPage.tsx       # User login form.
│   ├── MainPage.tsx        # Main layout after login (Sidebar + FlowPage).
│   ├── Sidebar.tsx         # Left-side navigation bar.
│   └── icons/              # SVG icon components.
│       ├── FinanceIcon.tsx
│       ├── HealthIcon.tsx
│       └── TechIcon.tsx
├── index.html              # The main HTML entry point.
├── index.tsx               # React application entry point.
├── metadata.json           # Application metadata.
├── services/
│   └── mockApi.ts          # Simulates all backend API calls.
└── types.ts                # Shared TypeScript types and interfaces.
```

## 📝 How It Works

1.  **Authentication**: The `App.tsx` component conditionally renders either the `LoginPage` or the `MainPage` based on the user's authentication state.
2.  **Navigation**: Once logged in, the `MainPage` displays a persistent `Sidebar`. Clicking an icon in the sidebar updates the `activeFlow` state, which causes the `FlowPage` to re-render with the configuration for the selected flow (e.g., "Technology Insights").
3.  **Filtering**:
    -   The `FlowPage` component fetches the initial list of categories for the current flow from the `mockApi`.
    -   When a user selects a category from the first `Combobox`, a request is made to fetch the corresponding topics.
    -   The second `Combobox` is populated with the new topics.
4.  **Displaying Content**: After the user selects both a category and a topic, they can click the "Show Articles" button. This triggers a final API call to fetch the articles that match the criteria. The results are then mapped over and rendered as `ArticleCard` components.
