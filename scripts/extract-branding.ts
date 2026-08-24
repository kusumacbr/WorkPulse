import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import Vibrant from "node-vibrant";

const LOGO_URL = "https://www.xorstack.com/xorstack_old/images/xor.png";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const LOGO_PATH = path.join(PUBLIC_DIR, "logo.png");
const GLOBALS_CSS_PATH = path.join(process.cwd(), "src", "app", "globals.css");

// Fallback color: Dark Slate
const FALLBACK_COLOR = {
  hex: "#0f172a",
  rgb: "15, 23, 42",
  foreground: "#ffffff",
};

async function downloadLogo(url: string, dest: string): Promise<Buffer> {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download logo. Status code: ${res.statusCode}`));
      }

      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(dest, buffer);
        console.log(`[Branding] Successfully downloaded official logo to ${dest}`);
        resolve(buffer);
      });
    });

    req.on("error", (err) => reject(err));
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number; rgbString: string } {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return { r, g, b, rgbString: `${r}, ${g}, ${b}` };
}

function getAccessibleForeground(r: number, g: number, b: number): string {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}

function updateGlobalsCss(color: { hex: string; rgb: string; foreground: string }) {
  const cssDir = path.dirname(GLOBALS_CSS_PATH);
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }

  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Extracted Brand Primary Color from Xorstack Logo */
  --brand-primary: ${color.hex};
  --brand-primary-rgb: ${color.rgb};
  --brand-primary-foreground: ${color.foreground};

  --primary: var(--brand-primary);
  --primary-foreground: var(--brand-primary-foreground);

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: var(--brand-primary);

  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;

  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;

  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;

  --brand-primary: ${color.hex};
  --brand-primary-rgb: ${color.rgb};
  --brand-primary-foreground: ${color.foreground};

  --primary: var(--brand-primary);
  --primary-foreground: var(--brand-primary-foreground);

  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;

  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: var(--brand-primary);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
`;

  fs.writeFileSync(GLOBALS_CSS_PATH, cssContent, "utf-8");
  console.log(
    `[Branding] Successfully updated globals.css with brand color: ${color.hex} (RGB: ${color.rgb}, FG: ${color.foreground})`
  );
}

async function main() {
  console.log(`[Branding] Starting logo download and color extraction...`);
  try {
    try {
      await downloadLogo(LOGO_URL, LOGO_PATH);
    } catch (dlErr) {
      console.warn(`[Branding Warning] Logo download failed: ${(dlErr as Error).message}`);
      if (!fs.existsSync(LOGO_PATH)) {
        console.warn(`[Branding Warning] No local logo found. Using fallback dark slate.`);
        updateGlobalsCss(FALLBACK_COLOR);
        return;
      }
    }

    const palette = await Vibrant.from(LOGO_PATH).getPalette();
    const dominantSwatch =
      palette.Vibrant || palette.DarkVibrant || palette.Muted || palette.LightVibrant;

    if (!dominantSwatch) {
      throw new Error("No prominent vibrant swatch extracted.");
    }

    const hex = dominantSwatch.hex;
    const { r, g, b, rgbString } = hexToRgb(hex);
    const foreground = getAccessibleForeground(r, g, b);

    console.log(`[Branding] Extracted Brand Swatch: ${hex} (RGB: ${rgbString})`);
    updateGlobalsCss({ hex, rgb: rgbString, foreground });
  } catch (err) {
    console.warn(
      `[Branding Warning] Extraction error: ${(err as Error).message}. Using fallback color ${FALLBACK_COLOR.hex}`
    );
    updateGlobalsCss(FALLBACK_COLOR);
  }
}

main();
