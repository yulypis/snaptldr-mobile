import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Alert,
  BackHandler,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import SplashScreen from 'react-native-splash-screen';

// AdMob Ad Unit IDs
const BANNER_AD_UNIT_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-7897688814607325/1606161831';
const INTERSTITIAL_AD_UNIT_ID = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7897688814607325/4040753488';

// Your web app URL - update this to your production domain
const WEB_APP_URL = __DEV__ 
  ? 'https://66681c14-a386-4e80-be35-29cd76bd94b1-00-4o908trdc8fu.picard.replit.dev' 
  : 'https://snaptldr.me';

const interstitial = InterstitialAd.createForAdUnitId(INTERSTITIAL_AD_UNIT_ID);

const App = () => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  useEffect(() => {
    // Hide splash screen after app loads
    SplashScreen.hide();

    // Load interstitial ad
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setInterstitialLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setInterstitialLoaded(false);
        interstitial.load();
      }
    );

    // Load the interstitial ad
    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'SnapTLDR Camera Permission',
            message: 'SnapTLDR needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose from where you want to select an image',
      [
        {text: 'Camera', onPress: openCamera},
        {text: 'Gallery', onPress: openGallery},
        {text: 'Documents', onPress: openDocuments},
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        includeBase64: true,
      },
      handleImageResponse,
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        includeBase64: true,
      },
      handleImageResponse,
    );
  };

  const openDocuments = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });

      if (result && result[0]) {
        const file = result[0];
        // Send file info to web app
        const message = {
          type: 'FILE_SELECTED',
          data: {
            uri: file.fileCopyUri || file.uri,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        };
        
        webViewRef.current?.postMessage(JSON.stringify(message));
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
      } else {
        Alert.alert('Error', 'Failed to select document');
      }
    }
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      
      // Show interstitial ad occasionally (every 3rd image)
      if (interstitialLoaded && Math.random() > 0.66) {
        interstitial.show();
      }

      // Send image data to web app
      const message = {
        type: 'IMAGE_SELECTED',
        data: {
          uri: asset.uri,
          base64: asset.base64,
          fileName: asset.fileName,
          type: asset.type,
          fileSize: asset.fileSize,
        },
      };

      webViewRef.current?.postMessage(JSON.stringify(message));
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'OPEN_IMAGE_PICKER':
          showImagePicker();
          break;
        case 'SHARE_CONTENT':
          // Handle sharing functionality
          if (message.data && message.data.text) {
            Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message.data.text)}`);
          }
          break;
        case 'OPEN_URL':
          if (message.data && message.data.url) {
            Linking.openURL(message.data.url);
          }
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  const injectedJavaScript = `
    (function() {
      // Override file input to trigger native picker
      function overrideFileInputs() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          input.addEventListener('click', function(e) {
            e.preventDefault();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'OPEN_IMAGE_PICKER'
            }));
          });
        });
      }
      
      // Override drag and drop
      function overrideDragDrop() {
        document.addEventListener('dragover', function(e) {
          e.preventDefault();
        });
        
        document.addEventListener('drop', function(e) {
          e.preventDefault();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'OPEN_IMAGE_PICKER'
          }));
        });
      }
      
      // Add native image picker button if needed
      function addNativePickerButton() {
        const uploadArea = document.querySelector('[data-upload-area]') || 
                          document.querySelector('.upload-area') ||
                          document.querySelector('.file-upload');
        
        if (uploadArea && !uploadArea.querySelector('.native-picker-btn')) {
          const button = document.createElement('button');
          button.className = 'native-picker-btn';
          button.style.cssText = \`
            position: absolute;
            top: 10px;
            right: 10px;
            background: #007AFF;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
          \`;
          button.textContent = '📷 Camera';
          button.onclick = function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'OPEN_IMAGE_PICKER'
            }));
          };
          uploadArea.style.position = 'relative';
          uploadArea.appendChild(button);
        }
      }
      
      // Handle messages from React Native
      window.addEventListener('message', function(event) {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'IMAGE_SELECTED' && message.data.base64) {
            // Create a file object from base64
            const byteCharacters = atob(message.data.base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {type: message.data.type || 'image/jpeg'});
            const file = new File([blob], message.data.fileName || 'image.jpg', {
              type: message.data.type || 'image/jpeg'
            });
            
            // Trigger the existing upload logic
            const event = new CustomEvent('nativeImageSelected', {
              detail: { file: file, data: message.data }
            });
            window.dispatchEvent(event);
          }
        } catch (error) {
          console.error('Error handling native message:', error);
        }
      });
      
      // Initialize overrides
      setTimeout(() => {
        overrideFileInputs();
        overrideDragDrop();
        addNativePickerButton();
      }, 1000);
      
      // Re-run when DOM changes (for SPA navigation)
      const observer = new MutationObserver(() => {
        setTimeout(() => {
          overrideFileInputs();
          addNativePickerButton();
        }, 500);
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    })();
    
    true; // Required for injected JavaScript
  `;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000000'}}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Banner Ad at the top */}
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
      
      <WebView
        ref={webViewRef}
        source={{uri: WEB_APP_URL}}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        bounces={false}
        scrollEnabled={true}
        style={{flex: 1}}
        userAgent="SnapTLDR-Android-App/1.0"
        onError={(error) => {
          console.error('WebView error:', error);
        }}
        onHttpError={(error) => {
          console.error('WebView HTTP error:', error);
        }}
      />
    </SafeAreaView>
  );
};

export default App;