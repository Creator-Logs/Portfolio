// Steering-wheel page posters (LCP, reduced motion, no-WebGL, context loss), captured from the live scenes so the
// poster -> 3D crossfade is seamless (3D_GUIDE §1.4). Run via scripts/posters-steering-wheel.sh (site running).
// ?poster hides the page DOM (visibility only, so Views keep their boxes) and renders at 2x DPR; each block is
// scrolled into its poster state and screenshot by element.
const { chromium, devices } = require(process.env.PW || "playwright");

const base = process.env.BASE || "http://localhost:3000";
const out = process.argv[2];
const shots = [
  // name, context, block selector, where to scroll: "top" | "end" (pinned section fully played) | "center"
  { name: "hero", ctx: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, sel: "section[aria-labelledby=wheel-title]", at: "top" },
  { name: "hero-mobile", ctx: { ...devices["Galaxy S8"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 }, sel: "section[aria-labelledby=wheel-title]", at: "top" },
  { name: "exploded", ctx: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, sel: "#stack-up [data-explore]", at: "end", section: "#stack-up" },
  { name: "fea", ctx: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, sel: "#proving-it .cursor-grab", at: "center", wait: 6000 },
];

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: false, args: ["--window-position=-2400,0"] });
  for (const s of shots) {
    const page = await (await browser.newContext(s.ctx)).newPage();
    await page.goto(`${base}/projects/steering-wheel?poster`);
    await page.waitForTimeout(4000);
    await page.evaluate(({ sel, at, section }) => {
      const el = document.querySelector(sel);
      if (at === "end") {
        const sec = document.querySelector(section);
        scrollTo(0, sec.getBoundingClientRect().top + scrollY + sec.offsetHeight - innerHeight);
      } else if (at === "center") el.scrollIntoView({ block: "center" });
      else scrollTo(0, 0);
    }, s);
    await page.waitForTimeout(s.wait ?? 5000);
    // poster mode hides the page DOM, and Playwright won't screenshot hidden elements: clip to the box instead
    const box = await page.evaluate((sel) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      return { x: r.left, y: Math.max(0, r.top), width: r.width, height: Math.min(r.height, innerHeight - Math.max(0, r.top)) };
    }, s.sel);
    await page.screenshot({ path: `${out}/${s.name}.png`, clip: box });
    console.log(s.name);
    await page.close();
  }
  await browser.close();
})();
