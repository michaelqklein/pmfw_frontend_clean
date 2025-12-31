// Platform detection utility
// Provides consistent platform detection across the shared utils package
// Optimized for Hermes compatibility

// Safe platform detection that works with Hermes
export const isReactNative = (() => {
  try {
    // Check for React Native specific globals
    if (typeof global !== 'undefined') {
      if (global.__expo || global.__reactNativeWebView) {
        return true;
      }
      // Check for React Native navigator product
      if (global.navigator && global.navigator.product === 'ReactNative') {
        return true;
      }
    }
    
    // Check for process.env (Expo)
    if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_PLATFORM === 'native') {
      return true;
    }
    
    // Check for window.navigator (fallback)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.product === 'ReactNative') {
      return true;
    }
    
    return false;
  } catch (error) {
    // If any check fails, assume we're not in React Native
    console.warn('Platform detection error:', error);
    return false;
  }
})();

export const isWeb = (() => {
  try {
    return typeof window !== 'undefined' && 
           typeof window.document !== 'undefined' && 
           !isReactNative;
  } catch (error) {
    return false;
  }
})();

// Export a function to get the current platform
export const getPlatform = () => {
  if (isReactNative) return 'react-native';
  if (isWeb) return 'web';
  return 'unknown';
}; 