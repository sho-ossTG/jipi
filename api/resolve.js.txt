const C_BASE_URL = process.env.C_BASE_URL || "";

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    if (!C_BASE_URL) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing C_BASE_URL" }));
      return;
    }

    const inputUrl = String(req.query.url || "");
    if (!inputUrl) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing url parameter" }));
      return;
    }

    const u = new URL("/api/resolve", C_BASE_URL);
    u.searchParams.set("url", inputUrl);

    const r = await fetch(u.toString());
    const text = await r.text();

    res.statusCode = r.status;
    res.setHeader("Content-Type", "application/json");
    res.end(text);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Broker failed" }));
  }
};