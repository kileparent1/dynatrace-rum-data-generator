# HP-RUMGEN-001.js - Standalone RUM Generator

## 🚀 Quick Start (One Command!)

```bash
node HP-RUMGEN-001.js
```

That's it! No configuration files needed.

## ✅ Prerequisites

Only one prerequisite:

```bash
npm install @dynatrace/openkit-js
```

## 📋 What It Does

Generates **4 realistic user sessions** for Harvard Pilgrim Member Portal:

1. **Sarah Johnson** → Premium Payment Flow (Gold Premium HMO)
2. **Michael Chen** → View Claims History (Standard PPO)
3. **Emily Rodriguez** → Download Insurance Card (Family Plan)
4. **James Patterson** → Find Healthcare Provider (Medicare Advantage)

Each session includes:
- ✅ Realistic page load times (1.2s - 3.5s)
- ✅ User actions with timing metrics
- ✅ Error simulation (3% error rate)
- ✅ User identification & custom properties
- ✅ Complete journey tracking

## 🔧 Built-In Configuration

All configuration is embedded in the file:

- **Dynatrace Tenant:** fzw9231h.sprint.dynatracelabs.com
- **Application ID:** 72774fd5-9655-470f-a1a5-ee6bb9f46df9
- **4 User Profiles:** Premium, Standard, Family, Senior
- **4 User Journeys:** Payment, Claims, Card Download, Provider Search

## 📊 Expected Output

```
██████████████████████████████████████████████████████████████████████
  Harvard Pilgrim RUM Generator - Standalone Edition v1.0.0
██████████████████████████████████████████████████████████████████████

📊 Configuration Summary:
   Business: Harvard Pilgrim
   Application: Member Portal
   Industry: Healthcare
   Dynatrace Tenant: fzw9231h
   Application ID: 72774fd5-9655-470f-a1a5-ee6bb9f46df9
   User Profiles: 4
   User Journeys: 4

🚀 Starting session generation...

[1/4] Generating session...
Starting session for: Sarah Johnson
Journey: Premium Payment Flow
✅ OpenKit initialization complete - capturing session data
...

📊 Results: 4/4 sessions successful
```

## 🔍 Verify in Dynatrace

After running, check your data:

1. Open: https://fzw9231h.sprint.dynatracelabs.com
2. Navigate to: **Applications** → **Custom applications**
3. Click: **Harvard Pilgrim - Member Portal**
4. View: **User sessions** (last 15 minutes)

You should see 4 sessions with realistic user behavior!

## 💡 Customization

To customize for your environment:

1. **Edit the `CONFIG` object** in HP-RUMGEN-001.js (starts at line 28)
2. **Update these values:**
   - `dynatrace.tenant` - Your tenant ID
   - `dynatrace.tenantUrl` - Your Dynatrace URL
   - `dynatrace.applicationId` - Your Application ID (UUID format)
   - `dynatrace.beaconUrl` - Your beacon endpoint

3. **Optionally customize:**
   - `business.userProfiles` - Change user details
   - `business.userJourneys` - Modify page flows
   - `business.errorSimulation` - Adjust error rates
   - `business.performanceMetrics` - Tune timing ranges

## 🆚 Standalone vs Modular

| Feature | HP-RUMGEN-001.js | src/rum_session_generator.js |
|---------|------------------|------------------------------|
| Configuration | Embedded | External JSON file |
| Usage | `node HP-RUMGEN-001.js` | `node src/rum_session_generator.js config.json` |
| Customization | Edit source file | Edit JSON file |
| Portability | Single file | Multiple files |
| Use Case | Quick demos, testing | Production, multiple configs |

## 🐛 Troubleshooting

### OpenKit SDK not found
```bash
npm install @dynatrace/openkit-js
```

### All sessions fail with 404
- Verify Application ID is correct
- Check that Application exists in Dynatrace UI
- Ensure Application is **Custom Application** type (not Web Application)

### Beacon timeout
- Check network connectivity to Dynatrace tenant
- Verify firewall isn't blocking HTTPS connections
- Confirm beacon URL matches Dynatrace UI

## 📁 Related Files

- **HP-RUMGEN-001.js** - This standalone generator (you are here)
- **src/rum_session_generator.js** - Modular generator with external config
- **examples/harvard_pilgrim_config.json** - Full configuration example
- **docs/QUICKSTART.md** - Complete project documentation

## 🎯 Next Steps

1. **Run it:** `node HP-RUMGEN-001.js`
2. **Verify data** in Dynatrace UI
3. **Customize** for your use case
4. **Schedule** with cron/Task Scheduler for continuous data
5. **Scale** by running multiple instances

---

**Questions?** Check the main project documentation in `docs/` or the examples in `examples/`
