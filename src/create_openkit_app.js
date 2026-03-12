#!/usr/bin/env node
/**
 * Create Dynatrace Custom Application for OpenKit
 */

const https = require('https');
const fs = require('fs');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ statusCode: res.statusCode, data: body ? JSON.parse(body) : null });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: body });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createApplication(config, apiToken) {
  const url = new URL(config.dynatrace.tenantUrl);
  
  const appConfig = {
    "name": config.metadata.applicationName + " (OpenKit Fixed)",
    "applicationType": "CUSTOM_APPLICATION",
    "costControlUserSessionPercentage": 100
  };
  
  console.log('\n📋 Application Configuration (using default beacon endpoint):');
  console.log(JSON.stringify(appConfig, null, 2));
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: '/api/config/v1/applications/mobile',
    method: 'POST',
    headers: {
      'Authorization': `Api-Token ${apiToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(appConfig))
    }
  };
  
  try {
    const { data } = await makeRequest(options, appConfig);
    return data;
  } catch (error) {
    console.error(`\n❌ Error creating application: ${error.message}`);
    return null;
  }
}

async function main() {
  const configPath = process.argv[2] || 'examples/harvard_pilgrim_config.json';
  const apiToken = process.argv[3];
  
  if (!apiToken) {
    console.error('\n❌ Error: API token required');
    console.error('Usage: node create_openkit_app.js <config-file> <api-token>');
    process.exit(1);
  }
  
  // Load config
  let config;
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
    console.log(`\n✅ Configuration loaded: ${configPath}`);
    console.log(`   Business: ${config.metadata.businessName}`);
    console.log(`   Application: ${config.metadata.applicationName}`);
  } catch (error) {
    console.error(`❌ Failed to load config: ${error.message}`);
    process.exit(1);
  }
  
  // Create application
  console.log('\n🔨 Creating new CUSTOM_APPLICATION for OpenKit...');
  const newApp = await createApplication(config, apiToken);
  
  if (newApp && newApp.id) {
    console.log(`\n✅ Application created successfully!`);
    console.log(`   Application ID: ${newApp.id}`);
    console.log(`   Name: ${newApp.name}`);
    
    // Update config file
    config.dynatrace.applicationId = newApp.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n✅ Config file updated with new Application ID`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 Success! You can now run:');
    console.log(`   node src/rum_session_generator.js ${configPath}`);
    console.log('='.repeat(70));
  } else {
    console.log('\n❌ Failed to create application');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
