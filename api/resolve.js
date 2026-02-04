const C_BASE_URL = process.env.C_BASE_URL || "";

/*
  Episode -> Google Drive FILE_ID mapping
  Example episode key: "tt0388629:1:1" (One Piece S1E1)
  Paste your Drive file IDs here.
*/
const EPISODE_TO_DRIVE_FILE_ID = {
  // "tt0388629:1:1": "PASTE_FILE_ID_HERE"
};

function buildDriveUrl(fileId) {
  // Use the "file view" format (more compatible than uc?export=download)
  return "https://drive.google.com/file/d/" + encodeURIComponent(fileId) + "/view";
}

async function callCResolve(inputUrl) {
  let base = String(C_BASE_URL || "").trim();
  if (!base) throw new Error("Missing C_BASE_URL");
  if (!base.startsWith("http://") && !base.startsWith("https://")) base = "https://" + base;

  const u = new URL("/api/resolve", base);
  u.searchParams.set("url", inputUrl);

  const r = await fetch(u.toString(), { method: "GET" });
  const text = await r.text();
  return { status: r.status, text };
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    const directUrl = String(req.query.url || "").trim();
    const episode = String(req.query.episode || "").trim();

    if (!directUrl && !episode) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing url or episode parameter" }));
      return;
    }

    let inputUrl = directUrl;

    if (!inputUrl && episode) {
      const fileId = EPISODE_TO_DRIVE_FILE_ID[episode];
      if (!fileId) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Unknown episode", episode }));
        return;
      }
      inputUrl = buildDriveUrl(fileId);
    }

    const { status, text } = await callCResolve(inputUrl);

    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(text);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Broker failed",
        detail: String(e && e.message ? e.message : e).slice(0, 900)
      })
    );
  }
};
