# Universal Dynatrace RUM Session Generator

**A configuration-driven OpenKit implementation for generating synthetic Real User Monitoring (RUM) sessions in Dynatrace.**

## 🎯 What This Is

This is a **business-agnostic RUM session generator** that uses Dynatrace OpenKit SDK to simulate real user interactions. Perfect for:
- Testing Dynatrace Custom Applications
- Generating demo data for dashboards
- Load testing user journey analytics
- Training and demonstrations
- **Easily adapting for different businesses/industries by changing configuration only**

## 📦 Files Overview

| File | Purpose | Modify For New Business? |
|------|---------|:------------------------:|
| `setup_dynatrace_application.js` | Interactive setup wizard | ❌ No |
| `rum_session_generator.js` | Universal session generator | ❌ No |
| `business_config_template.json` | Configuration template | ✅ Copy & customize |
| `harvard_pilgrim_config.json` | Example: Healthcare | ✅ Use as reference |

## 🚀 Quick Start (3 Steps)

### 1️⃣ Initial Setup

```bash
# Run the setup wizard (one-time)
node setup_dynatrace_application.js
```

The wizard will:
- Validate your Dynatrace credentials
- Guide you through creating a Custom Application
- Generate your business configuration file

### 2️⃣ Install OpenKit SDK

```bash
npm install @dynatrace/openkit-js
```

### 3️⃣ Generate Sessions

```bash
# Use default configuration
node rum_session_generator.js

# Or specify a custom config
node rum_session_generator.js my_business_config.json
```

## 🏗️ Creating Configuration for a New Business

### Option A: Use the Template

1. Copy `business_config_template.json`
2. Replace placeholder values:
   - `REPLACE_WITH_BUSINESS_NAME`
   - `REPLACE_WITH_APPLICATION_NAME`
   - `REPLACE_WITH_INDUSTRY`
   - `YOUR_TENANT_ID`
   - `CUSTOM_APPLICATION-XXXXXXXXXXXXXXXX`

3. Customize the `business` section:
   - **userProfiles**: Define your users (names, emails, properties)
   - **userJourneys**: Map out page flows and actions
   - **errorSimulation**: Set error rates and types
   - **performanceMetrics**: Adjust timing ranges

### Option B: Learn From Example

See `harvard_pilgrim_config.json` for a complete Healthcare industry example with:
- 4 user personas (Premium, Standard, Family, Senior members)
- 4 user journeys (Premium Payment, View Claims, Download Card, Find Provider)
- Healthcare-specific actions and metrics

### Example: Adapting for E-Commerce

```json
{
  "metadata": {
    "businessName": "Acme Retail",
    "applicationName": "Online Store",
    "industry": "E-Commerce"
  },
  "business": {
    "userProfiles": [
      {
        "name": "Jane Shopper",
        "email": "jane@example.com",
        "userType": "returning_customer",
        "customProperties": {
          "loyaltyTier": "Gold",
          "totalOrders": 47,
          "avgOrderValue": 89.50
        }
      }
    ],
    "userJourneys": {
      "purchaseFlow": {
        "name": "Product Purchase",
        "pages": [
          {
            "name": "Homepage",
            "duration": 2000,
            "actions": ["view_featured_products", "search"]
          },
          {
            "name": "Product Page",
            "duration": 3500,
            "actions": ["view_images", "read_reviews", "add_to_cart"]
          },
          {
            "name": "Checkout",
            "duration": 4000,
            "actions": ["enter_shipping", "select_payment", "place_order"]
          }
        ]
      }
    }
  }
}
```

## 📊 Configuration Structure

### Metadata Section
```json
{
  "metadata": {
    "businessName": "Your Company",      // Display name
    "applicationName": "Your App",       // Application name
    "industry": "Your Industry",         // Healthcare, Finance, Retail, etc.
    "configVersion": "1.0.0"
  }
}
```

### Dynatrace Section
```json
{
  "dynatrace": {
    "tenant": "abc12345",                         // Dynatrace tenant ID
    "tenantUrl": "https://abc12345.live.dynatrace.com",
    "applicationId": "CUSTOM_APPLICATION-...",    // From Custom App
    "beaconUrl": "https://abc12345.live.dynatrace.com/mbeacon",
    "applicationVersion": "1.0.0"
  }
}
```

### Business Section (Customize This!)
```json
{
  "business": {
    "userProfiles": [...],              // Who are your users?
    "userJourneys": {...},              // What do they do?
    "errorSimulation": {...},           // How often do errors occur?
    "performanceMetrics": {...}         // How fast should pages load?
  }
}
```

## 🎭 User Profiles

Define realistic user personas:

```json
{
  "name": "Sarah Johnson",
  "email": "sarah.johnson@email.com",
  "clientIP": "198.51.100.42",
  "userType": "premium",
  "customProperties": {
    "memberId": "HP-89012345",
    "planType": "Gold Premium",
    "segment": "high_value"
  }
}
```

**Tips:**
- Use realistic names and emails
- Add business-specific properties
- Different user types = different journeys

## 🗺️ User Journeys

Map multi-page workflows:

```json
{
  "premiumPayment": {
    "name": "Premium Payment Flow",
    "description": "User pays monthly premium",
    "pages": [
      {
        "name": "Homepage",
        "duration": 2500,
        "actions": ["view_banner", "click_login"]
      },
      {
        "name": "Login",
        "duration": 3000,
        "actions": ["enter_credentials", "submit"]
      }
    ]
  }
}
```

**Tips:**
- Each journey = a complete user flow
- Pages execute sequentially
- Actions execute within each page
- Duration in milliseconds

## ⚙️ Advanced Configuration

### Error Simulation
```json
{
  "errorSimulation": {
    "enabled": true,
    "errorRate": 0.03,                    // 3% of actions fail
    "errorTypes": [
      "API Timeout",
      "Network Error",
      "Invalid Input"
    ]
  }
}
```

### Performance Tuning
```json
{
  "performanceMetrics": {
    "pageLoadTimeRange": {
      "min": 1000,                        // Fastest page load
      "max": 3000                         // Slowest page load
    },
    "actionDurationRange": {
      "min": 200,
      "max": 1000
    }
  }
}
```

## 🔍 Verifying in Dynatrace

After running the generator:

1. Navigate to: **Applications** → **Custom applications**
2. Find your application: `[Business Name] - [Application Name]`
3. Click **User sessions**
4. Filter: **Last 15 minutes**
5. You should see:
   - Session count matching number of user profiles
   - User identifiers (emails)
   - User actions and page views
   - Performance metrics

## 🧪 Testing Without OpenKit

The generator includes a **mock mode** for testing configurations without installing OpenKit:

```bash
# Run without @dynatrace/openkit-js installed
node rum_session_generator.js
```

You'll see simulated output showing:
- Session flow
- Actions executed
- Metrics reported
- Errors simulated

**Mock mode is perfect for:**
- Validating your configuration structure
- Testing business logic
- Demonstrations
- Development without Dynatrace access

## 🛠️ Troubleshooting

### "Configuration file not found"
**Solution:** Run `node setup_dynatrace_application.js` first, or create `business_config.json` manually.

### "OpenKit SDK not found"
**Solution:** Install with `npm install @dynatrace/openkit-js`

### "Missing required configuration field"
**Solution:** Check your config has all required fields:
- `metadata.businessName`
- `dynatrace.applicationId`
- `business.userProfiles`
- `business.userJourneys`

### No sessions in Dynatrace
**Check:**
1. Application ID is correct (from Custom Application in Dynatrace UI)
2. Beacon URL matches your tenant
3. Custom Application is properly created
4. Wait 2-3 minutes for data ingestion

### OpenKit initialization timeout
**Solutions:**
- Verify beacon URL is accessible
- Check firewall rules
- Confirm Application ID exists
- Increase timeout in code if needed

## 📖 API Reference

### OpenKit Actions

| Method | Purpose | Example |
|--------|---------|---------|
| `enterAction(name)` | Start a user action | `session.enterAction('Login')` |
| `leaveAction()` | End an action | `action.leaveAction()` |
| `reportEvent(name)` | Log an event | `action.reportEvent('Button Click')` |
| `reportValue(name, ms)` | Log a metric | `action.reportValue('Load Time', 2500)` |
| `reportError(name, code, reason)` | Log an error | `action.reportError('API Error', 500, 'Timeout')` |
| `identifyUser(id)` | Set user identity | `session.identifyUser('user@example.com')` |

### Session Lifecycle

1. **Initialize OpenKit** → `createOpenKit(config, deviceId)`
2. **Wait for Init** → `openKit.waitForInit(callback, timeout)`
3. **Create Session** → `openKit.createSession(clientIP)`
4. **Identify User** → `session.identifyUser(email)`
5. **Enter Actions** → `session.enterAction(name)`
6. **Report Metrics** → `action.reportValue(name, value)`
7. **Leave Actions** → `action.leaveAction()`
8. **End Session** → `session.end()`
9. **Shutdown** → `openKit.shutdown()`

## 🎓 Best Practices

### Configuration
- ✅ Use meaningful names for journeys and actions
- ✅ Vary page load times realistically
- ✅ Include error scenarios (2-5% error rate)
- ✅ Add business-specific custom properties
- ❌ Don't use fake/test Application IDs
- ❌ Don't set unrealistic timings (sub-100ms pages)

### User Profiles
- ✅ Create 3-5 distinct personas
- ✅ Use realistic data (names, emails, IPs)
- ✅ Add custom properties for segmentation
- ✅ Vary user types for different journeys

### User Journeys
- ✅ Map real business workflows
- ✅ Include 3-5 pages per journey
- ✅ Add 2-5 actions per page
- ✅ Use descriptive action names
- ❌ Don't create unrealistically short/long flows

## 🔗 Resources

### Dynatrace Documentation
- [Custom Applications Overview](https://docs.dynatrace.com/docs/observe/digital-experience/custom-applications)
- [OpenKit API Reference](https://docs.dynatrace.com/docs/ingest-from/extend-dynatrace/openkit/dynatrace-openkit-api-methods)
- [OpenKit JavaScript Guide](https://docs.dynatrace.com/docs/ingest-from/extend-dynatrace/openkit/instrument-your-application-using-dynatrace-openkit)
- [OpenKit GitHub](https://github.com/Dynatrace/openkit-js)

### Support
For issues with the generator:
- Check configuration file structure
- Verify Dynatrace credentials
- Review console output for errors
- Test with mock mode first

For Dynatrace-specific issues:
- Consult official documentation
- Contact Dynatrace support

## 📝 License

This is a utility tool for Dynatrace OpenKit. Follow Dynatrace's licensing terms for OpenKit SDK usage.

---

**Built for easy business adaptation** 🚀
*Change configuration, not code.*
