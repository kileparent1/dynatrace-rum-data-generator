#!/usr/bin/env node
/**
 * =============================================================================
 * HP-RUMGEN-001.js
 * Harvard Pilgrim RUM Data Generator - Standalone Edition
 * =============================================================================
 * 
 * Self-contained RUM session generator for Harvard Pilgrim Member Portal
 * 
 * USAGE:
 *   node HP-RUMGEN-001.js
 * 
 * PREREQUISITES:
 *   npm install @dynatrace/openkit-js
 * 
 * DESCRIPTION:
 *   Generates realistic user sessions for Harvard Pilgrim healthcare portal
 *   with 4 user profiles and 4 different user journeys.
 * 
 * =============================================================================
 */

const crypto = require('crypto');

// =============================================================================
// EMBEDDED CONFIGURATION
// =============================================================================

const CONFIG = {
  metadata: {
    businessName: "Harvard Pilgrim",
    applicationName: "Member Portal",
    industry: "Healthcare",
    description: "RUM session generation for premium payment workflows",
    configVersion: "1.0.0",
    generatorVersion: "HP-RUMGEN-001"
  },
  dynatrace: {
    tenant: "fzw9231h",
    tenantUrl: "https://fzw9231h.sprint.dynatracelabs.com",
    applicationId: "72774fd5-9655-470f-a1a5-ee6bb9f46df9",
    beaconUrl: "https://fzw9231h.sprint.dynatracelabs.com/mbeacon/fzw9231h",
    applicationVersion: "2.1.0"
  },
  openkit: {
    operatingSystem: "Windows 10",
    manufacturer: "Harvard Pilgrim Health Care",
    modelId: "MemberPortal_v2.1",
    logLevel: "INFO"
  },
  business: {
    userProfiles: [
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        clientIP: "198.51.100.42",
        userType: "premium",
        customProperties: {
          memberId: "HP-89012345",
          memberType: "premium_member",
          planType: "Gold Premium HMO",
          enrollmentDate: "2020-01-15",
          segment: "high_value_engaged"
        }
      },
      {
        name: "Michael Chen",
        email: "michael.chen@email.com",
        clientIP: "203.0.113.87",
        userType: "standard",
        customProperties: {
          memberId: "HP-90123456",
          memberType: "standard_member",
          planType: "Standard PPO",
          enrollmentDate: "2021-06-01",
          segment: "standard_active"
        }
      },
      {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@email.com",
        clientIP: "192.0.2.156",
        userType: "family",
        customProperties: {
          memberId: "HP-01234567",
          memberType: "family_member",
          planType: "Family Plan - Silver",
          enrollmentDate: "2019-03-20",
          dependents: 3,
          segment: "family_healthcare"
        }
      },
      {
        name: "James Patterson",
        email: "james.patterson@email.com",
        clientIP: "198.51.100.91",
        userType: "senior",
        customProperties: {
          memberId: "HP-12345678",
          memberType: "senior_member",
          planType: "Medicare Advantage",
          enrollmentDate: "2018-11-10",
          ageGroup: "65+",
          segment: "senior_care"
        }
      }
    ],
    userJourneys: {
      premiumPayment: {
        name: "Premium Payment Flow",
        description: "Member logs in and pays monthly premium",
        pages: [
          {
            name: "Homepage",
            duration: 2500,
            actions: ["view_hero_banner", "check_notifications", "click_login_button"]
          },
          {
            name: "Login",
            duration: 3000,
            actions: ["enter_member_id", "enter_password", "click_sign_in", "load_member_dashboard"]
          },
          {
            name: "Account Dashboard",
            duration: 2800,
            actions: ["view_account_summary", "check_balance", "click_make_payment"]
          },
          {
            name: "Payment Setup",
            duration: 4000,
            actions: ["select_payment_amount", "enter_card_number", "enter_billing_address", "verify_payment_details"]
          },
          {
            name: "Payment Confirmation",
            duration: 2000,
            actions: ["view_confirmation", "download_receipt", "return_dashboard"]
          }
        ]
      },
      viewClaims: {
        name: "View Claims History",
        description: "Member reviews past medical claims",
        pages: [
          {
            name: "Homepage",
            duration: 2000,
            actions: ["view_hero_banner", "click_login_button"]
          },
          {
            name: "Login",
            duration: 2500,
            actions: ["enter_credentials", "submit_login"]
          },
          {
            name: "Claims Center",
            duration: 3500,
            actions: ["view_claims_list", "filter_by_date", "sort_by_amount", "select_claim_details"]
          },
          {
            name: "Claim Details",
            duration: 3000,
            actions: ["view_claim_breakdown", "download_eob", "view_provider_info"]
          }
        ]
      },
      downloadCard: {
        name: "Download Insurance Card",
        description: "Member downloads digital insurance card",
        pages: [
          {
            name: "Homepage",
            duration: 1800,
            actions: ["click_login"]
          },
          {
            name: "Login",
            duration: 2500,
            actions: ["authenticate"]
          },
          {
            name: "Member Profile",
            duration: 2200,
            actions: ["view_profile", "navigate_to_id_card"]
          },
          {
            name: "Insurance Card",
            duration: 2800,
            actions: ["view_digital_card", "click_download", "save_to_wallet", "email_card"]
          }
        ]
      },
      findProvider: {
        name: "Find Healthcare Provider",
        description: "Search for in-network doctors",
        pages: [
          {
            name: "Homepage",
            duration: 1500,
            actions: ["click_find_doctor"]
          },
          {
            name: "Provider Search",
            duration: 3500,
            actions: ["enter_location", "select_specialty", "apply_filters", "search"]
          },
          {
            name: "Search Results",
            duration: 3000,
            actions: ["view_results_list", "sort_by_distance", "read_reviews", "select_provider"]
          },
          {
            name: "Provider Details",
            duration: 2500,
            actions: ["view_provider_profile", "check_availability", "get_directions", "save_favorite"]
          }
        ]
      }
    },
    errorSimulation: {
      enabled: true,
      errorRate: 0.03,
      errorTypes: [
        "Payment Gateway Timeout",
        "Session Expired",
        "Invalid Member ID",
        "Network Connection Lost",
        "API Rate Limit Exceeded"
      ]
    },
    performanceMetrics: {
      pageLoadTimeRange: {
        min: 1200,
        max: 3500
      },
      actionDurationRange: {
        min: 300,
        max: 1200
      }
    }
  }
};

// =============================================================================
// OPENKIT SDK LOADER
// =============================================================================

let OpenKit = null;

try {
  // Try multiple import patterns
  try {
    const openkit = require('@dynatrace/openkit-js');
    OpenKit = openkit.OpenKitBuilder || openkit.DynatraceOpenKitBuilder || openkit.default || openkit;
  } catch (e) {
    const openkit = require('@dynatrace/openkit-js');
    OpenKit = openkit;
  }
  console.log('✅ OpenKit SDK loaded successfully\n');
} catch (error) {
  console.error('❌ OpenKit SDK not found!');
  console.error('   Install with: npm install @dynatrace/openkit-js\n');
  process.exit(1);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateDeviceId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000000);
}

function createOpenKit(config, deviceId) {
  console.log('🔧 Building OpenKit instance...');
  console.log(`   Beacon URL: ${config.dynatrace.beaconUrl}`);
  console.log(`   Application ID: ${config.dynatrace.applicationId}`);
  console.log(`   Device ID: ${deviceId}`);
  console.log('   🔍 Enabling DEBUG logging to diagnose connection...\n');

  const builder = new OpenKit(
    config.dynatrace.beaconUrl,
    config.dynatrace.applicationId,
    deviceId
  );

  builder
    .withApplicationVersion(config.dynatrace.applicationVersion)
    .withOperatingSystem(config.openkit.operatingSystem)
    .withManufacturer(config.openkit.manufacturer)
    .withModelId(config.openkit.modelId)
    .withLogLevel(0); // DEBUG level for troubleshooting

  return builder.build();
}

function calculateDuration(baseDuration, config) {
  const min = config?.business?.performanceMetrics?.pageLoadTimeRange?.min || baseDuration * 0.8;
  const max = config?.business?.performanceMetrics?.pageLoadTimeRange?.max || baseDuration * 1.2;
  return Math.floor(min + Math.random() * (max - min));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// SESSION SIMULATION
// =============================================================================

async function simulateUserSession(config, userProfile, journey) {
  console.log('\n' + '='.repeat(70));
  console.log(`Starting session for: ${userProfile.name}`);
  console.log(`Journey: ${journey.name}`);
  console.log('='.repeat(70));

  const deviceId = generateDeviceId();
  const openKit = createOpenKit(config, deviceId);

  return new Promise((resolve) => {
    const initTimeout = 30000;
    let initComplete = false;
    
    const timeoutHandle = setTimeout(() => {
      if (!initComplete) {
        console.error('❌ OpenKit initialization timed out after 30 seconds');
        console.error('   Possible issues:');
        console.error('   1. Dynatrace Custom Application may not be enabled');
        console.error('   2. Application ID mismatch between config and Dynatrace');
        console.error('   3. Network proxy or firewall blocking HTTPS connections');
        console.error('   4. Dynatrace tenant URL incorrect\n');
        resolve(false);
      }
    }, initTimeout);
    
    openKit.waitForInit(async (success) => {
      initComplete = true;
      clearTimeout(timeoutHandle);
      
      if (!success) {
        console.error('❌ OpenKit initialization failed (unable to connect to Dynatrace beacon)');
        console.error('   Please verify:');
        console.error('   1. Dynatrace URL is accessible from your network');
        console.error('   2. Application ID exists in your Dynatrace environment');
        console.error('   3. No firewall blocking outbound connections\n');
        resolve(false);
        return;
      }

      console.log('✅ OpenKit initialization complete - capturing session data\n');

      try {
        const session = openKit.createSession(userProfile.clientIP);
        session.identifyUser(userProfile.email);

        // Simulate journey pages
        for (const page of journey.pages) {
          console.log(`\n--- Page: ${page.name} ---`);

          const pageAction = session.enterAction(`View ${page.name}`);
          pageAction.reportEvent('Page Load Start');

          const loadTime = calculateDuration(page.duration, config);
          await sleep(loadTime / 4);

          pageAction.reportValue('Page Load Time', loadTime);
          pageAction.reportEvent('Page Load Complete');

          // Simulate user actions on page
          if (page.actions && page.actions.length > 0) {
            for (const actionName of page.actions) {
              console.log(`  [Action] ▶ ${actionName}`);

              const actionDuration = config.business.performanceMetrics?.actionDurationRange
                ? Math.floor(
                    config.business.performanceMetrics.actionDurationRange.min +
                    Math.random() * (config.business.performanceMetrics.actionDurationRange.max - config.business.performanceMetrics.actionDurationRange.min)
                  )
                : Math.floor(200 + Math.random() * 800);

              await sleep(actionDuration / 4);

              pageAction.reportEvent(`User Action: ${actionName}`);
              pageAction.reportValue(`${actionName} Duration`, actionDuration);
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
          await sleep(500 + Math.random() * 500);
        }

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
    }, initTimeout);
  });
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('\n' + '█'.repeat(70));
  console.log('  Harvard Pilgrim RUM Generator - Standalone Edition v1.0.0');
  console.log('█'.repeat(70));

  console.log('\n📊 Configuration Summary:');
  console.log(`   Business: ${CONFIG.metadata.businessName}`);
  console.log(`   Application: ${CONFIG.metadata.applicationName}`);
  console.log(`   Industry: ${CONFIG.metadata.industry}`);
  console.log(`   Dynatrace Tenant: ${CONFIG.dynatrace.tenant}`);
  console.log(`   Application ID: ${CONFIG.dynatrace.applicationId}`);
  console.log(`   User Profiles: ${CONFIG.business.userProfiles.length}`);
  console.log(`   User Journeys: ${Object.keys(CONFIG.business.userJourneys).length}`);

  console.log('\n🚀 Starting session generation...\n');

  // Generate sessions for all users
  const userProfiles = CONFIG.business.userProfiles;
  const journeyKeys = Object.keys(CONFIG.business.userJourneys);
  const results = [];

  for (let i = 0; i < userProfiles.length; i++) {
    const userProfile = userProfiles[i];
    const journeyKey = journeyKeys[i % journeyKeys.length];
    const journey = CONFIG.business.userJourneys[journeyKey];

    console.log(`\n[${i + 1}/${userProfiles.length}] Generating session...`);
    const success = await simulateUserSession(CONFIG, userProfile, journey);
    results.push(success);

    if (i < userProfiles.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next session...');
      await sleep(2000);
    }
  }

  // Summary
  const successCount = results.filter(r => r).length;
  console.log('\n\n' + '█'.repeat(70));
  console.log('  ✓ Session Generation Complete');
  console.log('█'.repeat(70));
  console.log(`\n📊 Results: ${successCount}/${results.length} sessions successful\n`);

  console.log('📈 Verify in Dynatrace:');
  console.log(`   ${CONFIG.dynatrace.tenantUrl}/ui/apps/dynatrace.classic.custom.applications\n`);
  console.log(`   Look for: "${CONFIG.metadata.businessName} - ${CONFIG.metadata.applicationName}"`);
  console.log('   View: User sessions (last 15 minutes)\n');

  process.exit(successCount === results.length ? 0 : 1);
}

// Run the generator
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { CONFIG, simulateUserSession };
