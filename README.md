# KP-RUMGEN - Dynatrace RUM Data Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Dynatrace](https://img.shields.io/badge/Dynatrace-OpenKit-purple)](https://www.dynatrace.com/)

> **Universal configuration-driven RUM session generator using Dynatrace OpenKit SDK**

A business-agnostic Real User Monitoring (RUM) session generator that creates synthetic user sessions in Dynatrace. Perfect for testing, demos, training, and generating baseline metrics. No code changes needed for different businesses—just update the configuration!

## 🌟 Key Features

- **Configuration-Driven**: Change business without touching code
- **OpenKit SDK**: Official Dynatrace SDK (fully supported)
- **Interactive Setup**: Wizard-guided configuration
- **Mock Mode**: Test configs without OpenKit installed
- **Multiple Industries**: Examples for Healthcare, E-Commerce, Finance, SaaS
- **VS Code Optimized**: Full debugging and IntelliSense support
- **Production Ready**: Error handling, validation, and comprehensive docs

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [VS Code Features](#-vs-code-features)
- [Documentation](#-documentation)
- [Examples](#-examples)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

Get up and running in 5 minutes:

```bash
# Clone the repository
git clone https://github.com/kileparent1/dynatrace-rum-data-generator.git
cd dynatrace-rum-data-generator

# Install dependencies
npm install

# Run the setup wizard
npm run setup

# Generate sessions
npm run generate:harvard
```

See [QUICKSTART.md](docs/QUICKSTART.md) for detailed instructions.

## 📦 Installation

### Prerequisites

- **Node.js**: Version 18.0.0 or higher ([Download](https://nodejs.org/))
- **Dynatrace**: Access to a Dynatrace environment
- **API Token**: With `settings.write` and `settings.read` permissions

### Install

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

This will install:
- `@dynatrace/openkit-js` - Official Dynatrace OpenKit SDK
- ESLint and Prettier (dev dependencies)

## 🎯 Usage

### 1. Setup (One-Time)

Run the interactive setup wizard:

```bash
npm run setup
```

This will:
- Validate your Dynatrace connection
- Guide you through creating a Custom Application
- Generate your configuration file

### 2. Generate Sessions

```bash
# Use default configuration
npm run generate

# Use Harvard Pilgrim example
npm run generate:harvard

# Use custom configuration
node src/rum_session_generator.js config/my_business.json
```

### 3. Verify in Dynatrace

1. Navigate to: **Applications** → **Custom applications**
2. Select your application
3. Click **User sessions**
4. Filter: **Last 15 minutes**

You should see sessions with user identifiers, actions, and metrics!

## ⚙️ Configuration

### Create Your Configuration

**Option A: Use the Template**

```bash
cp config/business_config_template.json config/my_business.json
# Edit config/my_business.json
```

**Option B: Use the Harvard Pilgrim Example**

```bash
cp examples/harvard_pilgrim_config.json config/my_business.json
# Edit config/my_business.json with your Application ID
```

### Configuration Structure

```json
{
  "metadata": {
    "businessName": "Your Company",
    "applicationName": "Your App",
    "industry": "Your Industry"
  },
  "dynatrace": {
    "tenant": "abc12345",
    "applicationId": "CUSTOM_APPLICATION-XXXXXXXXXXXXXXXX",
    "beaconUrl": "https://abc12345.live.dynatrace.com/mbeacon"
  },
  "business": {
    "userProfiles": [...],    // Your user personas
    "userJourneys": {...}     // Your page flows
  }
}
```

See [Configuration Guide](docs/README_UNIVERSAL_RUM.md#-configuration-structure) for details.

## 💻 VS Code Features

This project is optimized for VS Code with:

### Debugging

Press **F5** or use the Debug panel to:
- Run Setup Wizard
- Generate Sessions (Default)
- Generate Sessions (Harvard Pilgrim)
- Debug Current File

### Tasks

Access via **Terminal** → **Run Task**:
- Install Dependencies
- Run Setup Wizard
- Generate Sessions (Default)
- Generate Sessions (Harvard Pilgrim)

### IntelliSense

Full autocomplete for:
- JavaScript files
- JSON configuration files
- Node.js APIs

### Recommended Extensions

VS Code will prompt you to install recommended extensions:
- ESLint
- Prettier
- npm IntelliSense
- Path IntelliSense
- Code Runner

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](docs/QUICKSTART.md)** - Get running in 5 minutes
- **[Complete Documentation](docs/README_UNIVERSAL_RUM.md)** - Full API reference and guides

### Technical
- **[Approach Comparison](docs/APPROACH_COMPARISON.md)** - Why OpenKit vs. direct beacons
- **[Investigation Archive](docs/archive/)** - Historical research and findings

### Configuration
- **[Template](config/business_config_template.json)** - Blank configuration template
- **[Harvard Pilgrim Example](examples/harvard_pilgrim_config.json)** - Healthcare industry example

## 🎭 Examples

### Healthcare (Harvard Pilgrim)

```bash
npm run generate:harvard
```

Features:
- 4 user personas (Premium, Standard, Family, Senior)
- 4 user journeys (Premium Payment, View Claims, Download Card, Find Provider)
- Healthcare-specific actions and metrics

### E-Commerce

```json
{
  "businessName": "Acme Retail",
  "applicationName": "Online Store",
  "userJourneys": {
    "checkout": {
      "pages": [
        {"name": "Homepage", "actions": ["search"]},
        {"name": "Product", "actions": ["add_to_cart"]},
        {"name": "Checkout", "actions": ["purchase"]}
      ]
    }
  }
}
```

### Banking

```json
{
  "businessName": "First National Bank",
  "applicationName": "Online Banking",
  "userJourneys": {
    "transfer": {
      "pages": [
        {"name": "Login", "actions": ["authenticate"]},
        {"name": "Accounts", "actions": ["select_accounts"]},
        {"name": "Transfer", "actions": ["confirm_transfer"]}
      ]
    }
  }
}
```

More examples in [QUICKSTART.md](docs/QUICKSTART.md).

## 🔧 NPM Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Generate sessions with default config |
| `npm run setup` | Run the setup wizard |
| `npm run generate` | Generate sessions (default config) |
| `npm run generate:harvard` | Generate sessions (Harvard Pilgrim example) |
| `npm test` | Run tests (generates Harvard Pilgrim sessions) |

## 🛠️ Troubleshooting

### "Configuration file not found"
**Solution:** Run `npm run setup` first or create a config file manually.

### "OpenKit SDK not found"
**Solution:** Run `npm install` to install dependencies.

### No sessions in Dynatrace
**Check:**
1. Application ID is correct (from Custom Application UI)
2. Beacon URL matches your tenant
3. Custom Application exists in Dynatrace
4. Wait 2-3 minutes for data ingestion

See the [Troubleshooting Guide](docs/README_UNIVERSAL_RUM.md#-troubleshooting) for more.

## 🏗️ Project Structure

```
KP-RUMGEN/
├── src/
│   ├── setup_dynatrace_application.js    # Setup wizard
│   └── rum_session_generator.js          # Session generator
├── config/
│   └── business_config_template.json     # Configuration template
├── examples/
│   └── harvard_pilgrim_config.json       # Healthcare example
├── docs/
│   ├── QUICKSTART.md                     # 5-minute guide
│   ├── README_UNIVERSAL_RUM.md           # Complete documentation
│   ├── APPROACH_COMPARISON.md            # Technical comparison
│   └── archive/                          # Historical docs
├── .vscode/
│   ├── settings.json                     # VS Code settings
│   ├── launch.json                       # Debug configurations
│   ├── tasks.json                        # Task definitions
│   └── extensions.json                   # Recommended extensions
├── package.json                          # Project metadata
├── .gitignore                            # Git ignore rules
└── README.md                             # This file
```

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/dynatrace-rum-data-generator.git
cd dynatrace-rum-data-generator

# Install dependencies
npm install

# Open in VS Code
code .
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](#) file for details.

## 🙏 Acknowledgments

- **Dynatrace** for the OpenKit SDK
- **Harvard Pilgrim Health Care** for the use case inspiration
- **Community contributors** who helped test and improve this tool

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/kileparent1/dynatrace-rum-data-generator/issues)
- **Documentation**: [docs/](docs/)
- **Examples**: [examples/](examples/)

## 🔗 Resources

- [Dynatrace OpenKit Documentation](https://docs.dynatrace.com/docs/ingest-from/extend-dynatrace/openkit)
- [Custom Applications Guide](https://docs.dynatrace.com/docs/observe/digital-experience/custom-applications)
- [OpenKit GitHub Repository](https://github.com/Dynatrace/openkit-js)

---

**Made with ❤️ for the Dynatrace community**

*Change configuration, not code.* 🚀
