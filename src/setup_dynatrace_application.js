#!/usr/bin/env node
/**
 * Dynatrace Custom Application Setup Tool
 * 
 * This script helps you create and configure a Dynatrace Custom Application
 * for OpenKit instrumentation. Run this ONCE to set up your application.
 * 
 * Usage:
 *   node setup_dynatrace_application.js
 * 
 * What it does:
 * 1. Validates your Dynatrace environment access
 * 2. Helps create a Custom Application
 * 3. Saves configuration to business_config.json
 * 4. Provides next steps for instrumentation
 * 
 * Prerequisites:
 * - Dynatrace API token with scope: Any valid API token (e.g., entities.read, settings.read, or DataExport)
 * - Access to your Dynatrace environment
 */

const https = require('https');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Main setup wizard
 */
async function runSetup() {
  console.log('\n' + '='.repeat(70));
  console.log('  Dynatrace Custom Application Setup Wizard');
  console.log('='.repeat(70));
  console.log('\nThis wizard will help you create a Custom Application in Dynatrace');
  console.log('and generate the configuration needed for OpenKit instrumentation.\n');

  try {
    // Step 1: Get Dynatrace environment details
    console.log('\n📋 Step 1: Dynatrace Environment Configuration');
    console.log('-'.repeat(70));
    
    const tenant = await question('Enter your Dynatrace tenant (e.g., abc12345): ');
    const tenantUrl = `https://${tenant}.sprint.dynatracelabs.com`;
    const apiToken = await question('Enter your Dynatrace API token: ');
    
    // Validate connection
    console.log('\n🔍 Validating connection to Dynatrace...');
    const isValid = await validateConnection(tenant, apiToken);
    
    if (!isValid) {
      console.error('\n❌ Failed to connect to Dynatrace. Please check your credentials.');
      process.exit(1);
    }
    
    console.log('✅ Connection validated successfully!');

    // Step 2: Business/Application Information
    console.log('\n\n📋 Step 2: Business Configuration');
    console.log('-'.repeat(70));
    console.log('This information will be used to create your Custom Application.\n');
    
    const businessName = await question('Business/Company Name (e.g., Harvard Pilgrim): ');
    const applicationName = await question('Application Name (e.g., Member Portal): ');
    const industry = await question('Industry (e.g., Healthcare, Finance, Retail): ');
    const applicationVersion = await question('Application Version (default: 1.0.0): ') || '1.0.0';
    
    // Step 3: Generate configuration
    console.log('\n\n📋 Step 3: Custom Application Details');
    console.log('-'.repeat(70));
    console.log('\n⚠️  Manual Step Required:');
    console.log('\nPlease create a Custom Application in Dynatrace:');
    console.log(`  1. Navigate to: ${tenantUrl}/ui/apps/dynatrace.classic.custom.applications`);
    console.log('  2. Click: "Create custom application"');
    console.log(`  3. Name: "${businessName} - ${applicationName}"`);
    console.log('  4. Choose an appropriate icon');
    console.log('  5. Click: "Monitor custom application"');
    console.log('  6. Open: "Instrumentation wizard"');
    console.log('  7. Select: "JavaScript"\n');
    
    const wait = await question('Press ENTER when you have completed the above steps...');
    
    console.log('\nFrom the Instrumentation wizard, copy these values:\n');
    const applicationId = await question('Application ID (e.g., CUSTOM_APPLICATION-1234567890ABCDEF): ');
    const beaconUrl = await question(`Beacon URL (default: ${tenantUrl}/mbeacon): `) || `${tenantUrl}/mbeacon`;
    
    // Step 4: Create configuration file
    const config = {
      metadata: {
        businessName: businessName,
        applicationName: applicationName,
        industry: industry,
        createdDate: new Date().toISOString(),
        configVersion: '1.0.0'
      },
      dynatrace: {
        tenant: tenant,
        tenantUrl: tenantUrl,
        applicationId: applicationId,
        beaconUrl: beaconUrl,
        applicationVersion: applicationVersion
      },
      openkit: {
        operatingSystem: 'Windows 10',
        manufacturer: businessName,
        modelId: `${applicationName}_v${applicationVersion}`,
        logLevel: 'INFO'
      },
      // Placeholder for business-specific configuration
      // This section should be customized per business
      business: {
        // Example: User profile fields, action types, page definitions
        // Will be populated in separate business config files
      }
    };
    
    const configPath = './business_config.json';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('\n\n✅ Configuration saved to:', configPath);
    
    // Step 5: Next steps
    console.log('\n\n' + '='.repeat(70));
    console.log('  🎉 Setup Complete!');
    console.log('='.repeat(70));
    console.log('\n📝 Next Steps:');
    console.log('  1. Install OpenKit SDK:');
    console.log('     npm install @dynatrace/openkit-js\n');
    console.log('  2. Review/edit your configuration:');
    console.log(`     ${configPath}\n`);
    console.log('  3. Create your business-specific configuration:');
    console.log('     - Define user profiles, pages, and actions');
    console.log('     - See business_config_template.json for examples\n');
    console.log('  4. Run your RUM session generator:');
    console.log('     node rum_session_generator.js\n');
    console.log('  5. Verify data in Dynatrace:');
    console.log(`     ${tenantUrl}/ui/apps/dynatrace.classic.custom.applications\n`);
    
    console.log('📚 Documentation:');
    console.log('  - OpenKit API: https://docs.dynatrace.com/docs/ingest-from/extend-dynatrace/openkit/dynatrace-openkit-api-methods');
    console.log('  - Custom Apps: https://docs.dynatrace.com/docs/observe/digital-experience/custom-applications\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Validate connection to Dynatrace
 */
function validateConnection(tenant, apiToken) {
  return new Promise((resolve) => {
    // Try the /api/v2/settings/objects endpoint which only needs basic access
    // This is more forgiving than /api/v2/metrics
    const options = {
      hostname: `${tenant}.sprint.dynatracelabs.com`,
      path: '/api/v2/settings/schemas?pageSize=1',
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
          resolve(true);
        } else if (res.statusCode === 401) {
          console.error('\n⚠️  Authentication failed. Please check:');
          console.error('   - Token format is correct (starts with dt0c01)');
          console.error('   - Token has not expired');
          console.error('   - Token has at least one permission scope\n');
          resolve(false);
        } else if (res.statusCode === 403) {
          console.warn('\n⚠️  Token validated but has limited permissions.');
          console.warn('   This is OK - we can still proceed with Custom Application setup.\n');
          resolve(true); // Proceed anyway since token is valid
        } else {
          console.error(`\n⚠️  Unexpected response code: ${res.statusCode}`);
          console.error(`   Response: ${data}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('\n⚠️  Network error:', err.message);
      console.error('   - Check your internet connection');
      console.error('   - Verify tenant URL is correct\n');
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.error('\n⚠️  Connection timeout (10 seconds)');
      console.error('   - Network may be slow or blocked');
      console.error('   - Firewall might be blocking the connection\n');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Run the setup
if (require.main === module) {
  runSetup().catch(console.error);
}

module.exports = { runSetup };
