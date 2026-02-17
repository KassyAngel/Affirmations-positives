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
  },
};

export default config;