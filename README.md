# SnapTLDR Mobile App

AI-powered screenshot summarization app for Android with AdMob monetization.

## 💰 Monetization Features

- **Banner Ads**: Always visible at top (ca-app-pub-7897688814607325/1606161831)
- **Interstitial Ads**: Every 3rd usage (ca-app-pub-7897688814607325/4040753488)  
- **PayPal Integration**: Direct payments through WebView
- **Package Name**: com.yuly.snaptldr

## 🚀 Build Instructions

### Prerequisites
- Node.js 16+
- React Native CLI
- Android Studio with SDK 31+

### Install Dependencies
```bash
npm install
```

### Build Debug APK
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```

### Build Release APK
```bash
cd android
./gradlew assembleRelease
```

## 📱 App Features

- WebView integration with SnapTLDR web app
- Native AdMob banner and interstitial ads
- Automatic usage tracking for ad serving
- PayPal payment processing
- Google Play Store ready

## 🎯 Revenue Strategy

- Banner ads provide constant revenue stream
- Interstitial ads maximize engagement revenue
- PayPal enables direct premium payments
- Expected: $50-150/month per 1,000 daily users