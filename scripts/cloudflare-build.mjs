import { execSync } from "node:child_process";

// Wrapper so Cloudflare's `npm run build` produces the worker bundle
// without infinite recursion:
//
// - opennextjs-cloudflare internally runs `npm run build`
//   with NEXT_PRIVATE_STANDALONE=true set.
// - If we made `build` = `opennextjs-cloudflare build` directly,
//   it would call itself forever.
// - Instead: when that env var is present we are the INNER call,
//   so just run `next build`. Otherwise we are the OUTER call
//   (Cloudflare dashboard / local), so delegate to opennext,
//   which will re-enter this script once for the inner Next build.
const isInnerBuild = process.env.NEXT_PRIVATE_STANDALONE === "true";

const command = isInnerBuild
  ? "npx next build"
  : "npx opennextjs-cloudflare build";

console.log(`[build] ${isInnerBuild ? "inner" : "outer"} build: ${command}`);

execSync(command, { stdio: "inherit" });
