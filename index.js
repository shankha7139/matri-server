const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cloudinary = require("./Cloudinary");
const fs = require("fs");
const axios = require("axios");

require("dotenv").config();
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, "public")));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  next();
});

app.use(express.json());


app.post("/api/generate-captcha", async (req, res) => {
  const captchaUrl =
    "https://tathya.uidai.gov.in/audioCaptchaService/api/captcha/v3/generation";
  const captchaHeaders = {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    Origin: "https://myaadhaar.uidai.gov.in",
    Referer: "https://myaadhaar.uidai.gov.in/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
  };
  const captchaData = {
    captchaLength: "6",
    captchaType: "2",
    audioCaptchaRequired: true,
  };

  try {
    console.log("Sending request to UIDAI API...");
    const response = await axios.post(captchaUrl, captchaData, {
      headers: captchaHeaders,
    });
    console.log("Response received:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({
        error: "Failed to generate captcha",
        details: error.message
      });
  }
});
app.post("/api/verify-aadhaar", async (req, res) => {
  const {
    aadhaar_number,
    transaction_id,
    captcha
  } = req.body;
  const verifyUidUrl =
    "https://tathya.uidai.gov.in/uidVerifyRetrieveService/api/verifyUID";
  const verifyUidHeaders = {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "verifyAadhaar_IN",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    Origin: "https://myaadhaar.uidai.gov.in",
    Referer: "https://myaadhaar.uidai.gov.in/",
    "User-Agent": "Mozilla/5.0",
  };
  const verifyUidData = {
    uid: aadhaar_number,
    captchaTxnId: transaction_id,
    captcha: captcha,
    transactionId: transaction_id,
    captchaLogic: "V3",
  };

  try {
    const response = await axios.post(verifyUidUrl, verifyUidData, {
      headers: verifyUidHeaders,
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to verify Aadhaar"
    });
  }
});

app.listen(8008);