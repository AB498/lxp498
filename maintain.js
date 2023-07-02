// // Access command-line arguments
// const args = process.argv.slice(2);

// // Log the command-line arguments
// console.log("Command-line arguments:", args);
const { join, resolve } = require("path");
const fs = require("fs");
const os = require("os");

// Function to resolve the ~ directory
function resolveHomeDirectory(dirPath) {
  if (dirPath.startsWith("~/")) {
    const homeDir = os.homedir();
    return dirPath.replace(/^~(?=$|\/|\\)/, homeDir);
  }
  return dirPath;
}

// Access command-line argument
const jsonArg = process.argv[2];

// Parse the JSON argument
const jsonData = JSON.parse(jsonArg);

// Log the parsed JSON data
let rootDirectory = resolveHomeDirectory("~/lxp498");

if (!fs.existsSync(join(rootDirectory, "maintenance.json"))) {
  fs.writeFileSync(join(rootDirectory, "maintenance.json"), JSON.stringify({}));
}
if (jsonData.server) {
  let maintenanceData = JSON.parse(
    fs.readFileSync(join(rootDirectory, "maintenance.json"))
  );
  fs.writeFileSync(
    join(rootDirectory, "maintenance.json"),
    JSON.stringify({ ...maintenanceData, server: jsonData.server })
  );
}
if (jsonData.client) {
  let maintenanceData = JSON.parse(
    fs.readFileSync(join(rootDirectory, "maintenance.json"))
  );
  fs.writeFileSync(
    join(rootDirectory, "maintenance.json"),
    JSON.stringify({ ...maintenanceData, client: jsonData.client })
  );
}
