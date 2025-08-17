// api.js
const axios = require("axios");
const url = process.env.SERVER_URL;

async function fetchQuestions() {
  try {
    const response = await axios.get(`${url}/questions/category/geography`);
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format");
    }
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = fetchQuestions;
