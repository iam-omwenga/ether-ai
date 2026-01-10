/**
 * Mobile detection and MetaMask deep linking utilities
 */

export const isMobileDevice = (): boolean => {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  // Regex patterns for common mobile devices
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  return mobileRegex.test(ua.toLowerCase());
};

export const isIOSDevice = (): boolean => {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
};

export const isAndroidDevice = (): boolean => {
  return /android/i.test(navigator.userAgent.toLowerCase());
};

/**
 * Opens MetaMask mobile app with deep link
 * For iOS: metamask://
 * For Android: intent://
 */
export const openMetaMaskMobileApp = (): void => {
  const isIOS = isIOSDevice();
  const isAndroid = isAndroidDevice();

  if (isIOS) {
    // iOS deep link - opens MetaMask app
    const deepLink = 'metamask://';
    window.location.href = deepLink;
    
    // Fallback to MetaMask app store if it doesn't open
    setTimeout(() => {
      window.location.href = 'https://apps.apple.com/app/metamask/id1438144202';
    }, 500);
  } else if (isAndroid) {
    // Android deep link with intent
    const deepLink = 'intent://metamask.io#Intent;scheme=https;package=io.metamask;end';
    window.location.href = deepLink;
    
    // Fallback to Play Store
    setTimeout(() => {
      window.location.href = 'https://play.google.com/store/apps/details?id=io.metamask';
    }, 500);
  }
};

/**
 * Check if MetaMask is available on current platform
 * On mobile, checks if browser supports MetaMask
 */
export const isMetaMaskAvailable = (): boolean => {
  const isMobile = isMobileDevice();
  
  if (!isMobile) {
    // Desktop - check for extension or injected provider
    return !!(window.ethereum?.isMetaMask);
  }
  
  // Mobile - MetaMask is available if browser supports it or app is installed
  return !!(window.ethereum?.isMetaMask);
};

/**
 * Handle wallet connection with mobile-aware logic
 */
export const handleWalletConnectionForPlatform = async (
  onDesktop: () => Promise<any>,
  onMobileWithApp: () => void,
  onMobileWithoutApp: () => void
): Promise<void> => {
  const isMobile = isMobileDevice();
  
  if (!isMobile) {
    // Desktop: use extension normally
    try {
      await onDesktop();
    } catch (error) {
      console.error('Desktop wallet connection failed:', error);
    }
  } else {
    // Mobile: try app first, then web
    if (isMetaMaskAvailable()) {
      onMobileWithApp();
    } else {
      onMobileWithoutApp();
    }
  }
};

export const getMobileWalletConnectionURL = (): string => {
  const isIOS = isIOSDevice();
  
  if (isIOS) {
    return 'https://metamask.app.link/dapp/'; // Will be appended with current URL
  } else {
    // Android - use deeplink format
    return 'intent://dapp/';
  }
};
