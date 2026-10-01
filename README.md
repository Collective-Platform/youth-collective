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

## Verification

Use the fast check while developing. It runs the unit tests, TypeScript, ESLint,
and Git whitespace validation:

```bash
pnpm check
```

Before a handoff or deployment, run the full verification. It adds Drizzle
migration-history validation and a production Next.js build:

```bash
pnpm verify
```

These commands do not apply database migrations. Schema changes still require
`pnpm db:generate` followed by an explicitly approved `pnpm db:migrate`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# youth-collective

## Booking email

Bookings, Waitlist joins and promotions, and member cancellations create a durable
email delivery record in the same database transaction. Configure
`MAILERSEND_API_KEY`, a MailerSend-verified `MAILERSEND_FROM_EMAIL`, and an
optional `MAILERSEND_FROM_NAME` to send them.

`/api/cron/session-reminders` is scheduled hourly through `vercel.json`. It creates
the single reminder for each confirmed Booking 23–25 hours before the Session and
retries queued or failed email deliveries. Set `CRON_SECRET`; scheduled calls must
send `Authorization: Bearer <CRON_SECRET>`.
