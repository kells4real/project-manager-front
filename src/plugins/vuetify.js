import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
 theme: {
    dark: false, // Default to light mode
    themes: {
      light: {
        primary: '#1976D2',
        background: '#FFFFFF',
        secondary: '#424242',
        accent: '#00B4D8',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00'
      },
      dark: {
        primary: '#2196F3',
        background: '#121212',
        secondary: '#BDBDBD',
        accent: '#00E5FF',
        error: '#FF5252',
        info: '#64B5F6',
        success: '#66BB6A',
        warning: '#FFA726'
      }
    }
  }
});
