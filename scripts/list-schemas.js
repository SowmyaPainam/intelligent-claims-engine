require('dotenv').config();
const axios = require('axios');

async function main() {
  const tokenResp = await axios.post(`${process.env.DIE_UAA_URL}/oauth/token`, null, {
    params: { grant_type: 'client_credentials' },
    auth: { username: process.env.DIE_CLIENT_ID, password: process.env.DIE_CLIENT_SECRET }
  });
  const token = tokenResp.data.access_token;

  const resp = await axios.get(`${process.env.DIE_SERVICE_URL}/document-information-extraction/v1/schemas`, {
  headers: { Authorization: `Bearer ${token}` },
  params: { clientId: 'default' }
});
  console.log(JSON.stringify(resp.data, null, 2));
}

main().catch((err) => {
  console.error('Error:', err.message);
  if (err.response) {
    console.error('Status:', err.response.status);
    console.error('Data:', JSON.stringify(err.response.data, null, 2));
  }
});
