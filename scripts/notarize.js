const { notarize } = require('@electron/notarize');
const { build } = require('../package.json');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  
  // Only notarize macOS builds
  if (electronPlatformName !== 'darwin') {
    return;
  }
  
  // Skip if not running in CI environment
  if (!process.env.CI) {
    console.log('Skipping notarization in non-CI environment');
    return;
  }
  
  // Check for required environment variables
  if (!process.env.APPLE_ID || !process.env.APPLE_APP_PASSWORD) {
    console.warn('Skipping notarization: Required environment variables missing');
    return;
  }
  
  console.log('Notarizing app...');
  
  const appName = context.packager.appInfo.productFilename;
  
  try {
    await notarize({
      tool: 'notarytool',
      appBundleId: build.appId || 'com.example.my-electron-app',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    });
    
    console.log(`Notarization completed for ${appName}`);
  } catch (error) {
    console.error('Notarization failed:', error);
    throw error;
  }
};
