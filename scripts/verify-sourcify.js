// Verifies the deployed contract on Sourcify (no API key needed).
// Usage: node scripts/verify-sourcify.js <network>   (e.g. base, sepolia)
const fs = require("fs");
const path = require("path");

const networkName = process.argv[2] || "base";
const root = path.join(__dirname, "..");
const deployment = JSON.parse(fs.readFileSync(path.join(root, `deployment.${networkName}.json`), "utf8"));
const stdJsonInput = JSON.parse(fs.readFileSync(path.join(root, "artifacts", "verify-input.json"), "utf8"));

async function main() {
  const url = `https://sourcify.dev/server/v2/verify/${deployment.chainId}/${deployment.contract}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stdJsonInput,
      compilerVersion: "0.8.28+commit.7893614a",
      contractIdentifier: "contracts/Nexiora.sol:Nexiora",
      creationTransactionHash: deployment.deployTx,
    }),
  });
  const body = await res.json().catch(() => ({}));
  console.log("HTTP", res.status, JSON.stringify(body, null, 2));
  if (res.status === 202 && body.verificationId) {
    // Poll for the result
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const jr = await fetch(`https://sourcify.dev/server/v2/verify/${body.verificationId}`);
      const job = await jr.json();
      if (job.isJobCompleted) {
        console.log("Job completed:", JSON.stringify(job, null, 2));
        return;
      }
      console.log("waiting for verification job...");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
