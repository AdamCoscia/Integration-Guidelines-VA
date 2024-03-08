<template>
  <v-container fluid class="pa-6 view-container">
    <!-- HEADER -->
    <div ref="header">
      <!-- DISCLAIMER -->
      <v-row justify="center">
        <v-col cols="auto">
          <v-alert type="info">
            <span>
              If the survey does not load below, please click
              <a :href="surveyURL" class="survey-link" target="_blank">here</a>
            </span>
            <span> | </span>
            <span>
              Your unique ID: <b>{{ pid }}</b>
            </span>
          </v-alert>
        </v-col>
      </v-row>
    </div>

    <!-- CONTENT -->
    <div>
      <v-row>
        <v-col cols="12">
          <iframe
            width="100%"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
            :src="surveyURL"
            :style="{ height: `${surveyHeight}px` }"
          ></iframe>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
export default {
  data: function () {
    return {
      mounted: false,
      windowHeight: window.innerHeight,
      surveyURL: "https://gatech.co1.qualtrics.com/jfe/form/SV_3VOaPbiMalAWTNc",
    };
  },

  mounted: function () {
    window.addEventListener("resize", this.onResize); // Register an event listener when the Vue component is ready
    this.mounted = true;
  },

  beforeDestroy: function () {
    window.removeEventListener("resize", this.onResize); // Unregister the event listener before destroying this Vue instance
  },

  computed: {
    pid() {
      return this.$root.$data.session.pid;
    },

    surveyHeight() {
      if (this.mounted) {
        // full height - app bar - header - padding
        return Math.max(
          this.windowHeight - 64 - this.$refs.header.clientHeight - 48,
          256
        );
      } else {
        return 0;
      }
    },
  },

  methods: {
    onResize() {
      this.windowHeight = window.innerHeight;
    },
  },
};
</script>

<style>
.survey-link {
  color: white !important;
}
</style>
