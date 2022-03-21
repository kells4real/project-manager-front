<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/kells4real/project-manager-front"
        target="_blank"
        text
      >
        <span class="mr-2">Github Repo</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>

<!-- Footer -->

    <v-footer
    dark
    padless
  >
    <v-card
      flat
      tile
      class="indigo lighten-1 white--text text-center"
    >
      <v-card-text>
        <v-btn
          v-for="icon in icons"
          :key="icon"
          class="mx-4 white--text"
          icon
        >
          <a :href="icon.link" target="_blank">  <v-icon size="24px" style="color: #dedee0">
          {{ icon.icon }} 
          </v-icon> </a>
        </v-btn>
      </v-card-text>

      <v-card-text class="white--text pt-0">
       A simple web app that helps developers and software engineers access how much lines of code they've written in a project.
       The program just goes through every extension according to your description and tells you how many lines of code you have
        in your project directory.
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text class="white--text">
        {{ new Date().getFullYear() }} — Powered by <a href="https://edufyservices.com" target="_blank"><strong style="color: #dedee0">Edufy Services</strong></a>
      </v-card-text>
    </v-card>
  </v-footer>

  <!-- Footer Ends -->

  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
          icons: [
         {icon: 'mdi-facebook', link: ''},
          {icon: 'mdi-twitter', link: 'https://twitter.com/kells4real'},
          {icon: 'mdi-linkedin', link: 'https://www.linkedin.com/in/kells4real/'},
          {icon: 'mdi-instagram', link: 'https://instagram.com/kells4real'}
       
        
      ],
  }),
};
</script>
