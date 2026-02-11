import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.pin.starter',
  appName: 'pin',
  webDir: 'www',
  server:{
    androidScheme: 'http',
  },
  plugins: {
    Keyboard: {
      resize: 'body',          
      resizeOnFullScreen: true
    }
  }
};
export default config;
