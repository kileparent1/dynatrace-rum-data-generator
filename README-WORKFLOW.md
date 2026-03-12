# HP-RUMGEN-WORKFLOW - Dynatrace Workflow Edition

## 🎯 Purpose

Generate realistic RUM (Real User Monitoring) test data for Harvard Pilgrim Member Portal directly from Dynatrace Workflows using **Custom Events API** - no npm packages required.

## ✅ Requirements

- **Dynatrace Environment**: SaaS or Managed
- **API Token** with `events.ingest` scope
- **Workflow Actions Available**:
  - ✅ Run JavaScript
  - ✅ HTTP Request
  - ✅ Dynatrace API Actions (optional)

## 🚀 Setup Instructions

### Step 1: Create API Token

1. Go to **Settings → Access Tokens → Generate new token**
2. Token name: `RUM Generator Workflow`
3. **Required scope**: `Ingest events (events.ingest)`
4. Copy the token (you'll need it in Step 3)

### Step 2: Create Workflow

1. Go to **Workflows** in Dynatrace
2. Click **Create Workflow**
3. Name: `Harvard Pilgrim RUM Data Generator`
4. Trigger: **Schedule**
   - Example: Run every hour during business hours
   - Example: Run daily at 9 AM
   - Example: Run every 15 minutes (for continuous testing)

### Step 3: Configure Workflow Tasks

#### Option A: Single JavaScript Task (Simple)

1. Add task: **Run JavaScript**
2. Copy the **entire contents** of `HP-RUMGEN-WORKFLOW.js`
3. Paste into the JavaScript editor
4. **Modify line 94** to add your API token:

```javascript
async function sendCustomEvent(eventData) {
  const apiUrl = `${CONFIG.dynatrace.tenantUrl}/api/v2/events/ingest`;
  const apiToken = 'YOUR_API_TOKEN_HERE'; // ← Add your token here
  
  const event = {
    eventType: "CUSTOM_INFO",
    title: eventData.title,
    entitySelector: `type("APPLICATION"),entityId("${CONFIG.dynatrace.applicationId}")`,
    properties: eventData.properties,
    startTime: generateTimestamp(),
    timeout: 0
  };

  console.log(`📤 Sending event: ${eventData.title}`);
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Api-Token ${apiToken}`
    },
    body: JSON.stringify(event)
  });

  if (!response.ok) {
    console.error(`❌ Failed to send event: ${response.status} ${response.statusText}`);
  }
  
  return event;
}
```

5. Save and test

#### Option B: Using HTTP Request Actions (Recommended)

For better security (tokens stored as workflow variables):

1. **Task 1**: Run JavaScript to generate event data
2. **Task 2**: HTTP Request to send each event
3. Use workflow variable: `{{ _.apiToken }}`

### Step 4: Configure Your Dynatrace Details

In the workflow JavaScript, update the `CONFIG` section:

```javascript
const CONFIG = {
  dynatrace: {
    tenant: "YOUR_TENANT",  // e.g., "abc12345"
    tenantUrl: "https://YOUR_TENANT.sprint.dynatracelabs.com",
    applicationId: "YOUR_APPLICATION_ID",  // UUID format
    applicationVersion: "2.1.0"
  },
  // ... rest of config
};
```

**Finding Your Application ID:**
1. Go to **Applications → Custom Application**
2. Click your application
3. Look in URL: `.../ui/apps/...?id=APPLICATION-XXXXXXXXXXXXXXXXX`
4. Or check application settings for UUID format

## 📊 What Gets Generated

Each workflow execution generates:

- **4 User Sessions** (Sarah, Michael, Emily, James)
- **4 Different User Journeys**:
  - Premium Payment Flow (5 pages)
  - View Claims History (4 pages)
  - Download Insurance Card (4 pages)
  - Find Healthcare Provider (4 pages)
- **~20-30 Custom Events** per execution:
  - Session start/end
  - Page views
  - User actions
  - Errors (3% chance)

## 🔍 Viewing Generated Data

### Custom Events Dashboard

1. Go to **Problems & Events → Events**
2. Filter by: `RUM Session` or `RUM Page View`
3. Time range: Last 15-60 minutes
4. View event properties:
   - `sessionId`
   - `userName`
   - `journeyName`
   - `pageLoadTime`
   - `pageName`

### Create Custom Dashboard

1. **Dashboard Name**: Harvard Pilgrim RUM Analytics
2. **Tiles**:
   - Total Sessions (by userName)
   - Journey Distribution
   - Average Page Load Times
   - Error Rate
   - Active Users Timeline

#### Example DQL Query:

```dql
fetch events
| filter event.type == "CUSTOM_INFO" 
| filter event.name startsWith "RUM Session"
| summarize count = count(), by: {properties.userName, properties.journeyName}
| sort count desc
```

## 🔄 Schedule Examples

### Option 1: Business Hours Testing
```
Every hour from 9 AM to 5 PM EST
Trigger: Cron expression: 0 9-17 * * 1-5
```

### Option 2: Continuous Load
```
Every 15 minutes, 24/7
Trigger: Cron expression: */15 * * * *
```

### Option 3: Daily Peak Hours
```
Multiple times per day
Trigger: Cron expression: 0 9,12,15,18 * * *
```

## 🛠️ Customization

### Add Your Own Users

Edit `CONFIG.business.userProfiles`:

```javascript
{
  name: "John Doe",
  email: "john.doe@email.com",
  userType: "premium",
  memberId: "HP-99999999",
  planType: "Platinum Plan"
}
```

### Add Your Own Journeys

Edit `CONFIG.business.userJourneys`:

```javascript
{
  name: "Telehealth Visit",
  pages: ["Homepage", "Login", "Virtual Care", "Schedule Appointment", "Confirmation"]
}
```

### Adjust Error Rate

Change line 71:

```javascript
if (Math.random() < 0.10) {  // 10% error rate (was 3%)
```

## 🐛 Troubleshooting

### Events Not Appearing

1. **Check API Token Scope**:
   - Must have `events.ingest` permission
   - Token must be active (check expiration)

2. **Verify Application ID**:
   - Must match existing application in Dynatrace
   - Use UUID format: `72774fd5-9655-470f-a1a5-ee6bb9f46df9`

3. **Check Workflow Execution Logs**:
   - Look for HTTP 401 (invalid token)
   - Look for HTTP 404 (application not found)
   - Look for HTTP 400 (malformed event data)

### Token Not Working

```javascript
// Test with curl:
curl -X POST "https://YOUR_TENANT.sprint.dynatracelabs.com/api/v2/events/ingest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Api-Token YOUR_TOKEN" \
  -d '{"eventType":"CUSTOM_INFO","title":"Test"}'
```

### No Data in Dashboards

- Wait 2-3 minutes for events to be ingested
- Expand time range to "Last 1 hour"
- Check event filter expressions
- Verify entity selector matches your application

## 📝 Advanced: Using Dynatrace API Actions

Instead of HTTP Request, use workflow's built-in **Dynatrace API** action:

1. Task type: **Dynatrace API**
2. API: **Events API v2**
3. Endpoint: **POST /events/ingest**
4. Body: Generated from JavaScript task output

## 🎓 Best Practices

1. **Token Security**: Store API token as workflow variable, not hardcoded
2. **Error Handling**: Add try-catch in HTTP requests
3. **Rate Limiting**: Don't run more than once per minute
4. **Monitoring**: Create alerts on workflow failures
5. **Testing**: Run manually first before scheduling

## 📖 Related Files

- `HP-RUMGEN-WORKFLOW.js` - Main workflow script
- `HP-RUMGEN-001.js` - Local Node.js version (requires npm)
- `harvard_pilgrim_config.json` - Full configuration reference

## 🔗 Helpful Links

- [Dynatrace Events API v2 Documentation](https://www.dynatrace.com/support/help/dynatrace-api/environment-api/events-v2)
- [Workflow JavaScript Actions](https://www.dynatrace.com/support/help/platform-modules/automations/workflows/actions/run-javascript)
- [Custom Events in Dynatrace](https://www.dynatrace.com/support/help/how-to-use-dynatrace/events-and-issues/custom-events)

## 💡 Migration from Local Node.js Version

If you used `HP-RUMGEN-001.js` locally:

**Differences**:
- ❌ No OpenKit SDK
- ✅ Uses Custom Events API instead
- ✅ No npm dependencies
- ✅ Runs directly in Dynatrace
- ⚠️ Events appear differently in UI (not native RUM sessions)

**Why Custom Events?**
- Dynatrace workflows can't run OpenKit SDK
- Custom Events API is workflow-compatible
- Provides similar observability data
- Can still track sessions, pages, actions, errors

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Author**: Dynatrace RUM Generator Project
