import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kcdev.affirmationspositives',
  appName: 'Affirmations Positives',
  webDir: 'dist/public',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_notification',
      iconColor: '#F43F5E',
      sound: 'default',
    },
    // ✅ SplashScreen — reste affiché pendant que le JS charge
    // puis se cache automatiquement après 2.5s (ou manuellement via SplashScreen.hide())
    SplashScreen: {
      launchShowDuration: 2500,   // ms avant hide automatique
      launchAutoHide: true,       // true = auto, false = manuel dans le code
      backgroundColor: '#000000',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;