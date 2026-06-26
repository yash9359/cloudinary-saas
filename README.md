# Cloudinary SaaS

A Next.js App Router project for authenticated media workflows. Users can sign in with Clerk, upload videos to Cloudinary, store video metadata in Postgres with Prisma, view compressed video cards, download optimized MP4s, and create social-media-ready image crops.

## Features

- Clerk authentication with protected app routes
- Video upload to Cloudinary
- Server-side Cloudinary video compression using eager transformations
- Video gallery with thumbnails, hover previews, duration, original size, compressed size, and compression savings
- Social media image creator with Cloudinary transformations for common formats
- Prisma + PostgreSQL persistence for uploaded video metadata
- Tailwind CSS + DaisyUI interface with dark theme

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Clerk
- Cloudinary and next-cloudinary
- Prisma 7 with PostgreSQL
- Tailwind CSS 4 and DaisyUI
- Axios, react-hot-toast, lucide-react, dayjs, filesize

## App Routes

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/home` |
| `/home` | Public video gallery with loading skeletons |
| `/video-upload` | Protected video upload form |
| `/social-share` | Protected image upload and social format transformer |
| `/sign-in` | Clerk sign-in page |
| `/sign-up` | Clerk sign-up page |

## API Routes

| Endpoint | Method | Purpose | Auth |
| --- | --- | --- | --- |
| `/api/videos` | `GET` | Returns videos ordered by newest first | Public |
| `/api/video-upload` | `POST` | Uploads and compresses a video, then stores metadata | Required |
| `/api/image-upload` | `POST` | Uploads an image for Cloudinary transformations | Required |

## Project Structure

```txt
app/
  (app)/
    home/                 Video gallery
    social-share/         Image transformation tool
    video-upload/         Video upload form
    layout.tsx            Authenticated app shell/sidebar
  (auth)/
    sign-in/              Clerk sign-in
    sign-up/              Clerk sign-up
    layout.tsx            Centered auth layout
  api/
    image-upload/         Image upload route
    video-upload/         Video upload + compression route
    videos/               Video listing route
components/
  VideoCard.tsx           Video thumbnail, preview, size, compression UI
  ToastProvider.tsx       Global toast provider
lib/
  cloudinary.ts           Cloudinary server SDK config
PrismaSetup/
  prismaSetup.ts          Prisma client with pg adapter
prisma/
  schema.prisma           Video model and Postgres datasource
proxy.ts                  Clerk route protection and redirects
types/
  index.ts                Shared Video type
```

## Environment Variables

Create `.env.local` from `.env.example` and fill in real values.

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

Keep `.env.local` private. Do not commit real Clerk, Cloudinary, or database credentials.

## Setup

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run dev      # Start Next.js dev server
npm run build    # Generate Prisma client and build Next.js
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Video Upload Flow

1. The user selects a video on `/video-upload`.
2. The client sends `file`, `title`, `description`, and `originalSize` to `/api/video-upload`.
3. The API checks Clerk auth.
4. The API uploads the video to Cloudinary.
5. Cloudinary creates an eager compressed MP4 rendition:

```ts
{
  quality: "auto:low",
  fetch_format: "mp4",
  video_codec: "auto"
}
```

6. The API stores metadata in Postgres:

- `publicId`
- `originalSize`
- `compressedSize`
- `duration`
- `title`
- `description`

7. `/home` fetches `/api/videos` and renders each item with `VideoCard`.

## Video Preview and Compression Display

`VideoCard` uses Cloudinary URLs for:

- Thumbnail image
- Hover preview clip
- Compressed download URL

The hover preview uses a short transformed clip:

```ts
rawTransformations: ["so_0,du_15,q_auto:low,f_mp4"]
```

Compression is calculated from saved sizes:

```ts
Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
```

If the transformed video is not smaller than the original, the UI shows `No reduction`.

## Image Transformation Flow

1. The user uploads an image on `/social-share`.
2. `/api/image-upload` uploads the image to Cloudinary.
3. The page stores the returned Cloudinary `publicId`.
4. `CldImage` renders transformed versions for formats like Instagram Square, Instagram Portrait, Twitter Post, Twitter Header, and Facebook Cover.
5. The transformed image can be downloaded from the browser.

## Authentication and Route Protection

`proxy.ts` uses Clerk middleware.

- `/sign-in`, `/sign-up`, and `/home` are public routes.
- `/api/videos` is public.
- `/video-upload`, `/social-share`, `/api/video-upload`, and `/api/image-upload` require a signed-in user.
- `/` redirects to `/home`.
- Signed-in users visiting auth pages are redirected to `/home`.

## Database Model

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

## Development Notes

- Existing uploaded videos keep their old `compressedSize`; upload a new video to see the latest compression behavior.
- Cloudinary compression can still produce `No reduction` for already optimized videos.
- `npm run lint` currently reports existing issues in unrelated files, especially `social-share`, `image-upload`, and some image usage warnings.
- `next.config.ts` currently allows remote Clerk avatar images from `img.clerk.com`.
