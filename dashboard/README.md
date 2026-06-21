# Tariff Pressure Index Dashboard

Interactive Next.js dashboard for the fixed tariff risk model output. The app is self-contained under `/dashboard` so Vercel can deploy it with **Root Directory = `dashboard`**.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Recharts
- Static local JSON data at `data/companies.json`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
```

## Deploy on Vercel

1. Import the GitHub repo: https://github.com/vamika27/tariff-pressure-index
2. Set **Root Directory** to `dashboard`.
3. Keep the default Vercel Next.js settings.
4. Deploy.

No backend or environment variables are required.

## Related links

- GitHub repo: https://github.com/vamika27/tariff-pressure-index
- Live Power BI dashboard: https://app.powerbi.com/links/dEwMGO2Lzo?ctid=41f88ecb-ca63-404d-97dd-ab0a169fd138&pbi_source=linkShare&bookmarkGuid=017ffc84-48d3-4ea8-9530-f48a37c4c05a
