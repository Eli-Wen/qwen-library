const responseHeaders = {
  "content-type": "application/json; charset=UTF-8"
};

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

function textAttachment(location) {
  const lines = [
    "CircularLoop Melbourne facility details",
    "",
    `Facility: ${location.name}`,
    `Address: ${location.address || "Not listed"}`,
    `Suburb: ${location.suburb || "Not listed"}`,
    `Local area: ${location.localArea || "Not listed"}`,
    `Operator: ${location.operator || "Not listed"}`,
    `Service type: ${location.type || "Not listed"}`,
    "",
    "Check opening hours, accepted items and access conditions with the facility before visiting."
  ];

  const bytes = new TextEncoder().encode(lines.join("\n"));
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

async function verifiedEmail(idToken, firebaseWebApiKey) {
  const accountResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseWebApiKey}`,
    {
      method: "POST",
      headers: responseHeaders,
      body: JSON.stringify({ idToken })
    }
  );

  if (!accountResponse.ok) {
    return null;
  }

  const account = await accountResponse.json();
  return account.users?.[0]?.email || null;
}

function validLocation(location) {
  return location
    && typeof location.name === "string"
    && location.name.trim().length > 0
    && location.name.length <= 180;
}

function safeLogValue(value) {
  return String(value || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\bSG\.[A-Za-z0-9._-]+\b/g, "[secret]")
    .replace(/Bearer\s+\S+/gi, "Bearer [secret]")
    .slice(0, 300);
}

export async function onRequestPost({ request, env }) {
  if (!env.SENDGRID_API_KEY || !env.SENDGRID_FROM_EMAIL || !env.FIREBASE_WEB_API_KEY) {
    return response({ message: "Email is not available yet." }, 503);
  }

  const authorization = request.headers.get("authorization") || "";
  const idToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!idToken) {
    return response({ message: "Please sign in before sending an email." }, 401);
  }

  let requestBody;

  try {
    requestBody = await request.json();
  } catch {
    return response({ message: "We could not prepare that email. Please try again." }, 400);
  }

  if (!validLocation(requestBody.location)) {
    return response({ message: "Choose a facility before sending an email." }, 400);
  }

  const recipient = await verifiedEmail(idToken, env.FIREBASE_WEB_API_KEY);

  if (!recipient) {
    return response({ message: "Please sign in again before sending an email." }, 401);
  }

  const location = requestBody.location;
  const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: {
        email: env.SENDGRID_FROM_EMAIL,
        name: "CircularLoop Melbourne"
      },
      personalizations: [{ to: [{ email: recipient }] }],
      subject: `Facility details: ${location.name}`,
      content: [{
        type: "text/plain",
        value: "Your facility details are attached. Check opening hours, accepted items and access conditions with the facility before visiting."
      }],
      attachments: [
        {
          filename: "circularloop-facility-details.txt",
          content: textAttachment(location),
          type: "text/plain"
        }
      ]
    })
  });

  if (sendGridResponse.status !== 202) {
    let errors = [];

    try {
      const errorBody = await sendGridResponse.json();
      if (Array.isArray(errorBody.errors)) {
        errors = errorBody.errors.slice(0, 3).map(({ field, message }) => ({
          field: safeLogValue(field),
          message: safeLogValue(message)
        }));
      }
    } catch {
      // The HTTP status is still useful when SendGrid returns a non-JSON body.
    }

    console.error("SendGrid mail send rejected", { status: sendGridResponse.status, errors });
    return response({ message: "We could not send your email right now. Please try again." }, 502);
  }

  return response({ message: "Your facility details have been emailed to you." });
}
