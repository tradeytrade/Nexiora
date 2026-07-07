// Compiles contracts/Nexiora.sol with solc, resolving OpenZeppelin imports
// from node_modules. Writes ABI, bytecode, metadata and the exact standard
// JSON input (needed for Etherscan/Sourcify verification) to artifacts/.
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "contracts", "Nexiora.sol"), "utf8");

const input = {
  language: "Solidity",
  sources: {
    "contracts/Nexiora.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object", "metadata"] },
    },
  },
};

function findImport(importPath) {
  const candidate = path.join(root, "node_modules", importPath);
  if (fs.existsSync(candidate)) {
    return { contents: fs.readFileSync(candidate, "utf8") };
  }
  return { error: "File not found: " + importPath };
}

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));

const errors = (output.errors || []).filter((e) => e.severity === "error");
if (errors.length) {
  for (const e of errors) console.error(e.formattedMessage);
  process.exit(1);
}
for (const e of output.errors || []) console.warn(e.formattedMessage);

// Embed the resolved OpenZeppelin sources so the standard JSON input is
// self-contained for verification.
const verifyInput = JSON.parse(JSON.stringify(input));
const meta = JSON.parse(output.contracts["contracts/Nexiora.sol"].Nexiora.metadata);
for (const src of Object.keys(meta.sources)) {
  if (!verifyInput.sources[src]) {
    verifyInput.sources[src] = { content: findImport(src).contents };
  }
}

const contract = output.contracts["contracts/Nexiora.sol"].Nexiora;
const artifactsDir = path.join(root, "artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });
fs.writeFileSync(path.join(artifactsDir, "Nexiora.abi.json"), JSON.stringify(contract.abi, null, 2));
fs.writeFileSync(path.join(artifactsDir, "Nexiora.bin"), contract.evm.bytecode.object);
fs.writeFileSync(path.join(artifactsDir, "Nexiora.metadata.json"), contract.metadata);
fs.writeFileSync(path.join(artifactsDir, "verify-input.json"), JSON.stringify(verifyInput, null, 2));

console.log("Compiled OK with solc", solc.version());
console.log("Bytecode size:", contract.evm.bytecode.object.length / 2, "bytes");
