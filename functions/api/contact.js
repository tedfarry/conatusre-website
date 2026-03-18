/**
 * Cloudflare Pages Function: Contact Form Handler
 *
 * Handles POST requests from the contact form and sends emails via Resend API.
 *
 * Environment variables required:
 * - RESEND_API_KEY: Resend API key for sending emails
 */

const TO_EMAIL = 'houses@conatusre.com';
const ALLOWED_ORIGINS = [
  'https://conatusre.com',
  'https://www.conatusre.com',
  'http://localhost:3000',
  'http://localhost:4321', // Astro default dev port
];

/**
 * Get CORS headers for the given origin
 */
function getCorsHeaders(origin) {
  if (!origin) {
    return {
      'Access-Control-Allow-Origin': '*',
    };
  }

  const isAllowed = ALLOWED_ORIGINS.includes(origin)
    || origin.endsWith('.vercel.app')
    || origin.endsWith('.pages.dev');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/**
 * Format the inquiry type for display
 */
function formatInquiryType(inquiryType) {
  const typeMap = {
    platform: 'Custom Operations Platform',
    claude: 'Claude / AI Integration',
    consulting: 'Technical Consulting',
    investment: 'Investment & Advisory',
    other: 'Other',
  };
  return typeMap[inquiryType] || inquiryType || 'Not specified';
}

/**
 * Validate the request body
 */
function validateRequest(body) {
  const errors = [];

  if (!body.first_name?.trim()) errors.push('first_name is required');
  if (!body.last_name?.trim()) errors.push('last_name is required');
  if (!body.email?.trim()) errors.push('email is required');
  if (!body.message?.trim()) errors.push('message is required');

  // Basic email validation
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('email is invalid');
  }

  return errors;
}

/**
 * Send email via Resend API
 */
async function sendEmail(data, apiKey) {
  const firstName = data.first_name?.trim() || '';
  const lastName = data.last_name?.trim() || '';
  const email = data.email?.trim() || '';
  const company = data.company?.trim() || '';
  const inquiryType = formatInquiryType(data.inquiry_type);
  const message = data.message?.trim() || '';

  const subject = `New inquiry from ${firstName} ${lastName} — ${inquiryType}`;

  const htmlBody = `
<h2>New Contact Form Submission</h2>
<p><strong>From:</strong> ${firstName} ${lastName}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
<p><strong>Inquiry Type:</strong> ${inquiryType}</p>
<hr>
<h3>Message:</h3>
<p>${message.replace(/\n/g, '<br>')}</p>
`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@gus.conatusre.com',
      to: TO_EMAIL,
      reply_to: email,
      subject: subject,
      html: htmlBody,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} ${error}`);
  }

  return await response.json();
}

/**
 * Main handler function
 */
export async function onRequest(context) {
  const { request, env } = context;
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Verify API key is configured
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    const validationErrors = validateRequest(body);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Send email
    await sendEmail(body, RESEND_API_KEY);

    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to send message',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
