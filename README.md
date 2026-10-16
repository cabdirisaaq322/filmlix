This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

This app uses server-rendered Next.js pages and API routes, so deploy it as a Next.js app rather than a static export. Netlify detects Next.js and configures its maintained runtime automatically. The included `netlify.toml` selects Node.js 22 and runs `npm run build`.

1. Push this project to a Git provider such as GitHub, GitLab, or Bitbucket.
2. In Netlify, choose **Add new site** and import the repository.
3. Add `NEXT_PUBLIC_TMDB_API_KEY` in the site's environment variables. Set it for production and any deploy-preview contexts you use. Do not commit `.env.local`.
4. Deploy. Netlify will install from `package-lock.json` and build the Next.js app, including server routes.

Netlify deployment guide: https://docs.netlify.com/frameworks/next-js/overview/
