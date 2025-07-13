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
<div
  class="d-flex align-center logo-area"
  @click="$router.push('/')"
  style="cursor: pointer"
>
  <v-icon class="mr-2" color="primary" size="36">mdi-code-tags</v-icon>
  <span class="font-weight-bold brand-name">Codelyzer</span>
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
<v-container class="mt-10 mb-6">
  <v-row>
    <v-col cols="12" md="8" class="mx-auto text-center">
      <h1 class="font-weight-bold">
        Understand Your Codebase at a Glance
      </h1>

      <p class="mt-4">
        Code Line Analyzer is a lightweight yet powerful tool designed to give developers a quick overview of their project’s structure by analyzing and counting lines of code across multiple file types — without uploading your code anywhere permanently.
      </p>

      <ul class="text-body-1 mt-6 text-left d-inline-block" style="list-style: disc; padding-left: 1.5rem;">
        <li>✅ Instant breakdown by file type (e.g., <code>.js</code>, <code>.py</code>, <code>.html</code>)</li>
        <li>🔐 Privacy-first: no data stored — all files are deleted right after analysis</li>
        <li>📊 Visual insights to help you track project size and complexity</li>
      </ul>

      <p class="mt-4">
        Whether you’re reviewing codebase growth, auditing projects, or prepping for a handover, Code Line Analyzer saves time and gives clarity.
      </p>
<!-- 
      <v-btn
        color="primary"
        class="mt-6"
        large
        @click="$router.push('/analyze')"
      >
        Try It Now
      </v-btn> -->
    </v-col>
  </v-row>
</v-container>

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
              <h3 class="font-weight-medium mb-4">What is Codelyzer?</h3>
              <p class="text-body-2">
                <strong>Codelyzer</strong> is a smart, privacy-first tool that helps developers quickly analyze
                their codebase by counting lines of code across different file types. 
                It’s perfect for audits, handovers, or tracking code growth.
              </p>
              <p class="text-body-2 mt-2">
                Files are processed locally and deleted right after analysis — 
                <strong>no code is ever stored</strong>, so your project stays completely private.
              </p>
            </v-col>

          <v-col cols="12" md="6" class="text-center text-md-right">
            <h3 class="font-weight-medium mb-4">Connect With Us</h3>
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

<style>
/* Load font globally */
body, .v-application {
  font-family: 'Sora', sans-serif !important;
}

/* Apply 'Sora' font across all Vuetify text utility classes */
.v-application,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-subtitle-1, .text-subtitle-2,
.text-body-1, .text-body-2,
.text-caption, .text-overline,
.font-weight-light, .font-weight-regular, .font-weight-medium, .font-weight-bold,
h1, h2, h3, h4, h5, h6,
p, span, li, a, strong, em, blockquote {
  font-family: 'Sora', sans-serif !important;
}
h1, h2, h3 {
  font-weight: 600;
  letter-spacing: -0.5px;
}
p {
  font-weight: 400;
  line-height: 1.6;
}
</style>
<style scoped>
/* Logo section enhancements */
.logo-area {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.logo-area:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.brand-name {
  font-family: 'Sora', sans-serif;
  letter-spacing: -0.5px;
}
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
.v-btn {
  text-decoration: none !important;
}

.v-btn:hover {
  text-decoration: none !important;
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
ul {
  margin: 0;
  padding-left: 1.25rem;
}

li {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

</style>