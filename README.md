# Cloudinary SaaS

A Next.js App Router application for authenticated media workflows — upload videos, compress them server-side via Cloudinary, and generate social-media-ready image crops.

## What it does

- **Video upload** — authenticated users upload videos; the server compresses them via Cloudinary eager transformations and stores metadata in Postgres
- **Video gallery** — public gallery showing thumbnails, hover previews, duration, original vs. compressed size, and compression savings
- **Social image creator** — upload an image and get transformed versions for Instagram, Twitter, and Facebook formats
- **Auth** — Clerk handles sign-in, sign-up, and route protection

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Auth | Clerk |
| Media | Cloudinary, next-cloudinary |
| Database | Prisma 7 + PostgreSQL |
| UI | Tailwind CSS 4, DaisyUI |
| Utilities | Axios, react-hot-toast, lucide-react, dayjs, filesize |

## Routes

| Route | Auth | Purpose |
|---|---|---|
| `/home` | Public | Video gallery |
| `/video-upload` | Required | Upload a video |
| `/social-share` | Required | Image transformation tool |
| `/sign-in` | — | Clerk sign-in |
| `/sign-up` | — | Clerk sign-up |
| `/` | — | Redirects to `/home` |

## API

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/videos` | GET | — | List videos, newest first |
| `/api/video-upload` | POST | Required | Upload + compress video, store metadata |
| `/api/image-upload` | POST | Required | Upload image for transformations |

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment**

Copy `.env.example` to `.env.local` and fill in values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**3. Set up the database**

```bash
npx prisma generate
npx prisma migrate dev
```

**4. Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Generate Prisma client + build Next.js
npm run start    # Start production server
npm run lint     # Run ESLint
```

## How video upload works

1. User selects a file on `/video-upload` and submits `file`, `title`, `description`, and `originalSize`
2. The API verifies Clerk auth
3. The video uploads to Cloudinary with an eager transformation:
   ```
   quality: auto:low  |  fetch_format: mp4  |  video_codec: auto
   ```
4. Metadata is stored in Postgres: `publicId`, `originalSize`, `compressedSize`, `duration`, `title`, `description`
5. `/home` fetches `/api/videos` and renders each video with `VideoCard`

The hover preview uses a short 15-second clip: `so_0,du_15,q_auto:low,f_mp4`

Compression savings are displayed as a percentage. If the compressed file is not smaller, the UI shows **No reduction**.

## How social image sharing works

1. User uploads an image on `/social-share`
2. `/api/image-upload` uploads it to Cloudinary and returns a `publicId`
3. `CldImage` renders transformed versions for each format (Instagram Square/Portrait, Twitter Post/Header, Facebook Cover)
4. Each format can be downloaded directly from the browser

## Database schema

```prisma
model Video {
  id             String   @id @default(cuid())
  title          String
  description    String?
  publicId       String
  originalSize   String
  compressedSize String
  duration       Float
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## Project structure

```
app/
  (app)/
    home/               Video gallery
    social-share/       Image transformation tool
    video-upload/       Video upload form
    layout.tsx          Authenticated app shell
  (auth)/
    sign-in/            Clerk sign-in
    sign-up/            Clerk sign-up
    layout.tsx          Centered auth layout
  api/
    image-upload/
    video-upload/
    videos/
components/
  VideoCard.tsx
  ToastProvider.tsx
lib/
  cloudinary.ts
PrismaSetup/
  prismaSetup.ts
prisma/
  schema.prisma
proxy.ts                Clerk middleware + route protection
types/
  index.ts
```

## Notes

- Already-optimized videos may show **No reduction** — Cloudinary compression cannot shrink a file that is already compact
- `npm run lint` reports existing issues in `social-share`, `image-upload`, and some image usage warnings; these are pre-existing and unrelated to new uploads
- Clerk avatar images from `img.clerk.com` are allowlisted in `next.config.ts`
- Do not commit `.env.local` — it contains live credentials
