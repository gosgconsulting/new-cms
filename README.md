# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/71ee1bf0-f845-485d-a5cc-24b16173fc54

## Recent Refactoring

This project has been refactored to simplify the structure. Now it only includes:
- Homepage with contact modal
- Admin dashboard page
- 404 page for handling not found routes

All other pages and unused components have been removed to streamline the codebase.

## Database Setup

This project uses PostgreSQL hosted on Railway. To set up the database:

1. Create a new PostgreSQL instance on Railway
2. Copy the environment variables from `railway-env-variables.txt` into your Railway project's environment variables
3. Deploy your application to Railway

For local development:
1. Create a `.env.local` file in the root directory with the same variables but with your local PostgreSQL connection details
2. Run `npm run dev` to start the development server

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/71ee1bf0-f845-485d-a5cc-24b16173fc54) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/71ee1bf0-f845-485d-a5cc-24b16173fc54) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
