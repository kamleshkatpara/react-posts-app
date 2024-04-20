const fs = require("node:fs/promises");

async function getJSONData() {
  try {
    const rawFileContent = await fs.readFile("db.json", { encoding: "utf-8" });
    return JSON.parse(rawFileContent);
  } catch (error) {
    console.error("Error reading data from file:", error);
    return {};
  }
}

async function storeJSONData(data) {
  try {
    await fs.writeFile("db.json", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error storing data to file:", error);
  }
}

exports.getJSONData = getJSONData;
exports.storeJSONData = storeJSONData;
