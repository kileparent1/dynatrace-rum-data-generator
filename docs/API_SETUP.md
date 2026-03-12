# 🤖 Automated Custom Application Setup

The setup wizard now **automatically creates Custom Applications** via the Dynatrace Configuration API!

## ✨ What's New

Previously: Manual UI steps required to create applications
Now: **Fully automated via API** - no UI interaction needed!

---

## 🚀 Quick Setup (Fully Automated)

```bash
node src/setup_dynatrace_application.js
```

### What It Does:

1. **✅ Validates Connection** - Tests your Dynatrace environment access
2. **✅ Creates Application** - Automatically via `POST /api/config/v1/applications/mobile`
3. **✅ Configures OpenKit** - Sets up proper beacon URLs and settings
4. **✅ Saves Configuration** - Generates complete `business_config.json`

### Example Session:

```
==================================================
  Dynatrace Custom Application Setup Wizard
==================================================

📋 Step 1: Dynatrace Environment Configuration
--------------------------------------------------
Enter your Dynatrace tenant (e.g., abc12345): fzw9231h
Enter your Dynatrace API token: dt0c01.TANAV4S...

🔍 Validating connection to Dynatrace...
✅ Connection validated successfully!

📋 Step 2: Business Configuration
--------------------------------------------------
Business/Company Name (e.g., Harvard Pilgrim): Acme Corp
Application Name (e.g., Member Portal): E-Commerce Site
Industry (e.g., Healthcare, Finance, Retail): Retail
Application Version (default: 1.0.0): 1.0.0

📋 Step 3: Creating Custom Application
--------------------------------------------------
🔧 Creating application: "Acme Corp - E-Commerce Site"
   Using Dynatrace Configuration API...

✅ Custom Application created successfully!
   Application ID: CUSTOM_APPLICATION-A1B2C3D4E5F6G7H8

✅ Beacon URL: https://fzw9231h.sprint.dynatracelabs.com/mbeacon

✅ Configuration saved to: ./business_config.json

🎉 Setup Complete!
```

---

## 🔑 API Token Requirements

### For Automatic Creation (Recommended):
Your API token needs **WriteConfig** scope:
- Scope: `WriteConfig` (Create and edit monitoring configurations)
- Or: `DataExport`, `settings.write`, or `ReadWrite`

### Token Creation Steps:
1. Go to: **Settings** → **Integration** → **Dynatrace API**
2. Click: **Generate token**
3. Name: `RUM Data Generator`
4. Scopes: ☑ **Write configuration**
5. Click: **Generate**
6. Copy token (starts with `dt0c01.`)

### For Manual Fallback:
If token lacks WriteConfig, wizard automatically falls back:
- Validates connection only
- Prompts for manual application creation
- Guides through UI steps
- Accepts Application ID from you

---

## 📡 API Endpoint Used

**POST** `/api/config/v1/applications/mobile`

### Request Body:
```json
{
  "name": "Harvard Pilgrim - Member Portal",
  "applicationType": "CUSTOM_APPLICATION",
  "costControlUserSessionPercentage": 100,
  "loadActionKeyPerformanceMetric": "VISUALLY_COMPLETE",
  "xhrActionKeyPerformanceMetric": "VISUALLY_COMPLETE",
  "customActionApdexSettings": {
    "frustratingFallbackThreshold": 12000,
    "frustratingThreshold": 12000,
    "toleratedFallbackThreshold": 3000,
    "toleratedThreshold": 3000
  },
  "loadActionApdexSettings": {
    "frustratingFallbackThreshold": 12000,
    "frustratingThreshold": 12000,
    "toleratedFallbackThreshold": 3000,
    "toleratedThreshold": 3000
  },
  "xhrActionApdexSettings": {
    "frustratingFallbackThreshold": 12000,
    "frustratingThreshold": 12000,
    "toleratedFallbackThreshold": 3000,
    "toleratedThreshold": 3000
  }
}
```

### Response:
```json
{
  "id": "CUSTOM_APPLICATION-A1B2C3D4E5F6G7H8",
  "name": "Harvard Pilgrim - Member Portal"
}
```

---

## 🔧 Configuration Generated

The wizard creates a complete OpenKit-ready configuration:

```json
{
  "metadata": {
    "businessName": "Harvard Pilgrim",
    "applicationName": "Member Portal",
    "industry": "Healthcare",
    "createdDate": "2026-03-12T10:30:00.000Z",
    "configVersion": "1.0.0"
  },
  "dynatrace": {
    "tenant": "fzw9231h",
    "tenantUrl": "https://fzw9231h.sprint.dynatracelabs.com",
    "applicationId": "CUSTOM_APPLICATION-A1B2C3D4E5F6G7H8",
    "beaconUrl": "https://fzw9231h.sprint.dynatracelabs.com/mbeacon",
    "applicationVersion": "1.0.0"
  },
  "openkit": {
    "operatingSystem": "Windows 10",
    "manufacturer": "Harvard Pilgrim",
    "modelId": "Member Portal_v1.0.0",
    "logLevel": "INFO"
  },
  "business": {
    // Customize with your user profiles and journeys
  }
}
```

---

## 🛠️ Troubleshooting

### Error: 401 Unauthorized
```
❌ Authentication failed
⚠️  Please check:
   - Token format is correct (starts with dt0c01)
   - Token has not expired
```

**Solution:** Regenerate token in Dynatrace

---

### Error: 403 Forbidden
```
❌ Failed to create application (HTTP 403)
⚠️  Token requires these permissions:
   - WriteConfig (Create and edit monitoring configurations)
```

**Solution:** 
1. Create new token with **WriteConfig** scope
2. Or wizard will fall back to manual creation

---

### Error: Timeout
```
❌ Request timeout (15 seconds)
```

**Causes:**
- Network connectivity issues
- Firewall blocking HTTPS
- VPN required but not connected

**Solution:** Check network and retry

---

## 📝 Manual Override

If you prefer manual creation, you can still skip the API:

```bash
node src/setup_dynatrace_application.js
```

When prompted, use a token **without WriteConfig**:
- Wizard will prompt for manual creation
- Follow UI steps it provides
- Enter Application ID manually

---

## 🚀 Next Steps After Setup

1. **Install OpenKit:**
   ```bash
   npm install @dynatrace/openkit-js
   ```

2. **Customize Configuration:**
   - Edit `business_config.json`
   - Add user profiles
   - Define user journeys

3. **Generate Sessions:**
   ```bash
   node src/rum_session_generator.js business_config.json
   ```

4. **Verify in Dynatrace:**
   - Navigate to **Applications**
   - Find your custom application
   - Check **User sessions** view

---

## 📚 API Documentation

**Dynatrace RUM Configuration API:**
https://docs.dynatrace.com/docs/dynatrace-api/configuration-api/rum/mobile-custom-app-configuration

**Key Endpoints:**
- `POST /api/config/v1/applications/mobile` - Create application
- `GET /api/config/v1/applications/mobile/{id}` - Get application details
- `PUT /api/config/v1/applications/mobile/{id}` - Update application
- `DELETE /api/config/v1/applications/mobile/{id}` - Delete application

---

## ✅ Benefits of API Creation

**vs. Manual UI Creation:**

| Feature | API Creation | Manual UI |
|---------|-------------|-----------|
| Speed | ⚡ 5 seconds | 🐌 2-3 minutes |
| Automation | ✅ Fully scripted | ❌ Manual clicks |
| Repeatability | ✅ Identical configs | ⚠️ Human error |
| CI/CD Ready | ✅ Yes | ❌ No |
| Version Control | ✅ Config as code | ❌ UI only |
| Bulk Creation | ✅ Loop script | ❌ One by one |

**Perfect for:**
- Development/test environments
- CI/CD pipelines
- Multi-tenant setups
- Infrastructure as Code
- Rapid prototyping

---

**Ready to try it?**

```bash
node src/setup_dynatrace_application.js
```
