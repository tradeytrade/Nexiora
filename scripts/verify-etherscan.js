// Verifies the deployed contract on Etherscan-family explorers (Basescan, etc.)
// via the Etherscan API v2. Requires a free API key from https://etherscan.io/myapikey
// Usage: ETHERSCAN_API_KEY=<key> node scripts/verify-etherscan.js <network>   (e.g. base, sepolia)
const fs = require("fs");
const path = require("path");

const networkName = process.argv[2] || "base";
const apiKey = process.env.ETHERSCAN_API_KEY;
if (!apiKey) {
  console.error("Set ETHERSCAN_API_KEY (free key from https://etherscan.io/myapikey)");
  process.exit(1);
}

const root = path.join(__dirname, "..");
const deployment = JSON.parse(fs.readFileSync(path.join(root, `deployment.${networkName}.json`), "utf8"));
const stdJsonInput = fs.readFileSync(path.join(root, "artifacts", "verify-input.json"), "utf8");

const API = "https://api.etherscan.io/v2/api";

// Etherscan v2 requires chainid in the query string (not the POST body)
async function call(params) {
  const url = `${API}?chainid=${deployment.chainId}`;
  const body = new URLSearchParams({ ...params, apikey: apiKey });
  const res = await fetch(url, { method: "POST", body });
  return res.json();
}

async function main() {
  const submit = await call({
    module: "contract",
    action: "verifysourcecode",
    codeformat: "solidity-standard-json-input",
    sourceCode: stdJsonInput,
    contractaddress: deployment.contract,
    contractname: "contracts/Nexiora.sol:Nexiora",
    compilerversion: "v0.8.28+commit.7893614a",
  });
  console.log("Submitted:", JSON.stringify(submit));
  if (submit.status !== "1") return;

  const guid = submit.result;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const check = await call({ module: "contract", action: "checkverifystatus", guid });
    console.log("Status:", JSON.stringify(check));
    if (check.result !== "Pending in queue") return;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
