const express = require("express");
const bodyParser = require("body-parser");
const { getJSONData, storeJSONData } = require("./db");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  // Attach CORS headers
  // Required when using a detached backend (that runs on a different domain)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/:resource", async (req, res, next) => {
  try {
    const storedData = await getJSONData();
    const { resource } = req.params;
    res.status(200).json(storedData[resource] || {});
  } catch (error) {
    next(error);
  }
});

app.get("/:resource/:id", async (req, res, next) => {
  try {
    const storedData = await getJSONData();
    const { resource, id } = req.params;
    const data = storedData[resource] || [];
    const item = data.find((item) => item.id === id);
    if (item) res.status(200).json(item);
    res.status(404).json({ message: "Resource not found" });
  } catch (error) {
    next(error);
  }
});

app.post("/:resource", async (req, res, next) => {
  try {
    const storedData = await getJSONData();
    const { resource } = req.params;
    const newData = req.body;
    newData.id = String([...storedData[resource]].length + 1);
    storedData[resource] = [...(storedData[resource] || []), newData];
    await storeJSONData(storedData);
    res.status(201).json(newData);
  } catch (error) {
    next(error);
  }
});

app.put("/:resource/:id", async (req, res, next) => {
  try {
    const storedData = await getJSONData();
    const { resource, id } = req.params;
    const updatedData = req.body;
    const index = (storedData[resource] || []).findIndex(
      (item) => item.id === Number(id)
    );
    if (index !== -1) {
      storedData[resource][index] = { ...updatedData, id };
      await storeJSONData(storedData);
      res.json(storedData[resource][index]);
    } else {
      res.status(404).json({ message: "Resource not found" });
    }
  } catch (error) {
    next(error);
  }
});

app.delete("/:resource/:id", async (req, res, next) => {
  try {
    const storedData = await getJSONData();
    const { resource, id } = req.params;
    storedData[resource] = (storedData[resource] || []).filter(
      (item) => item.id !== id
    );
    await storeJSONData(storedData);
    res.json({ message: "Resource deleted.", resourceId: id });
  } catch (error) {
    next(error);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
