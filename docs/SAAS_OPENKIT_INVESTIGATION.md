# OpenKit SaaS Compatibility Investigation

**Date:** March 12, 2026  
**Tenant:** ecz64793.apps.dynatrace.com / ecz64793.live.dynatrace.com  
**Application:** Harvard Pilgrim - Member Portal  
**Application ID:** CUSTOM_APPLICATION-D56F8379180E430F (or d56f8379-180e-430f-927f-8349dea1f82d UUID)

---

## Summary

Attempted to use OpenKit SDK with a SaaS Dynatrace tenant to generate RUM sessions for a Custom Application created via the Configuration API. Encountered beacon connectivity issues that suggest OpenKit may not be fully compatible with modern SaaS Custom Applications.

---

## What We Tried

### 1. ✅ Created Custom Application via API
```bash
POST /api/config/v1/applications/mobile
```

**Result:** SUCCESS
- Application created: `CUSTOM_APPLICATION-D56F8379180E430F`
- Type: `CUSTOM_APPLICATION`
- Beacon Type: `CLUSTER_ACTIVE_GATE`
- Configuration retrieved successfully

### 2. ❌ OpenKit Beacon Connection - `.apps.dynatrace.com`
```
Beacon URL: https://ecz64793.apps.dynatrace.com/mbeacon
Status: 401 Authentication Required
```

**Error:**
```json
{
  "error": {
    "code": 401,
    "message": "Authentication required"
  }
}
```

**Analysis:** The `.apps.dynatrace.com` domain appears to be for UI/app hosting, not for API/beacon endpoints.

### 3. ❌ Open Kit Beacon Connection - `.live.dynatrace.com`
```
Beacon URL: https://ecz64793.live.dynatrace.com/mbeacon
Status: 404 Not Found
```

**Error:** Empty 404 response

**Analysis:** The `/mbeacon` endpoint doesn't exist or isn't configured for this application on SaaS.

### 4. ❌ OpenKit with UUID Application ID
```
Application ID: d56f8379-180e-430f-927f-8349dea1f82d
Status: Still failed (no improvement)
```

---

## Key Findings

### Domain Structure (SaaS)
| Domain | Purpose | Works For |
|--------|---------|-----------|
| `ecz64793.apps.dynatrace.com` | UI/App access | User login, browsing |
| `ecz64793.live.dynatrace.com` | APIs & Config | REST APIs, Config API |
| Beacon endpoint | Mobile/OpenKit data | **❌ Not working** |

### Application Configuration
```json
{
  "identifier": "CUSTOM_APPLICATION-D56F8379180E430F",
  "applicationId": "d56f8379-180e-430f-927f-8349dea1f82d",
  "applicationType": "CUSTOM_APPLICATION",
  "beaconEndpointType": "CLUSTER_ACTIVE_GATE",
  "costControlUserSessionPercentage": 100
}
```

**Note:** No `beaconEndpointUrl` field was returned, suggesting the endpoint might need to be discovered or configured differently.

---

## Possible Issues

### 1. **OpenKit May Not Support SaaS "Custom Applications"**
- OpenKit was designed for mobile apps and on-prem/managed installations
- SaaS "Custom Applications" created via Config API might use a different data ingestion path
- The `/mbeacon` endpoint might only exist for applications created through the UI

### 2. **Beacon Endpoint Not Activated**
- The application was created but the beacon endpoint wasn't automatically provisioned
- May require additional setup or activation step we haven't found

### 3. **Authentication Required for SaaS**
- SaaS might require token-based authentication for beacon submissions
- OpenKit SDK doesn't support beacon authentication out of the box

### 4. **Different Beacon URL Pattern**
- The beacon URL might need a different format for SaaS (e.g., `/api/v2/mbeacon` or include application ID in path)
- Cluster ActiveGate might have a different endpoint structure

---

## Next Steps to Investigate

### Option 1: Check Dynatrace Documentation
- [ ] Review latest OpenKit documentation for SaaS
- [ ] Check if there's a "SaaS" mode or configuration
- [ ] Look for ActiveGate-specific beacon URLs

### Option 2: Try Alternative Beacon Endpoints
- [ ] `/api/v2/beacon`
- [ ] `/api/v1/beacon`
- [ ] Include application ID in URL path
- [ ] Different query parameters

### Option 3: Use Browser-Based Instrumentation Instead
Since the application is a "Custom Application":
- [ ] Use Dynatrace JavaScript RUM Agent
- [ ] Manual beacon API calls with authentication
- [ ] OneAgent SDK (if applicable for backend simulation)

### Option 4: Contact Dynatrace Support
Questions to ask:
- Does OpenKit work with SaaS Custom Applications created via Config API?
- What's the correct beacon endpoint for SaaS CLUSTER_ACTIVE_GATE?
- Is there additional configuration needed to enable OpenKit data ingestion?

### Option 5: Use ActiveGate
If you have an ActiveGate:
- Configure application to use ActiveGate beacon endpoint
- Update `beacon EndpointType` to `INSTRUMENTED_WEB_SERVER` or specific ActiveGate URL

---

## Alternative Approaches

### 1. **Direct Beacon API (Manual Implementation)**
Instead of OpenKit, implement direct beacon protocol:
```javascript
// POST to beacon endpoint with custom payload
const beaconData = {
  sessions: [...],
  actions: [...],
  values: [...]
};
```

Pros: Full control, works with authentication
Cons: No SDK, manual protocol implementation

### 2. **JavaScript RUM Agent**
Use the browser-based agent instead:
```html
<script type="text/javascript" src="https://js-cdn.dynatrace.com/..."></script>
```

Pros: Official, fully supported for web applications
Cons: Requires actual browser, not Node.js

### 3. **Synthetic Monitors**
Use Dynatrace Synthetic Monitoring:
- Create browser monitors
- Script user journeys
- Let Dynatrace handle data collection

Pros: Official Dynatrace feature
Cons: Different from your generator approach

### 4. **Wait for OpenKit Updates**
OpenKit might add SaaS support in future releases

---

## Code Changes Made

### 1. Setup Wizard Enhancement
- [src/setup_dynatrace_application.js](../src/setup_dynatrace_application.js)
- Now supports all URL formats: `.live`, `.apps`, `.sprint`
- Auto-detects and uses correct domain for APIs

### 2. Diagnostic Tools Created
- [src/test_beacon.js](../src/test_beacon.js) - Tests beacon connectivity
- [src/get_application_config.js](../src/get_application_config.js) - Fetches app config

### 3. Configuration Updates
- [business_config.json](../business_config.json) - Complete Harvard Pilgrim example
- Tried both `CUSTOM_APPLICATION-xxx` and UUID formats

---

## Recommendations

### For Immediate Testing:
1. **Try with Sprint Tenant** (if available)
   - Sprint tenants might have different beacon configuration
   - Legacy endpoints might work better

2. **Check Dynatrace Web UI**
   - Navigate to the application in UI
   - Look for "Instrumentation" or "Setup" instructions
   - See if there's a JavaScript snippet or different integration method

### For Production Use:
1. **Contact Dynatrace Support** - Get official guidance on OpenKit + SaaS
2. **Use JavaScript Agent** - If this is for web application simulation
3. **Use Synthetic Monitors** - If goal is testing/monitoring

### For This Project:
1. **Document as "Sprint Tenant Compatible"** - Works with sprint tenants
2. **Add SaaS Workaround Section** - Document the issues found
3. **Provide Alternative Solutions** - JavaScript agent, Synthetic monitors

---

## Files & Resources

- **Application Config:** [src/get_application_config.js](../src/get_application_config.js)
- **Beacon Test:** [src/test_beacon.js](../src/test_beacon.js)
- **Generator:** [src/rum_session_generator.js](../src/rum_session_generator.js)
- **Setup Wizard:** [src/setup_dynatrace_application.js](../src/setup_dynatrace_application.js)

---

## Conclusion

While the Custom Application was successfully created via API, OpenKit SDK cannot currently send data to it due to beacon endpoint incompatibility. This appears to be a limitation of using OpenKit with SaaS Custom Applications created through the Configuration API.

**Status:** ⚠️ Blocked - Requires Dynatrace support or alternative approach

**Recommended Next Action:** Contact Dynatrace support with Application ID and tenant details to get guidance on proper OpenKit configuration for SaaS.
