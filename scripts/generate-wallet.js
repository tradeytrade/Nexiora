// Generates a fresh throwaway deployer wallet and saves it to
// .deployer.json (gitignored). This wallet only ever holds a little gas ETH,
// never the tokens, so the user's real keys are never exposed.
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const file = path.join(__dirname, "..", ".deployer.json");
if (fs.existsSync(file)) {
  const existing = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log("Deployer wallet already exists:", existing.address);
  process.exit(0);
}

const wallet = ethers.Wallet.createRandom();
fs.writeFileSync(file, JSON.stringify({ address: wallet.address, privateKey: wallet.privateKey }, null, 2));
console.log("New deployer wallet:", wallet.address);
