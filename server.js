import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CALLBACK_SCHEME = "auroranest"; // must match your app's Settings and URL Types
const CALLBACK_URL = `${CALLBACK_SCHEME}://callback`;

// Health check
app.get("/", (req, res) => {
  res.type("text/plain").send("Aurora Link Backend is running");
});

// Quick test: immediately return to the app with a fake token
app.get("/test-link", (req, res) => {
  res.type("html").send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${CALLBACK_URL}?access_token=TEST123">
      </head>
      <body>Redirecting back to the app…</body>
    </html>
  `);
});

// Create a Teller Link session, then redirect the user to Teller's Link URL
app.get("/link", async (req, res) => {
  try {
    const apiKey = process.env.TELLER_API_KEY;
    if (!apiKey) {
      return res.status(500).type("text/plain").send("Server missing TELLER_API_KEY");
    }

    const createResp = await fetch("https://api.teller.io/link_sessions", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${apiKey}:`).toString("base64"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        products: ["accounts", "transactions"],
        redirect_uri: CALLBACK_URL
      })
    });

    const text = await createResp.text();
    if (!createResp.ok) {
      return res.status(502).type("text/plain").send("Teller error:\n" + text);
    }

    // Teller returns JSON; find the field that contains the launch URL.
    // Adjust the field name if Teller uses a different one in your account.
    let data;
    try { data = JSON.parse(text); } catch { /* ignore */ }

    const linkUrl = data?.url || data?.link_url || data?.launch_url || data?.href;
    if (!linkUrl) {
      return res.status(500).type("text/plain").send("No link URL returned by Teller. Response:\n" + text);
    }

    // Redirect the browser straight to Teller Link
    res.redirect(linkUrl);
  } catch (e) {
    res.status(500).type("text/plain").send("Server error: " + e.message);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port", port);
});
