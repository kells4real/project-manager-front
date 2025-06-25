<template>
  <v-app :dark="$vuetify.theme.dark">
    <!-- Enhanced App Bar with Dark Mode Toggle -->
    <v-app-bar
      app
      :color="$vuetify.theme.dark ? 'grey darken-4' : 'primary'"
      elevate-on-scroll
      :height="$vuetify.breakpoint.smAndDown ? 70 : 80"
    >
      <v-container class="pa-0 fill-height">
        <div class="d-flex align-center">
          <v-img
            alt="Code Analyzer Logo"
            class="shrink mr-2"
            contain
            :src="logo"
            transition="scale-transition"
            :max-width="$vuetify.breakpoint.smAndDown ? 120 : 140"
            @click="$router.push('/')"
            style="cursor: pointer"
          />
        </div>

        <v-spacer></v-spacer>

        <!-- Dark Mode Toggle -->
        <v-btn
          icon
          @click="$vuetify.theme.dark = !$vuetify.theme.dark"
          class="mr-2"
        >
          <v-icon v-if="$vuetify.theme.dark">mdi-weather-sunny</v-icon>
          <v-icon v-else>mdi-weather-night</v-icon>
        </v-btn>

        <v-btn
          href="https://github.com/kells4real/project-manager-front"
          target="_blank"
          text
          large
          class="hidden-sm-and-down"
        >
          <span class="mr-2">GitHub Repository</span>
          <v-icon>mdi-github</v-icon>
        </v-btn>

        <v-btn
          href="https://github.com/kells4real/project-manager-front"
          target="_blank"
          icon
          class="hidden-md-and-up"
        >
          <v-icon>mdi-github</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="px-0" fluid>
        <router-view/>
      </v-container>
    </v-main>

    <!-- Enhanced Footer -->
    <v-footer
      :color="$vuetify.theme.dark ? 'grey darken-4' : 'primary'"
      
      padless
    >
      <v-container>
        <v-row class="py-6">
          <v-col cols="12" md="6" class="text-center text-md-left">
            <h3 class="text-h6 font-weight-medium mb-4">Code Line Analyzer</h3>
            <p class="text-body-2">
              A powerful tool that helps developers analyze their projects by counting lines of code
              across different file types. Get detailed insights into your project structure
              without compromising your privacy - all files are deleted immediately after analysis.
            </p>
          </v-col>

          <v-col cols="12" md="6" class="text-center text-md-right">
            <h3 class="text-h6 font-weight-medium mb-4">Connect With Us</h3>
            <div class="d-flex justify-center justify-md-end">
              <v-btn
                v-for="icon in icons"
                :key="icon.link"
                class="mx-1"
                icon
                :href="icon.link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <v-icon size="24">{{ icon.icon }}</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-divider class="primary lighten-1"></v-divider>

        <v-row class="py-4">
          <v-col cols="12" class="text-center">
            <span class="text-caption">
              &copy; {{ new Date().getFullYear() }} — Powered by 
              <a
                href="https://edufy.com.ng"
                target="_blank"
                rel="noopener noreferrer"
                class="white--text text-decoration-none font-weight-medium"
              >
                Edufy Computer Services
              </a>
            </span>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
const image = require('./Edufy.png')

export default {
  name: 'App',

  data: () => ({
    icons: [
      { icon: 'mdi-facebook', link: 'https://facebook.com/sajere' },
      { icon: 'mdi-twitter', link: 'https://twitter.com/kells4real' },
      { icon: 'mdi-linkedin', link: 'https://www.linkedin.com/in/kells4real/' },
      { icon: 'mdi-instagram', link: 'https://instagram.com/kells4real' },
      { icon: 'mdi-github', link: 'https://github.com/kells4real/project-manager-front' }
    ],
    logo: image
  }),

  created() {
    // Add smooth scrolling behavior
    if (process.client) {
      document.documentElement.style.scrollBehavior = 'smooth'
    }
    
    // Initialize theme from localStorage or prefer-color-scheme
    const darkMode = localStorage.getItem('darkMode') === 'true' || 
                    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    this.$vuetify.theme.dark = darkMode
  },

  watch: {
    '$vuetify.theme.dark'(val) {
      localStorage.setItem('darkMode', val)
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar - light mode */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #1976d2;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #1565c0;
}

/* Custom scrollbar - dark mode */
.v-application.theme--dark ::-webkit-scrollbar-track {
  background: #121212;
}
.v-application.theme--dark ::-webkit-scrollbar-thumb {
  background: #2196F3;
}
.v-application.theme--dark ::-webkit-scrollbar-thumb:hover {
  background: #64B5F6;
}

/* Footer link hover effect */
a {
  transition: all 0.3s ease;
}
a:hover {
  opacity: 0.8;
  text-decoration: underline !important;
}

/* App bar elevation transition */
.v-app-bar {
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

/* Footer social icons */
.v-btn--icon {
  transition: transform 0.3s ease;
}
.v-btn--icon:hover {
  transform: translateY(-3px);
}

/* Container fluid padding adjustment */
.v-container.fluid {
  padding-left: 0;
  padding-right: 0;
}

/* Smooth theme transition */
.v-application {
  transition: background-color 0.3s ease;
}
</style>