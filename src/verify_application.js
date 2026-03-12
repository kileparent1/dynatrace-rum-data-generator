#!/usr/bin/env node
/**
 * Dynatrace Custom Application Verification Tool
 * 
 * This script verifies that a Custom Application exists and is properly configured
 * for OpenKit instrumentation.
 */

const https = require('https');
const fs = require('fs');

/**
 * Make HTTPS request to Dynatrace API
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Verify beacon endpoint
 */
async function verifyBeacon(config) {
  console.log('\n📡 Testing Beacon Endpoint');
  console.log('-'.repeat(70));
  
  try {
    const url = new URL(config.dynatrace.beaconUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'HEAD',
      timeout: 5000
    };
    
    const { statusCode } = await makeRequest(options);
    console.log(`✅ Beacon endpoint is accessible (HTTP ${statusCode})`);
    console.log(`   URL: ${config.dynatrace.beaconUrl}`);
    return true;
  } catch (error) {
    console.error(`❌ Beacon endpoint is not accessible`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Try to get application info via Settings API v2
 */
async function verifyApplicationSettings(config, apiToken) {
  console.log('\n🔍 Checking Application Configuration (Settings API)');
  console.log('-'.repeat(70));
  
  if (!apiToken) {
    console.log('⚠️  No API token provided - skipping API verification');
    console.log('   To verify via API, run: node src/verify_application.js <config.json> <api-token>');
    return null;
  }
  
  try {
    const url = new URL(config.dynatrace.tenantUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/api/v2/settings/objects?schemaIds=builtin:rum.web.app.detection.rules',
      method: 'GET',
      headers: {
        'Authorization': `Api-Token ${apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    const { data } = await makeRequest(options);
    console.log(`✅ API access successful`);
    console.log(`   Found ${data.items?.length || 0} application detection rules`);
    
    // Try to find our application
    const appRule = data.items?.find(item => 
      item.value?.applicationId === config.dynatrace.applicationId
    );
    
    if (appRule) {
      console.log(`✅ Found application configuration`);
      console.log(`   Application ID: ${appRule.value.applicationId}`);
      console.log(`   Name: ${appRule.value.applicationName || 'N/A'}`);
    } else {
      console.log(`⚠️  Could not find application with ID: ${config.dynatrace.applicationId}`);
    }
    
    return data;
  } catch (error) {
    console.log(`⚠️  Could not verify via Settings API: ${error.message}`);
    console.log('   This might be a permissions issue or the application might be a Mobile/Custom app');
    return null;
  }
}

/**
 * Check if application is a mobile/custom application
 */
async function verifyMobileApplication(config, apiToken) {
  console.log('\n📱 Checking Mobile/Custom Application');
  console.log('-'.repeat(70));
  
  if (!apiToken) {
    console.log('⚠️  No API token provided - skipping');
    return null;
  }
  
  try {
    const url = new URL(config.dynatrace.tenantUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: `/api/config/v1/applications/mobile/${config.dynatrace.applicationId}`,
      method: 'GET',
      headers: {
        'Authorization': `Api-Token ${apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    const { data } = await makeRequest(options);
    console.log(`✅ Found Mobile/Custom Application`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Application Type: ${data.applicationType}`);
    console.log(`   Cost Control User Session Percentage: ${data.costControlUserSessionPercentage}%`);
    
    if (data.costControlUserSessionPercentage < 100) {
      console.log(`   ⚠️  WARNING: Session capture is limited to ${data.costControlUserSessionPercentage}%`);
      console.log(`       Some sessions may not be captured!`);
    }
    
    return data;
  } catch (error) {
    console.log(`❌ Could not retrieve Mobile/Custom Application: ${error.message}`);
    console.log(`   Make sure the Application ID is correct: ${config.dynatrace.applicationId}`);
    return null;
  }
}

/**
 * Main verification function
 */
async function verifyApplication(configPath, apiToken) {
  console.log('\n' + '='.repeat(70));
  console.log('  Dynatrace Custom Application Verification');
  console.log('='.repeat(70));
  
  // Load config
  let config;
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
    console.log(`\n✅ Configuration loaded: ${configPath}`);
    console.log(`   Business: ${config.metadata.businessName}`);
    console.log(`   Application: ${config.metadata.applicationName}`);
    console.log(`   Tenant: ${config.dynatrace.tenant}`);
    console.log(`   Application ID: ${config.dynatrace.applicationId}`);
  } catch (error) {
    console.error(`❌ Failed to load config: ${error.message}`);
    process.exit(1);
  }
  
  // Run verification checks
  const beaconOk = await verifyBeacon(config);
  await verifyApplicationSettings(config, apiToken);
  const mobileApp = await verifyMobileApplication(config, apiToken);
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('  Verification Summary');
  console.log('='.repeat(70));
  
  if (beaconOk) {
    console.log('✅ Beacon endpoint is accessible');
  } else {
    console.log('❌ Cannot reach beacon endpoint');
  }
  
  if (mobileApp) {
    console.log('✅ Mobile/Custom Application exists in Dynatrace');
    if (mobileApp.costControlUserSessionPercentage === 100) {
      console.log('✅ Session capture is set to 100%');
    } else {
      console.log(`⚠️  Session capture is limited to ${mobileApp.costControlUserSessionPercentage}%`);
    }
  } else {
    console.log('❌ Could not verify Mobile/Custom Application');
    console.log('   Possible reasons:');
    console.log('   1. Application ID is incorrect');
    console.log('   2. Application does not exist in Dynatrace');
    console.log('   3. API token lacks necessary permissions (ReadConfig)');
    console.log('   4. Application is not a Mobile/Custom Application type');
  }
  
  console.log('\n💡 Recommendations:');
  if (!mobileApp && apiToken) {
    console.log('   1. Verify the Application ID in your Dynatrace UI');
    console.log('   2. Go to: Frontend -> Mobile and custom applications');
    console.log('   3. Check if the application exists and get the correct ID');
    console.log('   4. Make sure it\'s an "OpenKit mobile app" (not a web application)');
  } else if (!apiToken) {
    console.log('   1. Run with an API token to get detailed verification:');
    console.log(`      node src/verify_application.js ${configPath} YOUR_API_TOKEN`);
  } else {
    console.log('   ✅ Configuration looks good!');
    console.log('   If OpenKit still fails to initialize, check:');
    console.log('   1. Network proxy settings');
    console.log('   2. Corporate firewall rules');
    console.log('   3. Local antivirus/security software');
  }
  
  console.log('');
}

// Main execution
const configPath = process.argv[2] || 'examples/harvard_pilgrim_config.json';
const apiToken = process.argv[3];

if (!configPath) {
  console.error('Usage: node src/verify_application.js <config-file> [api-token]');
  process.exit(1);
}

verifyApplication(configPath, apiToken)
  .catch(error => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  });
