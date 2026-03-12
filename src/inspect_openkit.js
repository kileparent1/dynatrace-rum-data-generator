#!/usr/bin/env node
/**
 * OpenKit SDK Inspector
 * Diagnoses the OpenKit SDK version and available methods
 */

console.log('🔍 Inspecting OpenKit SDK...\n');

try {
  const openKitModule = require('@dynatrace/openkit-js');
  
  console.log('📦 Module exports:');
  console.log('  Keys:', Object.keys(openKitModule).join(', '));
  console.log();
  
  // Find the constructor
  const OpenKit = openKitModule.OpenKitBuilder || 
                  openKitModule.DynatraceOpenKitBuilder || 
                  openKitModule.default ||
                  openKitModule;
  
  if (typeof OpenKit === 'function') {
    console.log('✅ Found OpenKit constructor');
    console.log('  Name:', OpenKit.name);
    
    // Try to create an instance
    try {
      const instance = new OpenKit(
        'https://test.dynatrace.com/mbeacon',
        'TEST_APP',
        123456
      );
      
      console.log('\n📋 Available methods:');
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
        .filter(name => name !== 'constructor' && typeof instance[name] === 'function');
      
      methods.forEach(method => {
        console.log(`  - ${method}()`);
      });
      
      console.log('\n💡 Suggestion: Use these methods in the builder pattern');
      
    } catch (err) {
      console.log('⚠️  Could not instantiate:', err.message);
    }
    
  } else if (typeof OpenKit === 'object') {
    console.log('📦 OpenKit is an object with properties:');
    console.log('  Keys:', Object.keys(OpenKit).join(', '));
    
  } else {
    console.log('❌ OpenKit type:', typeof OpenKit);
  }
  
} catch (error) {
  console.error('❌ Failed to load OpenKit SDK');
  console.error('  Error:', error.message);
  console.error('\n💡 Install with: npm install @dynatrace/openkit-js');
}
