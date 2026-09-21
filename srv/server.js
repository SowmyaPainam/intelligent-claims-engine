// Main Server Entry Point

const cds = require('@sap/cds');
require('dotenv').config();

console.log('🚀 Starting Intelligent Claims Engine...');
console.log(`📅 Time: ${new Date().toISOString()}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

cds.on('served', () => {
  console.log('\n✅ Intelligent Claims Engine is running!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 API Server: http://localhost:4004`);
  console.log(`📖 OData API:  http://localhost:4004/odata/`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

cds.on('error', (err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

module.exports = cds.server;