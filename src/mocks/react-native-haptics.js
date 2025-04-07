/**
 * Web mock for react-native-haptics
 * 
 * This provides a no-op implementation of haptic feedback for web platforms.
 * For improved web experience, it logs actions to console and could be enhanced
 * with browser vibration API support where available.
 */

const HapticMock = {
  // Trigger methods
  trigger: (type = 'impactLight', options = {}) => {
    console.log(`[Haptic Mock] Trigger: ${type}`, options);
    
    // Use vibration API if available (many browsers still don't support it)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      switch(type) {
        case 'impactLight':
          navigator.vibrate(10);
          break;
        case 'impactMedium':
          navigator.vibrate(20);
          break;
        case 'impactHeavy':
          navigator.vibrate(30);
          break;
        case 'notificationSuccess':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'notificationWarning':
          navigator.vibrate([20, 50, 20]);
          break;
        case 'notificationError':
          navigator.vibrate([30, 50, 30]);
          break;
        default:
          navigator.vibrate(10);
      }
    }
    
    return Promise.resolve();
  },
  
  // Selection feedback
  selection: () => {
    console.log('[Haptic Mock] Selection');
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    return Promise.resolve();
  },
  
  // Notification methods
  notification: (type = 'success') => {
    console.log(`[Haptic Mock] Notification: ${type}`);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      switch(type) {
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'warning':
          navigator.vibrate([20, 50, 20]);
          break;
        case 'error':
          navigator.vibrate([30, 50, 30]);
          break;
        default:
          navigator.vibrate([10, 50, 10]);
      }
    }
    
    return Promise.resolve();
  },
  
  // Impact feedback
  impact: (style = 'light') => {
    console.log(`[Haptic Mock] Impact: ${style}`);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      switch(style) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(30);
          break;
        default:
          navigator.vibrate(10);
      }
    }
    
    return Promise.resolve();
  }
};

export default HapticMock; 