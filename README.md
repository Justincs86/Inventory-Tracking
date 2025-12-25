<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MaintiTrack - Industrial Stock Control

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/12pSz62DSJEHJYAICsiPzEcc3r_2g_szx

## Getting Started

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: If you encounter errors, ensure you are using a recent version of Node.js (v18+).*

### Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building

To build the project for production:

```bash
npm run build
```

## Deployment

This project is configured to deploy automatically to **GitHub Pages** using GitHub Actions.

1.  Push your changes to the `main` branch.
2.  The workflow defined in `.github/workflows/deploy.yml` will trigger.
3.  It will build the application and deploy the `dist` folder to GitHub Pages.

**Note:** Ensure you have configured GitHub Pages in your repository settings to deploy from the gh-pages environment or actions.
