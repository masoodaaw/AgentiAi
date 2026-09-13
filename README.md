# AgentiAi

AgentiAi is a lightweight public portfolio project for learning, building, and showcasing Agentic AI skills.

## What it includes

- A public-facing landing page focused on:
  - understanding Agentic AI concepts
  - learning the most relevant tools and workflows
  - planning a portfolio-ready project
  - preparing a simple public deployment story
- An interactive focus switcher for `Learn`, `Build`, `Deploy`, and `Showcase`
- A deployment readiness checklist saved in the browser
- A GitHub Pages workflow so the site can be published after merging to `main`

## Local preview

Because the project is a simple static site, you can preview it locally with:

```bash
npm start
```

Then open `http://localhost:4173`.

## Validation

Run the lightweight interaction tests with:

```bash
npm test
```

## Deployment

The repository includes a GitHub Pages workflow in `.github/workflows/deploy-pages.yml`.

After enabling GitHub Pages for the repository, merges to `main` can publish the site automatically at:

`https://masoodaaw.github.io/AgentiAi/`
