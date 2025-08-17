// api.js
const axios = require("axios");
const url = process.env.SERVER_URL;

async function fetchQuestions() {
  try {
    const response = await axios.get(`${url}/questions/category/geography`);
    return response.data; 
  } catch (error) {
    console.log(error);
  }

  //   return response
}

module.exports = fetchQuestions;
