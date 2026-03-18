# Contact Form Backend Setup

This document describes how to set up the contact form backend that handles form submissions via Cloudflare Pages Functions and sends emails using the Resend API.

## Architecture

- **Contact Form**: `src/pages/contact.astro` — form submission page
- **Backend Handler**: `functions/api/contact.js` — Cloudflare Pages Function
- **Email Service**: Resend API (https://resend.com/)
- **Configuration**: `wrangler.toml` — Cloudflare Pages Function config

## How It Works

1. User fills out and submits the contact form at `/contact`
2. Form data is POSTed to `/api/contact` as JSON
3. The Cloudflare Pages Function (`functions/api/contact.js`) receives the request
4. Request is validated (required fields: first_name, last_name, email, message)
5. Email is sent to `houses@conatusre.com` via Resend API with:
   - Subject: "New inquiry from {Name} — {Inquiry Type}"
   - HTML body with all form fields
   - Reply-to: submitter's email address
6. Success/error response returned as JSON to the frontend

## Required Configuration

### 1. Resend API Key

You need to obtain an API key from Resend and set it as a secret in Cloudflare Pages:

**Get your Resend API Key:**
1. Go to https://resend.com/api-keys
2. Create a new API key or copy an existing one
3. Copy the key (it starts with `re_`)

**Set the secret in Cloudflare Pages:**

#### Option A: Using Wrangler CLI (Local Development)
```bash
wrangler secret put RESEND_API_KEY --env production
# Paste your API key when prompted
```

#### Option B: Via Cloudflare Dashboard
1. Log in to https://dash.cloudflare.com
2. Go to Pages → conatusre-website → Settings → Environment variables
3. Click "Add Environment Variable"
4. Name: `RESEND_API_KEY`
5. Value: (paste your Resend API key)
6. Select "Encrypted" (if available)
7. Save

### 2. DNS Configuration

The Resend DKIM record is already configured in DNS:
- Record: `resend._domainkey.conatusre.com`
- Status: ✅ Configured

This allows emails from `noreply@conatusre.com` to be authenticated via Resend.

### 3. Email From Address

All emails from the contact form are sent from: `noreply@conatusre.com`

Make sure this address is verified or configured in your Resend account:
1. Go to https://resend.com/domains
2. Add domain: `conatusre.com`
3. Follow the DKIM/SPF setup (already done in DNS)

## Deployment

### Automatic (via GitHub Actions)

When you push to the `main` branch, GitHub Actions automatically:
1. Builds the Astro site
2. Deploys to Cloudflare Pages
3. The Pages Function is deployed automatically

### Manual Testing

To test locally:
```bash
wrangler pages dev --local
# The Pages Function will be available at http://localhost:8787/api/contact
```

To test the form submission:
```bash
curl -X POST http://localhost:4321/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "company": "Acme Inc",
    "inquiry_type": "platform",
    "message": "We need help building an operations platform."
  }'
```

## CORS Configuration

The backend accepts requests from:
- `https://conatusre.com`
- `https://www.conatusre.com`
- `http://localhost:3000` (development)
- `http://localhost:4321` (Astro dev server)
- Any subdomain on `*.vercel.app` and `*.pages.dev` (for preview deployments)

## Validation Rules

The contact form backend validates:
- `first_name`: Required, non-empty
- `last_name`: Required, non-empty
- `email`: Required, valid email format
- `company`: Optional
- `inquiry_type`: Optional (values: platform, claude, consulting, investment, other)
- `message`: Required, non-empty

Invalid requests return HTTP 400 with validation details.

## Error Handling

- **400 Bad Request**: Validation failed (missing/invalid fields)
- **405 Method Not Allowed**: Non-POST request
- **500 Internal Server Error**: Resend API failure or missing configuration

The frontend falls back to `mailto:` if the API request fails, so users can always send a message.

## Privacy & Legal

- Form data is only used to send a reply email
- The Privacy Policy (`/privacy`) explains data handling
- Contact form disclaimer references the Privacy Policy and provides opt-out instructions

## Troubleshooting

### "Server configuration error" response (500)
- Check that `RESEND_API_KEY` is set in Cloudflare Pages Environment Variables
- Verify the API key is valid (starts with `re_`)

### Emails not arriving
- Check Resend dashboard for bounce/spam reports: https://resend.com/logs
- Verify `noreply@conatusre.com` is added as an authorized sender in Resend
- Check that DKIM record in DNS is properly configured

### CORS errors in browser console
- Verify the origin matches the CORS allowlist
- Check that request is coming from conatusre.com or a configured dev domain

## Files

- `functions/api/contact.js` — Main request handler
- `wrangler.toml` — Cloudflare Pages Function configuration
- `src/pages/contact.astro` — Contact form (client-side form submission logic)
