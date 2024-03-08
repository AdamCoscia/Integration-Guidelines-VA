<template>
  <v-app>
    <!-- APP BAR -->
    <v-app-bar app class="pa-0">
      <v-row class="flex-nowrap" align="center">
        <!-- TITLE -->
        <v-col ref="LCol" cols="auto">
          <span style="font-weight: bold" v-text="currPage.title"></span>
        </v-col>

        <!-- TASK -->
        <template v-if="currPage.hasTasks">
          <v-col
            class="py-0 task-instructions"
            :style="{ width: taskColWidth }"
            cols="auto"
          >
            <span style="font-weight: bold">
              Task ({{ $root.$data.currTaskIndex + 1 }}/{{
                currTasks.length
              }}):&nbsp;
            </span>
            <span v-text="currTask.text"></span>
          </v-col>
        </template>

        <v-spacer></v-spacer>

        <!-- NAVIGATION -->
        <v-col ref="RCol" cols="auto">
          <v-row align="center">
            <!-- SAVE -->
            <v-col cols="auto">
              <span
                v-if="saveBtnClicked"
                class="mr-1"
                style="font-weight: bold"
              >
                (saved!)
              </span>
              <v-btn :disabled="saveBtnDisabled" @click="save">Save</v-btn>
            </v-col>

            <v-divider class="ma-2" vertical></v-divider>

            <!-- PREVIOUS -->
            <v-col v-if="false" cols="auto">
              <v-btn :disabled="prevBtnDisabled" @click="prev">Prev</v-btn>
            </v-col>

            <!-- NEXT -->
            <v-col cols="auto">
              <v-btn :disabled="nextBtnDisabled" @click="next">Next</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-app-bar>

    <!-- MAIN VIEW -->
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "app",

  data: function () {
    return {
      windowWidth: window.innerWidth,
      disableNextBtn: false, // override for disabling next button
      saveBtnClicked: false, // for disabling save button
      prevTimestamp: new Date().getTime(), // for measuring elapsed time
      allTasksElapsedTime: 0, // keep track of total time to complete all tasks for live page
    };
  },

  mounted: function () {
    let vm = this;

    if (
      vm.$router.currentRoute.name &&
      vm.$router.currentRoute.name !== vm.currPage.name
    ) {
      vm.$router.replace({ path: "/" });
    }

    vm.$nextTick(() => {
      window.addEventListener("resize", vm.onResize);
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },

  computed: {
    currPage() {
      return this.$root.$data.pages[this.$root.$data.currPageIndex];
    },

    currTask() {
      return this.currTasks[this.$root.$data.currTaskIndex];
    },

    currTasks() {
      return this.$root.$data.tasks[this.currPage.name];
    },

    taskColWidth() {
      return `
        ${
          this.windowWidth -
          this.$refs.LCol.clientWidth -
          this.$refs.RCol.clientWidth -
          72
        }px
      `;
    },

    saveBtnDisabled() {
      return (
        !this.currPage.hasTasks ||
        (this.currPage.hasTasks && this.saveBtnClicked)
      );
    },

    prevBtnDisabled() {
      return true || this.$root.$data.currPageIndex == 0;
    },

    nextBtnDisabled() {
      return (
        this.disableNextBtn ||
        !this.$root.$data.session.acceptedConsent ||
        this.$root.$data.currPageIndex == this.$root.$data.pages.length - 1
      );
    },
  },

  watch: {
    "$root.$data.currPageIndex": function () {
      this.$router.replace({ name: this.currPage.name });
    },
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },

    save() {
      let vm = this;

      // disable save button
      vm.saveBtnClicked = true; // don't let save be clicked in a row
      setTimeout(function () {
        vm.saveBtnClicked = false; // let save be clicked again
      }, 1000);

      // get page data
      const page = vm.$root.$data.session[vm.currPage.name];

      // save current attributes state without specific keys for each attribute
      let currAttrs = {};
      for (const [key, value] of Object.entries(vm.$root.$data.attributes)) {
        const newValue = Object.keys(value)
          .filter((key) => ["range", "relatedAttributes"].indexOf(key) == -1)
          .reduce((obj, key) => {
            obj[key] = value[key];
            return obj;
          }, {});
        currAttrs[key] = newValue;
      }
      page.data[vm.currTask.id].attributes = currAttrs;

      // save current panel state
      const savedPages = page.data[vm.currTask.id].saved;
      const timestamp = new Date().getTime();
      savedPages.push({
        timestamp: timestamp,
        elapsed: timestamp - vm.prevTimestamp,
        encodings: vm.$root.$data.encodings,
        filters: vm.$root.$data.filters,
        selectedDataPoints: vm.$root.$data.selectedDataPoints,
      });

      // store prev timestamp for next save
      vm.prevTimestamp = timestamp;
    },

    prev() {
      let vm = this;
      vm.$root.$data.currPageIndex -= 1; // fall back to the previous page
    },

    next() {
      let vm = this;

      // disable next button
      vm.disableNextBtn = true; // force next button to be disabled
      setTimeout(function () {
        vm.disableNextBtn = false; // enable next button after 5 seconds
      }, 5000);

      // get page data
      const page = vm.$root.$data.session[vm.currPage.name];
      if (vm.currPage.hasTasks) {
        vm.save(); // save task data
        if (vm.$root.$data.currTaskIndex < vm.currTasks.length) {
          // move to the next task
          vm.allTasksElapsedTime += page.record[vm.currTask.id].complete(); // completed task with specific id
          vm.$root.$data.currTaskIndex += 1; // advance to the next task
        }
        if (vm.$root.$data.currTaskIndex == vm.currTasks.length) {
          // move to the next page
          page.record["all-tasks"].complete(vm.allTasksElapsedTime); // completed all tasks
          vm.allTasksElapsedTime = 0; // reset elapsed time
          vm.$root.$data.currTaskIndex = 0; // reset index
          vm.$root.$data.currPageIndex += 1; // advance to the next page
        }
      } else {
        page.record.complete(); // completed page
        vm.$root.$data.currPageIndex += 1; // advance to the next page
      }
      vm.prevTimestamp = new Date().getTime(); // reset prev time stamp to the beginning of the new page
    },
  },
};
</script>

<style>
html {
  overflow: hidden !important;
}

.view-container {
  overflow-y: auto;
  height: calc(100vh - 64px); /* full height - app bar */
}

.task-instructions {
  max-height: 56px;
  font-size: 10pt;
  overflow-y: auto;
}
</style>
