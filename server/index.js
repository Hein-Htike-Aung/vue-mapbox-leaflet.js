const express = require("express");
const cors = require("cors");
const axios = require("axios");
const url = require("url");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// init express
const app = express();

// enable cors
app.use(cors());

// routes
app.get("/api/search/:query", async (req, res) => {
  try {
    // add api key & query strings
    const params = new URLSearchParams({
      access_token: process.env.API_KEY,
      ...url.parse(req.url, true).query,
    });

    console.log(params)

    const query = req.params.query;

    const result = await axios(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params}`
    );

    const data = result.data;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`app is running on PORT: ${PORT}`));
