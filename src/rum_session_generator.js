#!/usr/bin/env node
/**
 * Universal RUM Session Generator using OpenKit
 * 
 * This script generates synthetic RUM sessions in Dynatrace using OpenKit SDK.
 * It's designed to be business-agnostic and driven by configuration files.
 * 
 * Setup:
 *   1. Run: node setup_dynatrace_application.js (one-time setup)
 *   2. Install: npm install @dynatrace/openkit-js
 *   3. Configure: business_config.json (or create custom config)
 *   4. Run: node rum_session_generator.js [config-file]
 * 
 * Usage:
 *   node rum_session_generator.js                    # Uses business_config.json
 *   node rum_session_generator.js my_business.json   # Uses custom config
 * 
 * For AI Adaptation:
 *   - Modify business_config.json for different businesses
 *   - All user profiles, journeys, and actions are config-driven
 *   - No code changes needed for different use cases
 */

const fs = require('fs');
const path = require('path');

// OpenKit import - will be available after: npm install @dynatrace/openkit-js
let OpenKit;
try {
  const openKitModule = require('@dynatrace/openkit-js');
  
  // Try different export names (API changed between versions)
  OpenKit = openKitModule.OpenKitBuilder || 
            openKitModule.DynatraceOpenKitBuilder || 
            openKitModule.default ||
            openKitModule;
  
  if (OpenKit) {
    console.log('✅ OpenKit SDK loaded successfully');
  }
} catch (error) {
  console.warn('⚠️  OpenKit SDK not found. Install with: npm install @dynatrace/openkit-js');
  console.warn('Running in MOCK mode for demonstration...\n');
  OpenKit = null;
}

// =============================================================================
// CONFIGURATION LOADER
// =============================================================================

/**
 * Load business configuration from JSON file
 */
function loadConfig(configPath = './business_config.json') {
  try {
    const fullPath = path.resolve(configPath);
    console.log(`📋 Loading configuration from: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Configuration file not found: ${configPath}\nRun 'node setup_dynatrace_application.js' first.`);
    }
    
    const configData = fs.readFileSync(fullPath, 'utf8');
    const config = JSON.parse(configData);
    
    // Validate required fields
    validateConfig(config);
    
    console.log(`✅ Configuration loaded: ${config.metadata.businessName} - ${config.metadata.applicationName}\n`);
    return config;
    
  } catch (error) {
    console.error(`❌ Failed to load configuration: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Validate configuration structure
 */
function validateConfig(config) {
  const required = [
    'metadata.businessName',
    'metadata.applicationName',
    'dynatrace.applicationId',
    'dynatrace.beaconUrl',
    'business.userProfiles',
    'business.userJourneys'
  ];
  
  for (const field of required) {
    const parts = field.split('.');
    let value = config;
    for (const part of parts) {
      value = value?.[part];
    }
    if (!value) {
      throw new Error(`Missing required configuration field: ${field}`);
    }
  }
}

// =============================================================================
// OPENKIT WRAPPER (Supports both real and mock implementations)
// =============================================================================

/**
 * Create OpenKit instance (real or mock)
 */
function createOpenKit(config, deviceId) {
  if (OpenKit) {
    // Real OpenKit implementation
    console.log('🔧 Initializing OpenKit SDK...');
    
    try {
      // OpenKit v4+ uses lowercase 'd' in withModelId
      const openKitInstance = new OpenKit(
        config.dynatrace.beaconUrl,
        config.dynatrace.applicationId,
        deviceId
      )
        .withApplicationVersion(config.dynatrace.applicationVersion)
        .withOperatingSystem(config.openkit.operatingSystem)
        .withManufacturer(config.openkit.manufacturer)
        .withModelId(config.openkit.modelId) // Note: lowercase 'd' in v4+
        .build();
      
      console.log('✅ OpenKit initialized successfully');
      return openKitInstance;
      
    } catch (error) {
      console.error('❌ OpenKit initialization failed:', error.message);
      console.warn('⚠️  Falling back to mock mode...\n');
      return new MockOpenKit(config, deviceId);
    }
  } else {
    // Mock implementation for testing without SDK
    return new MockOpenKit(config, deviceId);
  }
}

/**
 * Mock OpenKit for testing without SDK installed
 */
class MockOpenKit {
  constructor(config, deviceId) {
    this.config = config;
    this.deviceId = deviceId;
    console.log(`[MOCK OpenKit] Initialized for: ${config.metadata.businessName}`);
  }

  waitForInit(callback, timeout) {
    console.log(`[MOCK OpenKit] Waiting for initialization (${timeout}ms)...`);
    setTimeout(() => {
      console.log('[MOCK OpenKit] ✓ Initialization complete');
      callback(true);
    }, 1000);
  }

  createSession(clientIP) {
    return new MockSession(this, clientIP);
  }

  shutdown() {
    console.log('[MOCK OpenKit] Shutting down...');
  }
}

class MockSession {
  constructor(openKit, clientIP) {
    this.openKit = openKit;
    this.clientIP = clientIP;
    this.sessionId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  identifyUser(userEmail) {
    console.log(`  [Session] User identified: ${userEmail}`);
  }

  enterAction(actionName) {
    return new MockAction(this, actionName);
  }

  end() {
    console.log(`  [Session] ✓ Session ended`);
  }
}

class MockAction {
  constructor(session, actionName) {
    this.session = session;
    this.actionName = actionName;
    console.log(`    [Action] ▶ ${actionName}`);
  }

  reportEvent(eventName) {
    console.log(`      [Event] ${eventName}`);
  }

  reportValue(valueName, value) {
    console.log(`      [Metric] ${valueName}: ${value}ms`);
  }

  reportError(errorName, errorCode, reason) {
    console.log(`      [Error] ${errorName}: ${reason}`);
  }

  enterAction(childActionName) {
    return new MockAction(this.session, childActionName);
  }

  leaveAction() {
    console.log(`    [Action] ■ ${this.actionName} completed`);
  }
}

// =============================================================================
// SESSION GENERATION ENGINE
// =============================================================================

/**
 * Generate device ID (unique per user/device)
 */
function generateDeviceId() {
  return Date.now() + Math.floor(Math.random() * 1000000);
}

/**
 * Calculate duration with variance
 */
function calculateDuration(baseDuration, config) {
  const min = config?.business?.performanceMetrics?.pageLoadTimeRange?.min || baseDuration * 0.8;
  const max = config?.business?.performanceMetrics?.pageLoadTimeRange?.max || baseDuration * 1.2;
  return Math.floor(min + Math.random() * (max - min));
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate a user session
 */
async function simulateUserSession(config, userProfile, journey) {
  console.log('\n' + '='.repeat(70));
  console.log(`Starting session for: ${userProfile.name}`);
  console.log(`Journey: ${journey.name}`);
  console.log('='.repeat(70));

  const deviceId = generateDeviceId();
  const openKit = createOpenKit(config, deviceId);

  return new Promise((resolve) => {
    const timeout = 10000;
    
    openKit.waitForInit(async (success) => {
      if (!success) {
        console.error('❌ OpenKit initialization failed');
        resolve(false);
        return;
      }

      try {
        // Create session
        const session = openKit.createSession(userProfile.clientIP);
        session.identifyUser(userProfile.email);

        // Simulate journey pages
        for (const page of journey.pages) {
          console.log(`\n--- Page: ${page.name} ---`);

          // Create page view action
          const pageAction = session.enterAction(`View ${page.name}`);
          pageAction.reportEvent('Page Load Start');

          // Simulate page load
          const loadTime = calculateDuration(page.duration, config);
          await sleep(loadTime / 4); // Speed up simulation

          pageAction.reportValue('Page Load Time', loadTime);
          pageAction.reportEvent('Page Load Complete');

          // Simulate user actions on page
          if (page.actions && page.actions.length > 0) {
            for (const actionName of page.actions) {
              const userAction = pageAction.enterAction(`User: ${actionName}`);

              const actionDuration = config.business.performanceMetrics?.actionDurationRange
                ? Math.floor(
                    config.business.performanceMetrics.actionDurationRange.min +
                    Math.random() * (config.business.performanceMetrics.actionDurationRange.max - config.business.performanceMetrics.actionDurationRange.min)
                  )
                : Math.floor(200 + Math.random() * 800);

              await sleep(actionDuration / 4);

              userAction.reportValue('Action Duration', actionDuration);
              userAction.leaveAction();
            }
          }

          // Error simulation
          const errorConfig = config.business.errorSimulation;
          if (errorConfig?.enabled && Math.random() < (errorConfig.errorRate || 0.02)) {
            const errorTypes = errorConfig.errorTypes || ['Generic Error'];
            const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
            pageAction.reportError(errorType, 500, 'Simulated error');
            console.log(`      ⚠️  Error: ${errorType}`);
          }

          pageAction.leaveAction();

          // Wait before next page
          await sleep(500 + Math.random() * 500);
        }

        // End session
        session.end();
        openKit.shutdown();

        console.log('\n' + '='.repeat(70));
        console.log(`✓ Session completed for: ${userProfile.name}`);
        console.log('='.repeat(70));

        resolve(true);

      } catch (error) {
        console.error(`❌ Session error: ${error.message}`);
        openKit.shutdown();
        resolve(false);
      }
    }, timeout);
  });
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('\n' + '█'.repeat(70));
  console.log('       Universal RUM Session Generator (OpenKit)');
  console.log('█'.repeat(70));

  // Load configuration
  const configFile = process.argv[2] || './business_config.json';
  const config = loadConfig(configFile);

  console.log('📊 Configuration Summary:');
  console.log(`   Business: ${config.metadata.businessName}`);
  console.log(`   Application: ${config.metadata.applicationName}`);
  console.log(`   Industry: ${config.metadata.industry}`);
  console.log(`   Dynatrace Tenant: ${config.dynatrace.tenant}`);
  console.log(`   Application ID: ${config.dynatrace.applicationId}`);
  console.log(`   User Profiles: ${config.business.userProfiles.length}`);
  console.log(`   User Journeys: ${Object.keys(config.business.userJourneys).length}`);

  if (!OpenKit) {
    console.log('\n⚠️  Running in MOCK mode (OpenKit SDK not installed)');
    console.log('   Install with: npm install @dynatrace/openkit-js\n');
  }

  console.log('\n🚀 Starting session generation...\n');

  try {
    const journeyKeys = Object.keys(config.business.userJourneys);
    const results = [];

    // Generate sessions for each user profile
    for (let i = 0; i < config.business.userProfiles.length; i++) {
      const userProfile = config.business.userProfiles[i];
      const journeyKey = journeyKeys[i % journeyKeys.length];
      const journey = config.business.userJourneys[journeyKey];

      console.log(`\n[${i + 1}/${config.business.userProfiles.length}] Generating session...`);

      const success = await simulateUserSession(config, userProfile, journey);
      results.push(success);

      // Stagger sessions
      if (i < config.business.userProfiles.length - 1) {
        await sleep(2000);
      }
    }

    // Summary
    const successful = results.filter(r => r).length;
    console.log('\n\n' + '█'.repeat(70));
    console.log(`  ✓ Session Generation Complete`);
    console.log('█'.repeat(70));
    console.log(`\n📊 Results: ${successful}/${results.length} sessions successful\n`);

    if (OpenKit) {
      console.log('📈 Verify in Dynatrace:');
      console.log(`   ${config.dynatrace.tenantUrl}/ui/apps/dynatrace.classic.custom.applications`);
      console.log(`\n   Look for: "${config.metadata.businessName} - ${config.metadata.applicationName}"`);
      console.log('   View: User sessions (last 15 minutes)\n');
    } else {
      console.log('💡 Next Step: Install OpenKit SDK and run again:');
      console.log('   npm install @dynatrace/openkit-js\n');
    }

  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  simulateUserSession,
  loadConfig,
  createOpenKit
};
