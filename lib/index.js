require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises; 
const SESSIONS_API_URL = process.env.SESSIONS_API_URL;
const SESSIONS_API_KEY = process.env.SESSIONS_API_KEY;

function malvinId(num = 22) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  
  for (let i = 2; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return `mrntando~${result}`;
}

async function downloadCreds(sessionId) {  
  try {
    if (!sessionId.startsWith('mrntando~')) {
      throw new Error('Invalid SESSION_ID: It must start with "kayboy~"');
    }

    const response = await axios.get(
      `${SESSIONS_API_URL}/api/downloadCreds.php/${sessionId}`,
      {
        headers: { 'x-api-key': SESSIONS_API_KEY },
        timeout: 10000
      }
    );

    if (!response.data?.credsData) {
      throw new Error('No sessionData received from database');
    }

    return typeof response.data.credsData === 'string' 
      ? JSON.parse(response.data.credsData)
      : response.data.credsData;
  } catch (error) {
    console.error('Download Error:', error.response?.data || error.message);
    throw error;
  }
}

async function removeFile(filePath) {
  try {
    await fs.access(filePath);
    await fs.rm(filePath, { recursive: true, force: true });
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Remove Error:', error.message);
    }
    return false;
  }
}

module.exports = { 
  downloadCreds, 
  removeFile, 
  malvinId 
};
