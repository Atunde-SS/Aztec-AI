
# Aztec AI Tutor

![Aztec AI Tutor Logo](https://raw.githubusercontent.com/MUGEMA-D/Aztec-AI-Tutor/main/public/aztec-logo.png)

An AI-powered, interactive learning platform designed to master the Aztec Network. This application provides a guided journey from foundational privacy concepts to advanced smart contract development and dApp deployment, tailored for all skill levels.

## Features

-   **Interactive AI Chat**: Learn through a conversational interface powered by the Google Gemini API.
-   **Comprehensive Curriculum**: A structured learning path covering everything from "What is Aztec?" to building a complete dApp.
-   **Selectable AI Personas**: Choose your teacher's personality—from an Empathetic Mentor to a Pragmatic Developer—to match your learning style.
-   **Dual Skill Levels**: Toggle between 'Beginner' and 'Developer' modes to get explanations tailored to your expertise.
-   **Advanced Code Blocks**: Enjoy IDE-like code blocks with syntax highlighting (Dracula theme), line numbers, copy-to-clipboard, and a one-click "Explain Code" feature.
-   **Searchable Knowledge Base**: Instantly search the entire curriculum to find the exact information you need.
-   **Rich Content Rendering**: Full markdown support, including clickable links and asynchronous URL previews for a richer learning experience.
-   **Fully Responsive**: A seamless experience whether you're on a desktop or a mobile device.

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI**: Google Gemini API (`@google/genai`)
-   **Syntax Highlighting**: `react-syntax-highlighter`

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need [Node.js](https://nodejs.org/) (v18 or later) installed on your machine.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aztec-ai-tutor.git
    cd aztec-ai-tutor
    ```

2.  **API Key Configuration:**
    This application requires a Google Gemini API key to function. The app has a smart key-handling mechanism:

    *   **For Public Users (or if no dev key is provided):** The app will prompt the user to enter their own API key, which is then stored securely in their browser's local storage.
    *   **For Local Development:** You can bypass the user prompt by providing your own key. Create a file named `.env` in the root of the project and add your API key:

      ```
      # .env
      API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
      ```

    You can get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running Locally

This project is a modern static web app and should be served by a local development server to handle module imports correctly.

1.  **Install a simple server (if you don't have one):**
    ```bash
    npm install -g serve
    ```

2.  **Run the server from the project root:**
    ```bash
    serve .
    ```
    The application will now be running at a local URL (e.g., `http://localhost:3000`).

## Deployment

You can easily deploy this application to any static hosting service like Vercel, Netlify, or GitHub Pages.

### Deploying to Vercel/Netlify

1.  Push your cloned repository to your own GitHub, GitLab, or Bitbucket account.
2.  Create a new project on Vercel or Netlify and connect it to your repository.
3.  No special build commands are needed. Use the default settings for a static site.
4.  **(Optional but Recommended)** To avoid prompting every user for an API key, you can set your own key as an **environment variable** in your Vercel/Netlify project settings.
    -   **Variable Name:** `API_KEY`
    -   **Variable Value:** Your Google Gemini API Key

    **Important Note:** For a static deployment to read this environment variable, you would typically need a build step (e.g., with Vite or Create React App) to inject it. As this project is set up to run without a build step, the deployed app will default to asking the end-user for their key via the modal. This is the most secure approach for a public-facing application if you do not wish to use your own key for all users.

## How the API Key Logic Works

The application prioritizes API keys in the following order:
1.  **Developer Environment Key**: It first checks for an API key provided by the development environment (e.g., the `.env` file when running locally).
2.  **User's Local Storage**: If no developer key is found, it checks the browser's `localStorage` for a key the user may have previously saved.
3.  **User Prompt**: If no key is found in either of the above locations, it displays the pop-up modal, asking the user to provide their key.

This ensures a smooth experience for developers while making the public application secure and functional for everyone.

---

Happy learning, and happy building on Aztec!
