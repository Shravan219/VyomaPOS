// supabase/functions/sync-expense-to-sheets/index.ts
// Deno Edge Function: triggered by a Supabase Database Webhook on INSERT into public.expenses.
// Appends [Date/Time, Amount, Category, Notes, Receipt URL] to Google Sheets via Sheets API v4.
//
// Required secrets (supabase secrets set ...):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID
// Optional:
//   SHEET_RANGE (default "Sheet1!A:E")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getGoogleAccessToken(email: string, privateKey: string): Promise<string> {
  const normalizedKey = privateKey.replace(/\\n/g, "\n").trim();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const enc = new TextEncoder();
  const unsigned =
    `${base64UrlEncode(enc.encode(JSON.stringify(header)))}.` +
    `${base64UrlEncode(enc.encode(JSON.stringify(claim)))}`;

  const keyData = pemToArrayBuffer(normalizedKey);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, enc.encode(unsigned)),
  );
  const assertion = `${unsigned}.${base64UrlEncode(signature)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });

  if (!tokenRes.ok) {
    throw new Error(`Google OAuth failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const { access_token } = await tokenRes.json();
  if (!access_token) throw new Error("Google OAuth returned no access_token");
  return access_token as string;
}

interface ExpenseRecord {
  id?: string;
  created_at?: string;
  amount?: number | string;
  category?: string;
  notes?: string | null;
  receipt_url?: string | null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY");
    const spreadsheetId = Deno.env.get("SPREADSHEET_ID");
    const sheetRange = Deno.env.get("SHEET_RANGE") ?? "Sheet1!A:E";

    if (!serviceEmail || !privateKey || !spreadsheetId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing secrets: set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = await req.json().catch(() => ({}));
    // Database Webhook sends { type, table, schema, record, ... }; also accept raw record POSTs.
    const record: ExpenseRecord = payload?.record ?? payload?.data?.record ?? payload ?? {};

    const createdAt = record.created_at ?? new Date().toISOString();
    const formattedDate = new Date(createdAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const amount = record.amount ?? "";
    const category = record.category ?? "";
    const notes = record.notes ?? "";
    const receiptUrl = record.receipt_url ?? "";

    const accessToken = await getGoogleAccessToken(serviceEmail, privateKey);

    // NOTE: only the sheet title is URL-encoded — `!` and `:` must stay literal
    // or the Sheets API rejects the range.
    const [sheetTitle, sheetCells = "A:E"] = sheetRange.split("!");
    const encodedRange = `${encodeURIComponent(sheetTitle)}!${sheetCells}`;

    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append` +
        `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [[formattedDate, amount, category, notes, receiptUrl]],
        }),
      },
    );

    if (!appendRes.ok) {
      throw new Error(`Sheets append failed: ${appendRes.status} ${await appendRes.text()}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sync-expense-to-sheets]", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
