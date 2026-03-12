#!/usr/bin/env node
/**
 * Test Dynatrace Beacon Connectivity
 * 
 * This script tests if the OpenKit beacon endpoint is reachable
 * and properly configured.
 */

const https = require('https');
const fs = require('fs');

// Load configuration
const configPath = process.argv[2] || './examples/harvard_pilgrim_config.json';

if (!fs.existsSync(configPath)) {
  console.error(`❌ Configuration file not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('\n🔍 Testing Dynatrace Beacon Connectivity\n');
console.log('Configuration:');
console.log(`  Tenant: ${config.dynatrace.tenant}`);
console.log(`  Application ID: ${config.dynatrace.applicationId}`);
console.log(`  Beacon URL: ${config.dynatrace.beaconUrl}\n`);

// Test 1: Check if beacon endpoint is reachable
console.log('Test 1: Checking beacon endpoint...');

const beaconUrl = new URL(config.dynatrace.beaconUrl);

const options = {
  hostname: beaconUrl.hostname,
  path: beaconUrl.pathname,
  method: 'GET',
  headers: {
    'User-Agent': 'KP-RUMGEN-Diagnostic/1.0'
  }
};

const req = https.request(options, (res) => {
  console.log(`  Status Code: ${res.statusCode}`);
  console.log(`  Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`  Response: ${data.substring(0, 200)}`);
    
    // Beacon endpoints typically return 400 for GET without proper params
    // or 200/204 if they're accepting data
    if (res.statusCode === 400 || res.statusCode === 200 || res.statusCode === 204) {
      console.log('  ✅ Beacon endpoint is reachable\n');
    } else {
      console.log('  ⚠️  Unexpected status code\n');
    }
    
    // Test 2: Check Application Type
    console.log('Test 2: Checking application type...');
    checkApplicationType(config);
  });
});

req.on('error', (err) => {
  console.error(`  ❌ Network error: ${err.message}`);
  console.error('  This means the beacon is not reachable from your network\n');
  
  console.log('Troubleshooting:');
  console.log('  1. Check if you can access Dynatrace UI');
  console.log('  2. Verify no VPN/proxy blocking the connection');
  console.log('  3. Check firewall settings');
  process.exit(1);
});

req.setTimeout(10000, () => {
  console.error('  ❌ Connection timeout (10 seconds)');
  req.destroy();
  process.exit(1);
});

req.end();

/**
 * Check if application is the correct type for OpenKit
 */
function checkApplicationType(config) {
  console.log(`  Application ID: ${config.dynatrace.applicationId}`);
  
  // OpenKit works with Mobile/Custom Applications
  if (config.dynatrace.applicationId.startsWith('CUSTOM_APPLICATION-')) {
    console.log('  ✅ Application type: Custom Application (compatible with OpenKit)\n');
    console.log('✅ All tests passed! OpenKit should be able to connect.\n');
    console.log('If OpenKit still fails, check:');
    console.log('  1. Application exists in Dynatrace UI');
    console.log('  2. Application is not disabled/archived');
    console.log('  3. Try regenerating the Application ID\n');
  } else if (config.dynatrace.applicationId.startsWith('APPLICATION-')) {
    console.log('  ⚠️  Application type: Web Application (MAY NOT be compatible with OpenKit)\n');
    console.log('❌ ISSUE FOUND: This appears to be a Web Application, not a Mobile/Custom Application\n');
    console.log('OpenKit is designed for Mobile and Custom Applications.');
    console.log('Web Applications use JavaScript agent, not OpenKit.\n');
    console.log('Solution:');
    console.log('  1. Create a Mobile/Custom Application in Dynatrace:');
    console.log(`     ${config.dynatrace.tenantUrl}/ui/apps/dynatrace.classic.applications`);
    console.log('  2. Choose "Mobile" or "Custom Application" type');
    console.log('  3. Update your config with the new Application ID\n');
    console.log('Or run the setup wizard with a token that has WriteConfig scope:');
    console.log('  node src/setup_dynatrace_application.js\n');
  } else {
    console.log('  ❓ Unknown application type\n');
    console.log('Application ID format:');
    console.log('  - CUSTOM_APPLICATION-xxx = Mobile/Custom Application (✅ works with OpenKit)');
    console.log('  - APPLICATION-xxx = Web Application (❌ uses JavaScript agent, not OpenKit)\n');
  }
}
