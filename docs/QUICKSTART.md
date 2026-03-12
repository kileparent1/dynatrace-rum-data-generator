# 🚀 Quick Start: Get RUM Sessions in 5 Minutes

## For Harvard Pilgrim (or any first-time user)

### ✅ Prerequisites
- Node.js installed
- Dynatrace environment access
- API token with `settings.write` and `settings.read` permissions

---

## Step 1: Run Setup Wizard (2 minutes)

```bash
node setup_dynatrace_application.js
```

**You'll be asked for:**
1. Dynatrace tenant ID (e.g., `fzw9231h`)
2. API token
3. Business name (e.g., `Harvard Pilgrim`)
4. Application name (e.g., `Member Portal`)
5. Industry (e.g., `Healthcare`)

**Then do this manually:**
1. Create Custom Application in Dynatrace UI
2. Copy the Application ID
3. Paste it back into the wizard

**Result:** `business_config.json` created ✓

---

## Step 2: Install OpenKit (30 seconds)

```bash
npm install @dynatrace/openkit-js
```

---

## Step 3: Customize Your Config (1 minute)

**Option A: Use Harvard Pilgrim Example**
```bash
# Copy the example
cp harvard_pilgrim_config.json my_config.json

# Edit to add YOUR Application ID
notepad my_config.json
```

**Option B: Customize From Scratch**
```bash
# Copy the template
cp business_config_template.json my_config.json

# Fill in your:
notepad my_config.json
```

Update these fields:
- `dynatrace.applicationId` ← From Custom App you created
- `business.userProfiles` ← Your user personas
- `business.userJourneys` ← Your page flows

---

## Step 4: Generate Sessions (1 minute)

```bash
node rum_session_generator.js my_config.json
```

**You'll see:**
```
Starting session for: Sarah Johnson
Journey: Premium Payment Flow

--- Page: Homepage ---
  [Action] ▶ View Homepage
    [Event] Page Load Start
    [Metric] Page Load Time: 2341ms
    [Event] Page Load Complete
  ...
```

---

## Step 5: Verify in Dynatrace (30 seconds)

1. Go to: **Applications** → **Custom applications**
2. Click your app: `Harvard Pilgrim - Member Portal`
3. Navigate to: **User sessions**
4. **Filter:** Last 15 minutes
5. **Expected:** See sessions from your configured users

---

## 🎯 For Different Businesses

### Example 1: E-Commerce Store

```json
{
  "metadata": {
    "businessName": "Acme Retail",
    "applicationName": "Online Store",
    "industry": "E-Commerce"
  },
  "business": {
    "userJourneys": {
      "checkout": {
        "name": "Purchase Flow",
        "pages": [
          {"name": "Homepage", "actions": ["search_product"]},
          {"name": "Product Page", "actions": ["add_to_cart"]},
          {"name": "Checkout", "actions": ["complete_purchase"]}
        ]
      }
    }
  }
}
```

### Example 2: Banking Application

```json
{
  "metadata": {
    "businessName": "First National Bank",
    "applicationName": "Online Banking",
    "industry": "Finance"
  },
  "business": {
    "userJourneys": {
      "transfer": {
        "name": "Fund Transfer",
        "pages": [
          {"name": "Login", "actions": ["authenticate"]},
          {"name": "Accounts", "actions": ["select_accounts"]},
          {"name": "Transfer", "actions": ["confirm_transfer"]}
        ]
      }
    }
  }
}
```

### Example 3: SaaS Platform

```json
{
  "metadata": {
    "businessName": "CloudTech",
    "applicationName": "Dashboard",
    "industry": "SaaS"
  },
  "business": {
    "userJourneys": {
      "onboarding": {
        "name": "User Onboarding",
        "pages": [
          {"name": "Welcome", "actions": ["watch_tour"]},
          {"name": "Setup", "actions": ["configure_settings"]},
          {"name": "Dashboard", "actions": ["view_analytics"]}
        ]
      }
    }
  }
}
```

---

## 🧪 Test Mode (No OpenKit Needed)

Want to test your configuration first?

```bash
# Run WITHOUT installing OpenKit
node rum_session_generator.js my_config.json
```

You'll see:
- ✅ Configuration validation
- ✅ Mock session execution
- ✅ Action/event simulation
- ⚠️ Note: "Running in MOCK mode"

**Perfect for:**
- Testing your config structure
- Validating user journeys
- Demos without Dynatrace access

---

## 📁 File Summary

| File | Purpose | Edit? |
|------|---------|:-----:|
| `setup_dynatrace_application.js` | One-time setup wizard | ❌ |
| `rum_session_generator.js` | Universal generator | ❌ |
| `business_config_template.json` | Blank template | ✅ Copy |
| `harvard_pilgrim_config.json` | Healthcare example | ✅ Reference |
| `my_config.json` | **Your config** | ✅ Customize |

---

## ⚡ Common Commands

```bash
# Setup (run once)
node setup_dynatrace_application.js

# Install SDK (run once)
npm install @dynatrace/openkit-js

# Generate sessions (run anytime)
node rum_session_generator.js                    # Uses business_config.json
node rum_session_generator.js my_config.json     # Uses custom config

# Test without OpenKit
node rum_session_generator.js my_config.json     # Before npm install
```

---

## 🐛 Quick Troubleshooting

### "Configuration file not found"
```bash
# Run setup first
node setup_dynatrace_application.js
```

### "OpenKit SDK not found"
```bash
npm install @dynatrace/openkit-js
```

### "Missing required configuration field: dynatrace.applicationId"
1. Create Custom Application in Dynatrace UI
2. Copy the Application ID
3. Update config: `"applicationId": "CUSTOM_APPLICATION-..."`

### No sessions in Dynatrace
1. Wait 2-3 minutes for data ingestion
2. Check Application ID is correct
3. Verify beacon URL matches your tenant
4. Confirm Custom Application exists in UI

---

## 🎓 Next Steps

1. **Start simple:** Run with harvard_pilgrim_config.json example
2. **Customize:** Adapt user profiles for your business
3. **Expand:** Add more journeys and actions
4. **Optimize:** Tune error rates and timings
5. **Scale:** Run continuously or schedule with cron/Task Scheduler

---

## 📚 Full Documentation

See `README_UNIVERSAL_RUM.md` for:
- Complete API reference
- Advanced configuration
- Best practices
- Troubleshooting guide

---

**Ready to start?**

```bash
node setup_dynatrace_application.js
```

**Questions?**
- Check README_UNIVERSAL_RUM.md
- Review harvard_pilgrim_config.json example
- Test in mock mode first
