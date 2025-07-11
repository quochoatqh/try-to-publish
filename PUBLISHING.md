# Publishing Guide

## Quick Start

### 1. Local Build (Testing)
```bash
# Build for current platform
npm run electron:dist

# Build without packaging (faster)
npm run electron:pack
```

### 2. Manual Release
```bash
# Create and publish release
npm run electron:publish
```

### 3. Automated Release (Recommended)
```bash
# Create a git tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically build and publish
```

## Setup Requirements

### GitHub Repository
1. Create a GitHub repository
2. Update `electron-builder.json`:
   ```json
   {
     "publish": {
       "provider": "github",
       "owner": "your-github-username",
       "repo": "your-repo-name"
     }
   }
   ```

### Environment Variables (Optional - for code signing)

#### macOS Code Signing
```bash
APPLE_ID=your-apple-id@example.com
APPLE_APP_PASSWORD=app-specific-password
APPLE_TEAM_ID=YOUR_TEAM_ID
CSC_LINK=base64-encoded-certificate
CSC_KEY_PASSWORD=certificate-password
```

#### Windows Code Signing
```bash
WIN_CSC_LINK=base64-encoded-certificate
WIN_CSC_KEY_PASSWORD=certificate-password
```

### GitHub Secrets Setup
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add the following secrets (if you have certificates):
   - `APPLE_ID`
   - `APPLE_APP_PASSWORD`
   - `APPLE_TEAM_ID`
   - `CSC_LINK`
   - `CSC_KEY_PASSWORD`
   - `WIN_CSC_LINK`
   - `WIN_CSC_KEY_PASSWORD`

## Publishing Workflow

### Method 1: Tag-based Release (Recommended)
```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Push tag
git push origin --tags

# 3. GitHub Actions will build and create release automatically
```

### Method 2: Manual Release
```bash
# Build and publish immediately
npm run electron:publish
```

### Method 3: Draft Release
```bash
# Create draft release (won't publish immediately)
npm run release
```

## Distribution Channels

### GitHub Releases
- ✅ Free hosting
- ✅ Auto-update support
- ✅ Version management
- ✅ Download statistics

### Alternative Channels
- **Mac App Store**: Requires additional setup
- **Microsoft Store**: Requires MSIX packaging
- **Snap Store**: For Linux distribution
- **Custom Server**: For enterprise distribution

## Auto-Updates

The app is configured for auto-updates via GitHub releases:

```javascript
// In your main process
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

## Troubleshooting

### Common Issues
1. **Build fails**: Check Node.js version compatibility
2. **Code signing fails**: Verify certificates and environment variables
3. **Upload fails**: Check GitHub token permissions
4. **Notarization fails**: Verify Apple credentials

### Debug Commands
```bash
# Build with debug output
DEBUG=electron-builder npm run electron:dist

# Check what files are included
npm run electron:pack
```

## Security Considerations

For security-focused apps:
1. Always use code signing in production
2. Enable notarization for macOS
3. Use private repositories for sensitive apps
4. Consider enterprise distribution channels
5. Implement secure auto-update mechanisms
