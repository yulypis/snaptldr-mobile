# Android Studio Setup & Testing Guide

## 📱 Import Project into Android Studio

### 1. Import the Project
```bash
# Open Android Studio
# File → Open → Navigate to your project/mobile/android folder
# Select the 'android' folder and click OK
```

### 2. Sync Project
- Android Studio will automatically detect it's a React Native project
- Wait for Gradle sync to complete
- Install any missing SDK components if prompted

## 🔐 Configure Your Existing Signing Key

Since you already have a signing key, here's how to configure it:

### 1. Copy Your Keystore
```bash
# Copy your existing .keystore file to mobile/android/app/
cp /path/to/your-key.keystore mobile/android/app/your-key.keystore
```

### 2. Configure Signing in Android Studio
1. **Build → Generate Signed Bundle/APK**
2. **Choose Android App Bundle or APK**
3. **Create new key store path** → Browse to your keystore file
4. **Enter your keystore password and key details**

### 3. Alternative: Update gradle.properties
Uncomment and update these lines in `android/gradle.properties`:
```properties
SNAPTLDR_UPLOAD_STORE_FILE=your-key.keystore
SNAPTLDR_UPLOAD_KEY_ALIAS=your-key-alias
SNAPTLDR_UPLOAD_STORE_PASSWORD=your-store-password
SNAPTLDR_UPLOAD_KEY_PASSWORD=your-key-password
```

## 🧪 Testing the App

### Option 1: Physical Device (Recommended)
```bash
# Enable Developer Options & USB Debugging on your Android phone
# Connect via USB
cd mobile
npm install
npm run android
```

### Option 2: Android Emulator
```bash
# Create AVD in Android Studio (Tools → AVD Manager)
# Start emulator
cd mobile
npm run android
```

### Option 3: Build APK for Testing
```bash
cd mobile/android
./gradlew assembleDebug
# Install: adb install app/build/outputs/apk/debug/app-debug.apk
```

## 📸 Taking Screenshots for Play Store

### Required Screenshots (minimum):
1. **Phone Portrait** (1080x1920 or higher)
2. **7-inch Tablet** (1024x1600 or higher) 
3. **10-inch Tablet** (1920x1200 or higher)

### Key Screens to Capture:
1. **Landing Page** - Show "paste a screenshot" interface
2. **Camera/Upload Flow** - Native camera picker in action
3. **Analysis Results** - Show AI summary with TL;DR and key points
4. **Dashboard** - Usage tracking and balance (if signed in)
5. **Ad Integration** - Show banner ad at top (tastefully)

### Screenshot Tips:
```bash
# Using ADB (device connected):
adb exec-out screencap -p > screenshot.png

# Or use Android Studio Device File Explorer
# View → Tool Windows → Device File Explorer
```

## 🚀 Build Production Release

### Using Android Studio:
1. **Build → Generate Signed Bundle/APK**
2. **Select Android App Bundle (recommended for Play Store)**
3. **Choose your keystore and signing config**
4. **Build Type: Release**
5. **Click Finish**

### Using Command Line:
```bash
cd mobile/android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

## 🔧 Troubleshooting

### Common Issues:

1. **Metro bundler not found**:
   ```bash
   cd mobile
   npm install -g @react-native-community/cli
   ```

2. **Gradle build fails**:
   ```bash
   cd mobile/android
   ./gradlew clean
   ./gradlew build
   ```

3. **AdMob test ads not showing**:
   - Test ads only show in debug builds
   - Real ads only show in signed release builds

4. **WebView not loading**:
   - Check internet connection
   - Verify INTERNET permission in AndroidManifest.xml

## 📋 Quick Test Checklist

- [ ] App launches without crashes
- [ ] Banner ad shows at top (test ads in debug)
- [ ] Web app loads correctly in WebView  
- [ ] Camera button opens native camera picker
- [ ] Gallery access works
- [ ] Image upload and analysis works
- [ ] Back button navigation works
- [ ] Google OAuth login works through WebView
- [ ] PayPal payments work through WebView

## 🎯 Ready for Screenshots!

Once the app is running on your device:
1. Use your existing signing process in Android Studio
2. Test all core features 
3. Take screenshots of key screens
4. Build signed release AAB for Play Store

Your SnapTLDR mobile app is ready for production testing!