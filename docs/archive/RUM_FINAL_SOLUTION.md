# Harvard Pilgrim RUM Data Generation - Final Solution

**Date:** March 12, 2026  
**Status:** 🟡 APPROACH CHANGED - Direct beacon method not supported  
**Recommendation:** Use OpenKit SDK or Synthetic Monitors instead  

---

## Critical Discovery

After extensive testing and consultation with Davis CoPilot and Dynatrace documentation:

### ❌ What DOESN'T Work: Direct RUM Beacon Injection

**Attempt:** Sending HTTP requests directly to the `/bf/` beacon endpoint  
**Result:** Not supported by Dynatrace  
**Error:** "Parameter end missing" (errorCode: 3000)  

**Quote from Davis CoPilot:**
> *"Sending beacons directly to the `/bf` endpoint is not supported for generating RUM sessions. Errors like 'Parameter end missing' indicate that the request format is incorrect or unsupported."*

**Why It Doesn't Work:**
- The `/bf/` endpoint is designed exclusively for the Dynatrace RUM JavaScript agent running in actual browsers
- The beacon protocol is proprietary and undocumented for external use
- Authentication, format, and structure are tightly coupled with the browser-based agent
- Even with POST method, correct application ID, and all required parameters, the endpoint rejects manually crafted beacons

---

## ✅ What DOES Work: Three Supported Approaches

### Option 1: OpenKit SDK (RECOMMENDED for Programmatic Generation)

**Best For:** Customized synthetic RUM data generation from Node.js

**Advantages:**
- ✅ Official Dynatrace SDK
- ✅ Documented and supported
- ✅ Creates custom applications with RUM-like sessions
- ✅ Full control over session structure
- ✅ Supports user identification, actions, web requests, errors
- ✅ Can run continuously for load generation

**How It Works:**
1. Create a Custom Application in Dynatrace UI
2. Download OpenKit JavaScript SDK from GitHub
3. Use `/mbeacon` endpoint (different from `/bf/`)
4. Generate sessions programmatically with full control

**Implementation Steps:**

```bash
# 1. Create Custom Application in Dynatrace
# Go to: Custom Applications > Create custom application
# Name: Harvard Pilgrim Member Portal (Custom)
# Get: Application ID and Beacon URL

# 2. Install OpenKit SDK
npm install @dynatrace/openkit-js

# 3. Implement session generation (see code example below)
```

**Code Example:**

```javascript
const { DynatraceOpenKitBuilder } = require('@dynatrace/openkit-js');

// Configuration from Dynatrace Custom Application settings
const APPLICATION_ID = 'your-custom-app-id';  // From instrumentation wizard
const BEACON_URL = 'https://fzw9231h.sprint.dynatracelabs.com/mbeacon';  // Note: /mbeacon not /bf
const DEVICE_ID = Date.now();  // Unique per user/device

// Initialize OpenKit
const openKit = new DynatraceOpenKitBuilder(BEACON_URL, APPLICATION_ID, DEVICE_ID)
  .withApplicationVersion('1.0.0')
  .withOperatingSystem('Windows 10')
  .build();

// Wait for initialization
await openKit.waitForInitCompletion(10000);

// Create session
const session = openKit.createSession('192.168.1.100');  // Client IP
session.identifyUser('sarah.johnson@example.com');

// Create root action (page view)
const pageView = session.enterAction('View Dashboard');
pageView.reportEvent('Page Loaded');
pageView.reportValue('Load Time', 1250);

// Create child action (user interaction)
const clickAction = pageView.enterAction('Click Submit Payment');
clickAction.reportValue('Action Duration', 300);
clickAction.leaveAction();

// End page view
pageView.leaveAction();

// End session
session.end();

// Cleanup
openKit.shutdown();
```

**Setting Up Custom Application:**

1. In Dynatrace: **Custom Applications** > **Create custom application**
2. Name: `Harvard Pilgrim Member Portal (Custom)`
3. Icon: Choose healthcare or web icon
4. Click: **Monitor custom application**
5. Open: **Instrumentation wizard**
6. Select: **JavaScript**
7. Copy: Application ID and Beacon URL
8. Download: OpenKit JavaScript SDK

**GitHub Repository:**
- https://github.com/Dynatrace/openkit-js
- https://github.com/Dynatrace/openkit-java
- https://github.com/Dynatrace/openkit-dotnet

---

### Option 2: Synthetic Monitors (RECOMMENDED for Browser Simulation)

**Best For:** Simulating real browser behavior with actual RUM data

**Advantages:**
- ✅ Uses real or headless browsers
- ✅ Captures genuine RUM beacons automatically
- ✅ Includes performance metrics (Core Web Vitals, etc.)
- ✅ Scheduling and alerting built-in
- ✅ Geographic distribution from multiple locations
- ✅ Integrated with Dynatrace dashboards

**How It Works:**
1. Create a Synthetic Browser Monitor in Dynatrace
2. Write a Selenium/JavaScript script that navigates your site
3. Dynatrace automatically injects RUM JavaScript
4. Real RUM sessions are created automatically
5. Runs on schedule (every 5min, 15min, 1hr, etc.)

**Implementation Steps:**

```bash
# 1. In Dynatrace UI
# Go to: Synthetic > Create a synthetic monitor > Browser monitor

# 2. Script the user journey
# Use Dynatrace Recorder or write Selenium script

# 3. Configure schedule and locations

# 4. Enable RUM injection (automatic)

# 5. Run and view sessions in RUM application
```

**Example Synthetic Script:**

```javascript
// Dynatrace Synthetic Browser Monitor Script
const { driver } = require('@dynatrace/dynatrace-synthetic');

// Login
await driver.get('https://www.harvardpilgrim.org/login');
await driver.findElement($('#username')).sendKeys('test.user@example.com');
await driver.findElement($('#password')).sendKeys('password123');
await driver.findElement($('#login-btn')).click();

// Navigate to dashboard
await driver.wait(until.urlContains('/dashboard'), 10000);

// Click premium payment
await driver.findElement($('#payment-link')).click();

// Fill payment form
await driver.findElement($('#amount')).sendKeys('150.00');
await driver.findElement($('#card-number')).sendKeys('4111111111111111');

// Submit
await driver.findElement($('#submit-payment')).click();

// Verify success
await driver.wait(until.elementLocated($('#success-message')), 10000);
```

**Setting Up Synthetic Monitor:**

1. In Dynatrace: **Synthetic** > **Create a synthetic monitor**
2. Type: **Browser monitor**
3. Name: `Harvard Pilgrim - Premium Payment Flow`
4. Frequency: Every 15 minutes
5. Locations: Choose geographic locations
6. Script: Upload or paste Selenium script
7. Enable: **RUM data capture** (checkbox)
8. Save and activate

---

### Option 3: Headless Browser with RUM JavaScript

**Best For:** Custom automation with real RUM injection

**Advantages:**
- ✅ Full control over browser automation
- ✅ Can integrate with existing test suites
- ✅ Uses actual Dynatrace RUM JavaScript
- ✅ Captures real browser performance metrics
- ✅ Flexible scheduling and orchestration

**How It Works:**
1. Use Puppeteer or Selenium
2. Navigate to pages with Dynatrace RUM JavaScript injected
3. Perform user interactions
4. RUM JavaScript automatically sends beacons to Dynatrace
5. Sessions appear in RUM application

**Implementation with Puppeteer:**

```bash
npm install puppeteer
```

```javascript
const puppeteer = require('puppeteer');

async function generateRUMSessions() {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport and user agent
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  // Navigate to site (must have Dynatrace RUM JavaScript)
  console.log('Loading homepage...');
  await page.goto('https://www.harvardpilgrim.org/', {
    waitUntil: 'networkidle2'
  });
  
  // Wait for RUM to initialize
  await page.waitForTimeout(2000);
  
  // Simulate login
  console.log('Logging in...');
  await page.goto('https://www.harvardpilgrim.org/login');
  await page.type('#username', 'sarah.johnson@example.com');
  await page.type('#password', 'password123');
  await page.click('#login-btn');
  await page.waitForNavigation();
  
  // Navigate dashboard
  console.log('Viewing dashboard...');
  await page.waitForTimeout(1000);
  
  // Click payment
  console.log('Making payment...');
  await page.click('#payment-link');
  await page.waitForSelector('#payment-form');
  await page.type('#amount', '150.00');
  await page.click('#submit-btn');
  
  // Wait for RUM beacons to be sent
  await page.waitForTimeout(3000);
  
  console.log('✓ Session completed. Check Dynatrace RUM dashboard.');
  
  await browser.close();
}

// Run multiple sessions
async function main() {
  for (let i = 0; i < 3; i++) {
    console.log(`\n=== Session ${i + 1} ===`);
    await generateRUMSessions();
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main();
```

**Requirements:**
- Website must have Dynatrace RUM JavaScript already injected (auto-injection or manual)
- Or inject RUM script manually: `await page.addScriptTag({ url: 'https://...' })`

---

## Comparison Matrix

| Feature | OpenKit SDK | Synthetic Monitors | Headless Browser |
|---------|-------------|-------------------|------------------|
| **Ease of Setup** | Medium | Easy | Medium |
| **Control Level** | High | Medium | High |
| **Real Browser Metrics** | No | Yes | Yes |
| **Cost** | Free | Synthetic units | Free (self-hosted) |
| **Session Type** | Custom Application | Web Application | Web Application |
| **Performance Metrics** | Basic | Complete | Complete |
| **Scheduling** | Self-managed | Built-in | Self-managed |
| **Geographic Distribution** | No | Yes | Self-managed |
| **Best For** | Backend/API simulation | Realistic browser tests | Custom automation |

---

## Recommended Approach for Harvard Pilgrim

### Primary: OpenKit SDK

**Why:**
- Generates sessions programmatically without browser overhead
- Can run continuously for load testing
- Full control over user profiles, actions, and metrics
- Lightweight and efficient
- Can generate hundreds of sessions easily

**Next Steps:**
1. Create Custom Application in Dynatrace UI
2. Get Application ID and Beacon URL from instrumentation wizard
3. Install OpenKit JavaScript SDK from GitHub
4. Implement harvard_openkit_generator.js (create new file)
5. Run generator to create sessions
6. Verify in Custom Applications UI

### Secondary: Synthetic Monitors

**Why:**
- If you need real browser performance metrics (Core Web Vitals, etc.)
- Want scheduled execution without maintaining infrastructure
- Need geographic distribution
- Want integration with Dynatrace alerting

**Next Steps:**
1. Create Synthetic Browser Monitor in Dynatrace
2. Write Selenium script for premium payment workflow
3. Schedule execution (e.g., every 15 minutes)
4. Enable RUM injection
5. Monitor results in Synthetic and RUM dashboards

---

## Migration Path from Current Implementation

### What to Keep:
- ✅ User profile definitions (USER_PROFILES array)
- ✅ Page definitions (PAGES array)
- ✅ Session flow logic
- ✅ Action generation logic
- ✅ Error simulation logic

### What to Change:
- ❌ Remove direct beacon sending code
- ❌ Remove RumBeacon class
- ❌ Remove HTTPS request logic
- ✅ Replace with OpenKit SDK calls
- ✅ Use OpenKit session/action API

### Conversion Example:

**Before (Direct Beacon):**
```javascript
const beacon = new RumBeacon('_visit_', sessionContext);
beacon.addParam('p', 'Windows');
beacon.addParam('br', 'Chrome');
await beacon.send();
```

**After (OpenKit):**
```javascript
const session = openKit.createSession(clientIP);
session.identifyUser(userProfile.email);
const action = session.enterAction('View Page');
action.reportValue('Load Time', loadTime);
action.leaveAction();
session.end();
```

---

## Implementation Timeline

### Phase 1: OpenKit Setup (1-2 hours)
1. Create Custom Application in Dynatrace (15 min)
2. Install OpenKit SDK and dependencies (15 min)
3. Implement basic session generation (30 min)
4. Test and verify sessions appear (30 min)

### Phase 2: Full Implementation (2-3 hours)
1. Migrate user profiles and page definitions (30 min)
2. Implement session flow logic with OpenKit (1 hour)
3. Add action types and metrics (30 min)
4. Add error simulation (30 min)
5. Testing and refinement (30 min)

### Phase 3: Scheduling & Monitoring (1 hour)
1. Set up continuous execution (cron job or scheduler)
2. Add logging and monitoring
3. Create dashboard for generated sessions
4. Document usage and maintenance

---

## Resources

### OpenKit Documentation:
- Main documentation: https://docs.dynatrace.com/docs/ingest-from/extend-dynatrace/openkit/instrument-your-application-using-dynatrace-openkit
- GitHub repository: https://github.com/Dynatrace/openkit-js
- API methods: https://docs.dynatrace.com/docs/ingest-from/extend-dynatrace/openkit/dynatrace-openkit-api-methods

### Synthetic Monitors:
- Browser monitors: https://docs.dynatrace.com/docs/observe/digital-experience/synthetic-monitoring/browser-monitors
- Script examples: https://docs.dynatrace.com/docs/observe/digital-experience/synthetic-monitoring/browser-monitors/sample-browser-monitor-scripts

### Custom Applications:
- Overview: https://docs.dynatrace.com/docs/observe/digital-experience/custom-applications
- Configuration: https://docs.dynatrace.com/docs/observe/digital-experience/custom-applications/additional-configuration

---

## Conclusion

**Bottom Line:**
- ❌ Direct RUM beacon injection to `/bf/` endpoint is NOT supported
- ✅ Use OpenKit SDK for programmatic session generation
- ✅ Use Synthetic Monitors for realistic browser testing
- ✅ Use Headless Browser for custom automation with real RUM

**Recommendation:**
Start with **OpenKit SDK** for Harvard Pilgrim use case. It provides the best balance of control, simplicity, and efficiency for generating synthetic RUM data programmatically.

**Next Action:**
1. Create Custom Application in Dynatrace UI
2. Download and install OpenKit JavaScript SDK
3. Implement harvard_openkit_generator.js
4. Test with single session
5. Scale up to multiple concurrent sessions

---

**Document Status:** Final Recommendation  
**Confidence Level:** High - Verified with Davis CoPilot and official documentation  
**Ready for Implementation:** Yes - Clear path forward with OpenKit SDK
