# Vercel Environment Variables

The following environment variables need to be configured in the Vercel project settings for the `tothub-website` application.

## Required

- **`NEXT_PUBLIC_SITE_URL`**
  - **Description**: The canonical URL of the website. Used for SEO metadata (OpenGraph, Twitter cards) and sitemap generation.
  - **Example**: `https://www.tothub.com` (Production), `https://tothub-website-git-main.vercel.app` (Preview)
  - **Note**: If not provided, the application attempts to use `VERCEL_URL`, but `NEXT_PUBLIC_SITE_URL` is recommended for consistency.

## Optional

- **`NEXT_PUBLIC_GOOGLE_VERIFICATION`**
  - **Description**: The Google Search Console verification code.
  - **Example**: `google-site-verification=...`

## Automatic

- **`VERCEL_URL`**
  - **Description**: Automatically set by Vercel. The domain name of the generated deployment.
