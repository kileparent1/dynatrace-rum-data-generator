#!/usr/bin/env node
/**
 * Get Mobile/Custom Application Configuration
 * Uses: GET /api/config/v1/applications/mobile/{id}
 */

const https = require('https');

// Configuration
const tenantUrl = 'https://YOUR_TENANT.live.dynatrace.com';
const applicationId = 'CUSTOM_APPLICATION-XXXXXXXXXXXXXXXX';
const apiToken = 'YOUR_API_TOKEN_HERE';

console.log('\n🔍 Fetching Mobile Application Configuration\n');
console.log(`Application ID: ${applicationId}`);
console.log(`Tenant: ${tenantUrl}\n`);

const url = new URL(tenantUrl);
const options = {
  hostname: url.hostname,
  path: `/api/config/v1/applications/mobile/${applicationId}`,
  method: 'GET',
  headers: {
    'Authorization': `Api-Token ${apiToken}`,
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const config = JSON.parse(data);
      console.log('✅ Application Configuration:\n');
      console.log(JSON.stringify(config, null, 2));
      
      console.log('\n📋 Key Settings:');
      console.log(`  Name: ${config.name}`);
      console.log(`  Type: ${config.applicationType}`);
      console.log(`  Session Percentage: ${config.costControlUserSessionPercentage}%`);
      
      if (config.beaconEndpointType) {
        console.log(`  Beacon Type: ${config.beaconEndpointType}`);
      }
      
      if (config.beaconEndpointUrl) {
        console.log(`  Beacon URL: ${config.beaconEndpointUrl}`);
      }
      
    } else {
      console.error(`\n❌ Failed to fetch configuration (HTTP ${res.statusCode})`);
      console.error(`Response: ${data}\n`);
    }
  });
});

req.on('error', (err) => {
  console.error('\n❌ Network error:', err.message);
});

req.setTimeout(15000, () => {
  console.error('\n❌ Request timeout');
  req.destroy();
});

req.end();
