#!/usr/bin/env node
/**
 * Fix Dynatrace Custom Application for OpenKit
 * 
 * This script properly configures a custom application to accept OpenKit beacons.
 * Usage: node fix_openkit_application.js <config-file> <api-token>
 */

const https = require('https');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

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

async function getApplication(config, apiToken, appId) {
  const url = new URL(config.dynatrace.tenantUrl);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: `/api/config/v1/applications/mobile/${appId}`,
    method: 'GET',
    headers: {
      'Authorization': `Api-Token ${apiToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const { data } = await makeRequest(options);
    return data;
  } catch (error) {
    return null;
  }
}

async function deleteApplication(config, apiToken, appId) {
  const url = new URL(config.dynatrace.tenantUrl);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: `/api/config/v1/applications/mobile/${appId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Api-Token ${apiToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  try {
    await makeRequest(options);
    return true;
  } catch (error) {
    console.error(`Error deleting application: ${error.message}`);
    return false;
  }
}

async function createApplication(config, apiToken, appName) {
  const url = new URL(config.dynatrace.tenantUrl);
  
  const appConfig = {
    "name": appName,
    "applicationType": "CUSTOM_APPLICATION",
    "beaconEndpointType": "ENVIRONMENT_ACTIVE_GATE",
    "beaconEndpointUrl": `${config.dynatrace.tenantUrl}/mbeacon/${config.dynatrace.tenant}`,
    "costControlUserSessionPercentage": 100
  };
  
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
    console.error(`Error creating application: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  Fix Dynatrace Custom Application for OpenKit');
  console.log('='.repeat(70));
  
  const configPath = process.argv[2] || 'examples/harvard_pilgrim_config.json';
  const apiToken = process.argv[3];
  
  if (!apiToken) {
    console.error('\n❌ Error: API token required');
    console.error('Usage: node fix_openkit_application.js <config-file> <api-token>');
    console.error('\nThe API token needs WriteConfig and ReadConfig scopes.');
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
    console.log(`   Current App ID: ${config.dynatrace.applicationId}`);
  } catch (error) {
    console.error(`❌ Failed to load config: ${error.message}`);
    process.exit(1);
  }
  
  // Check if application exists
  console.log('\n🔍 Checking current application...');
  const existingApp = await getApplication(config, apiToken, config.dynatrace.applicationId);
  
  if (existingApp) {
    console.log(`✅ Found existing application: ${existingApp.name}`);
    console.log(`   Type: ${existingApp.applicationType}`);
    console.log(`   Session capture: ${existingApp.costControlUserSessionPercentage || 100}%`);
    
    if (existingApp.applicationType !== 'CUSTOM_APPLICATION') {
      console.log(`\n⚠️  WARNING: Application type is ${existingApp.applicationType}, not CUSTOM_APPLICATION`);
      console.log('   This explains why OpenKit can\'t connect!');
    }
  } else {
    console.log(`⚠️  Application ${config.dynatrace.applicationId} not found via API`);
    console.log('   (It might exist but not be accessible as a mobile/custom app)');
  }
  
  // Ask user what to do
  console.log('\n' + '='.repeat(70));
  console.log('Options:');
  console.log('1. Delete current application and create a new CUSTOM_APPLICATION');
  console.log('2. Just create a new CUSTOM_APPLICATION (keep existing)');
  console.log('3. Cancel');
  console.log('='.repeat(70));
  
  const choice = await question('\nEnter choice (1-3): ');
  
  if (choice === '1') {
    // Delete and recreate
    console.log('\n🗑️  Deleting old application...');
    const deleted = await deleteApplication(config, apiToken, config.dynatrace.applicationId);
    if (deleted) {
      console.log('✅ Application deleted');
    }
    
    console.log('\n🔨 Creating new CUSTOM_APPLICATION...');
    const newApp = await createApplication(config, apiToken, config.metadata.applicationName);
    if (newApp) {
      console.log(`✅ Application created successfully!`);
      console.log(`   New Application ID: ${newApp.id}`);
      console.log(`   Name: ${newApp.name}`);
      
      // Update config file
      config.dynatrace.applicationId = newApp.id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`\n✅ Config file updated with new Application ID`);
    }
  } else if (choice === '2') {
    // Just create new
    console.log('\n🔨 Creating new CUSTOM_APPLICATION...');
    const newApp = await createApplication(config, apiToken, config.metadata.applicationName + ' (New)');
    if (newApp) {
      console.log(`✅ Application created successfully!`);
      console.log(`   New Application ID: ${newApp.id}`);
      console.log(`   Name: ${newApp.name}`);
      
      // Update config file
      config.dynatrace.applicationId = newApp.id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`\n✅ Config file updated with new Application ID`);
    }
  } else {
    console.log('\n❌ Cancelled');
  }
  
  rl.close();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Done! You can now run:');
  console.log(`   node src/rum_session_generator.js ${configPath}`);
  console.log('='.repeat(70));
  console.log('');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
