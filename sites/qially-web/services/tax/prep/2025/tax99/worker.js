export default {
  async fetch(request, env, ctx) {
    // -------------------------------------------------------------------------
    // 1. CORS & Preflight Handling
    // -------------------------------------------------------------------------
    const headers = {
      'Access-Control-Allow-Origin': '*', // Adjust domain in production if needed
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405, headers });
    }

    try {
      const body = await request.json();

      // -----------------------------------------------------------------------
      // 2. Validate Turnstile (Spam Protection)
      // -----------------------------------------------------------------------
      const token = body.turnstileToken;
      const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: request.headers.get('CF-Connecting-IP')
        })
      });

      const turnstileOutcome = await turnstileResult.json();
      if (!turnstileOutcome.success) {
        return new Response(JSON.stringify({ message: "Security check failed. Please refresh and try again." }), { status: 403, headers });
      }

      // -----------------------------------------------------------------------
      // 3. Input Validation
      // -----------------------------------------------------------------------
      if (!body.name || !body.email || !body.phone || !body.tier) {
         return new Response(JSON.stringify({ message: "Missing required fields." }), { status: 400, headers });
      }

      // -----------------------------------------------------------------------
      // 4. Send Email to Business Owner (Intake Notification)
      // -----------------------------------------------------------------------
      const ownerEmailResponse = await sendZeptoMail(env, {
        to: [{ email_address: { address: env.BUSINESS_OWNER_EMAIL, name: "Qially HQ" } }],
        subject: `New Tax Intake: ${body.name} (${body.tier})`,
        htmlbody: `
          <h1>New Client Intake 🚀</h1>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Phone:</strong> ${body.phone}</p>
          <p><strong>Tier:</strong> ${body.tier}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `
      });

      if (!ownerEmailResponse.ok) {
         console.error("ZeptoMail Owner Error:", await ownerEmailResponse.text());
         // We might log this but still attempt to send client email or return success to local user
      }

      // -----------------------------------------------------------------------
      // 5. Send Confirmation Email to Client
      // -----------------------------------------------------------------------
      const clientEmailResponse = await sendZeptoMail(env, {
        to: [{ email_address: { address: body.email, name: body.name } }],
        subject: "Confirmation: Your Spot is Locked In! 🔒",
        htmlbody: `
          <div style="font-family: sans-serif; color: #0F172A; line-height: 1.6;">
            <h1>Hi ${body.name.split(' ')[0]}! We've got you. ☁️</h1>
            <p>Thanks for locking in your $99 Early Bird rate with Qially.</p>
            
            <div style="background: #F0F9FF; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top:0;">Next Steps 📋</h3>
                <ol>
                    <li><strong>Complete Payment:</strong> (If you haven't already on the next page)</li>
                    <li><strong>Gather Docs:</strong> W-2s, 1099s, etc.</li>
                    <li><strong>Upload Securely:</strong> We will send you a secure portal link within 24 hours.</li>
                </ol>
            </div>

            <p>If you have any questions, reply to this email.</p>
            <p>Best,<br>The Qially Team</p>
          </div>
        `
      });

      if (!clientEmailResponse.ok) {
         console.error("ZeptoMail Client Error:", await clientEmailResponse.text());
      }

      // -----------------------------------------------------------------------
      // 6. Success Response
      // -----------------------------------------------------------------------
      return new Response(JSON.stringify({ success: true, message: "Intake received" }), { status: 200, headers });

    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500, headers });
    }
  }
};

/**
 * Helper function to send email via Zoho ZeptoMail API
 */
async function sendZeptoMail(env, { to, subject, htmlbody }) {
  const url = "https://api.zeptomail.com/v1.1/email"; 
  
  const payload = {
    from: {
      address: env.ZEPTOMAIL_FROM_EMAIL,
      name: env.ZEPTOMAIL_FROM_NAME
    },
    to: to,
    subject: subject,
    htmlbody: htmlbody,
  };

  return fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": env.ZEPTOMAIL_API_KEY // Format usually: "Zoho-enczapikey <YOUR_KEY>"
    },
    body: JSON.stringify(payload)
  });
}
