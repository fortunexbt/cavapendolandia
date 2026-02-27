import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(
  ROOT,
  "docs",
  "screenshots",
  "ux-audit-before",
);
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const offerings = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    media_type: "text",
    text_content: "Un animale che non conosco, ma che mi riconosce.",
    link_url: null,
    title: "Senza nome",
    note: "Traccia breve.",
    author_type: "anonymous",
    author_name: null,
    curatorial_note: "Ogni forma arriva prima della parola.",
    status: "approved",
    created_at: "2026-02-20T12:00:00.000Z",
    file_path: null,
    file_url: null,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    media_type: "link",
    text_content: null,
    link_url: "https://example.com/soglia",
    title: "Soglia",
    note: "Un'eco trovata.",
    author_type: "name",
    author_name: "ospite",
    curatorial_note: null,
    status: "approved",
    created_at: "2026-02-21T14:00:00.000Z",
    file_path: null,
    file_url: null,
  },
];

const startServer = () => {
  const child = spawn(
    "npm",
    ["run", "dev", "--", "--host", "127.0.0.1", "--port", `${PORT}`],
    {
      cwd: ROOT,
      stdio: "pipe",
      env: {
        ...process.env,
        VITE_SUPABASE_URL: "https://placeholder.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "placeholder-anon-key",
      },
    },
  );

  return child;
};

const waitForServer = async () => {
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return;
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Server did not start in time.");
};

const installRouteMocks = async (page) => {
  await page.route("**/rest/v1/offerings**", async (route) => {
    const request = route.request();
    if (request.method() !== "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
      return;
    }

    const url = new URL(request.url());
    const isDetailById = url.searchParams.get("id")?.includes("eq.");
    const isRandomIds = url.searchParams.get("select") === "id";
    const statusFilter = url.searchParams.get("status");

    if (isDetailById) {
      const idQuery = url.searchParams.get("id") || "";
      const id = idQuery.replace("eq.", "");
      const found = offerings.find((item) => item.id === id);
      await route.fulfill({
        status: found ? 200 : 406,
        contentType: "application/json",
        body: JSON.stringify(found ?? {}),
      });
      return;
    }

    if (isRandomIds) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(offerings.map((item) => ({ id: item.id }))),
      });
      return;
    }

    if (statusFilter?.includes("approved")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(offerings),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/storage/v1/object/sign/offerings/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ signedURL: "/mock-signed-url" }),
    });
  });
};

const capture = async () => {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

  const d = await desktop.newPage();
  const m = await mobile.newPage();
  await installRouteMocks(d);
  await installRouteMocks(m);

  await d.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await d.screenshot({ path: path.join(OUTPUT_DIR, "01-desktop-soglia.png"), fullPage: true });

  await d.goto(`${BASE_URL}/entra`, { waitUntil: "networkidle" });
  await d.screenshot({ path: path.join(OUTPUT_DIR, "02-desktop-entra-vaga.png"), fullPage: true });
  await d.getByRole("button", { name: "Silenzio" }).click();
  await d.waitForTimeout(300);
  await d.screenshot({ path: path.join(OUTPUT_DIR, "03-desktop-entra-silenzio.png"), fullPage: true });

  await d.goto(`${BASE_URL}/o/11111111-1111-1111-1111-111111111111`, { waitUntil: "networkidle" });
  await d.screenshot({ path: path.join(OUTPUT_DIR, "04-desktop-dettaglio.png"), fullPage: true });

  await d.goto(`${BASE_URL}/offri`, { waitUntil: "networkidle" });
  await d.screenshot({ path: path.join(OUTPUT_DIR, "05-desktop-offri-step1.png"), fullPage: true });
  await d.getByRole("button", { name: "Testo" }).click();
  await d.getByRole("button", { name: "avanti" }).click();
  await d.waitForTimeout(250);
  await d.screenshot({ path: path.join(OUTPUT_DIR, "06-desktop-offri-step2.png"), fullPage: true });

  await d.fill("textarea", "Frammento di prova");
  await d.getByRole("button", { name: "avanti" }).click();
  await d.getByRole("button", { name: "avanti" }).click();
  await d.getByRole("button", { name: "avanti" }).click();
  await d.waitForTimeout(250);
  await d.screenshot({ path: path.join(OUTPUT_DIR, "07-desktop-offri-step5.png"), fullPage: true });

  await m.goto(`${BASE_URL}/che-cose`, { waitUntil: "networkidle" });
  await m.screenshot({ path: path.join(OUTPUT_DIR, "08-mobile-che-cose.png"), fullPage: true });

  await m.goto(`${BASE_URL}/regole`, { waitUntil: "networkidle" });
  await m.screenshot({ path: path.join(OUTPUT_DIR, "09-mobile-regole.png"), fullPage: true });

  await m.goto(`${BASE_URL}/entra`, { waitUntil: "networkidle" });
  await m.screenshot({ path: path.join(OUTPUT_DIR, "10-mobile-entra-vaga.png"), fullPage: true });

  await desktop.close();
  await mobile.close();
  await browser.close();
};

const run = async () => {
  const server = startServer();
  let stdout = "";
  let stderr = "";
  server.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    await capture();
    console.log(`Screenshots saved in ${OUTPUT_DIR}`);
  } finally {
    server.kill("SIGTERM");
    if (stderr.trim()) {
      console.error(stderr);
    }
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
