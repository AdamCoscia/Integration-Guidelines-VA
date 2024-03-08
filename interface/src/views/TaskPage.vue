<template>
  <v-container fluid class="pa-6 view-container">
    <!-- CONTENT -->
    <v-row class="pa-8">
      <v-col cols="12">
        <!-- PRACTICE -->
        <template v-if="phase == 'practice'">
          <!-- CONTROL -->
          <template v-if="condition == 'control'">
            <p>
              <b><u>Timing:</u></b>
              This round should take approximately <b>10 minutes</b> to
              complete. However, you are free to take as much time as you would
              like exploring the tool and completing the tasks.
            </p>

            <p>
              <b><u>Task:</u></b>
              During this time, you will have the various features of the tool
              explained to you. You will then be asked to perform
              <b>1 practice task</b> to familiarize you with the style of task
              being given throughout the rest of the study. You will not be
              evaluated on your performance during this round.
            </p>

            <p>
              <b><u>Protocol:</u></b>
              We will be using a <b>think-aloud protocol</b> throughout the
              study. That means we are looking to collect your thought process
              as it is happening. Please make every attempt to explain your
              thoughts, actions and intentions aloud as you work through this
              study. Please verbally summarize your insights and rationale every
              time you save a specific view and complete a task.
            </p>

            <p>
              <b><u>Data:</u></b>
              You will be adding attributes into your tool from a set of data
              tables relating to <b>movies</b>, where each row corresponds with
              a single movie.
            </p>

            <p>
              <b><u>Caveats:</u></b>
              During the task, carefully consider the <b>quality</b> of the data
              when deciding which attributes to use. In this interface, you
              <b>may</b> directly edit the tables in any way except overwriting
              individual cell values.
            </p>
          </template>

          <!-- AUGMENTATION -->
          <template v-if="condition == 'augmentation'">
            <p>
              <b><u>Timing:</u></b>
              This round should take approximately <b>10 minutes</b> to
              complete. However, you are free to take as much time as you would
              like exploring the tool and completing the tasks.
            </p>

            <p>
              <b><u>Task:</u></b>
              During this time, you will have the various features of the tool
              explained to you. You will then be asked to perform
              <b>1 practice task</b> to familiarize you with the style of task
              being given throughout the rest of the study. You will not be
              evaluated on your performance during this round.
            </p>

            <p>
              <b><u>Protocol:</u></b>
              We will be using a <b>think-aloud protocol</b> throughout the
              study. That means we are looking to collect your thought process
              as it is happening. Please make every attempt to explain your
              thoughts, actions and intentions aloud as you work through this
              study. Please verbally summarize your insights and rationale every
              time you save a specific view and complete a task.
            </p>

            <p>
              <b><u>Data:</u></b>
              You will be adding attributes into your tool from a set of data
              tables relating to <b>movies</b>, where each row corresponds with
              a single movie.
            </p>

            <p>
              <b><u>Caveats:</u></b>
              During the task, carefully consider the <b>quality</b> of the data
              when deciding which attributes to use. In this interface, you
              <b>may not</b> directly edit the tables in any way.
            </p>
          </template>
        </template>

        <!-- ACTIVITY -->
        <template v-if="phase == 'activity'">
          <!-- CONTROL -->
          <template v-if="condition == 'control'">
            <p>
              <b><u>Timing:</u></b>
              This round should take approximately <b>30 minutes</b> to
              complete. However, you are free to take as much time as you would
              like completing the tasks in this round.
            </p>

            <div class="mb-4">
              <b><u>Task:</u></b>
              <span>
                During this time, you will answer 2 questions. You will be
                evaluated on your performance during this round.
              </span>
              <ol>
                <li>
                  The first question will be a <b>specific task</b>
                  relating to a given set of data tables. This task may be in
                  the form of questions about the data, it may ask you to create
                  a specific visualization constrained by various parameters in
                  the data, or it may provide a scenario in which a
                  visualization is required to address the issue(s) brought up
                  in the scenario.
                </li>
                <li>
                  The second question will be a <b>freeform task</b>
                  relating to a given set of data tables. This task may require
                  you to consider, explain, and justify something about the data
                  using visualization(s) to support your answer, it may ask you
                  to verify or refute information in the data, or it may ask you
                  to make predictions about something by visualizing trends in
                  the data.
                </li>
              </ol>
            </div>

            <p>
              <b><u>Protocol:</u></b>
              We will be using a <b>think-aloud protocol</b> throughout the
              study. That means we are looking to collect your thought process
              as it is happening. Please make every attempt to explain your
              thoughts, actions and intentions aloud as you work through this
              study. Please verbally summarize your insights and rationale every
              time you save a specific view and complete a task.
            </p>

            <!-- COLLEGES -->
            <template v-if="dataset == 'colleges'">
              <p>
                <b><u>Data:</u></b>
                You will be adding attributes into your tool from a set of data
                tables relating to <b>colleges</b>, where each row corresponds
                to a single US college.
              </p>

              <p>
                <b><u>Caveats:</u></b>
                During the task, carefully consider the <b>quality</b> of the
                data when deciding which attributes to use. In this interface,
                you <b>may</b> directly edit the tables in any way except
                overwriting individual cell values.
              </p>
            </template>

            <!-- LOANS -->
            <template v-if="dataset == 'loans'">
              <p>
                <b><u>Data:</u></b>
                You will be adding attributes into your tool from a set of data
                tables relating to <b>loans</b>, where each row corresponds with
                a single loan application.
              </p>

              <p>
                <b><u>Caveats:</u></b>
                During the task, carefully consider the <b>quality</b> of the
                data when deciding which attributes to use. In this interface,
                you <b>may</b> directly edit the tables in any way except
                overwriting individual cell values.
              </p>
            </template>
          </template>

          <!-- AUGMENTATION -->
          <template v-if="condition == 'augmentation'">
            <p>
              <b><u>Timing:</u></b>
              This round should take approximately <b>30 minutes</b> to
              complete. However, you are free to take as much time as you would
              like completing the tasks in this round.
            </p>

            <div class="mb-4">
              <b><u>Task:</u></b>
              <span>
                During this time, you will answer 2 questions. You will be
                evaluated on your performance during this round.
              </span>
              <ol>
                <li>
                  The first question will be a <b>specific task</b>
                  relating to a given set of data tables. This task may be in
                  the form of questions about the data, it may ask you to create
                  a specific visualization constrained by various parameters in
                  the data, or it may provide a scenario in which a
                  visualization is required to address the issue(s) brought up
                  in the scenario.
                </li>
                <li>
                  The second question will be a <b>freeform task</b>
                  relating to a given set of data tables. This task may require
                  you to consider, explain, and justify something about the data
                  using visualization(s) to support your answer, it may ask you
                  to verify or refute information in the data, or it may ask you
                  to make predictions about something by visualizing trends in
                  the data.
                </li>
              </ol>
            </div>

            <p>
              <b><u>Protocol:</u></b>
              We will be using a <b>think-aloud protocol</b> throughout the
              study. That means we are looking to collect your thought process
              as it is happening. Please make every attempt to explain your
              thoughts, actions and intentions aloud as you work through this
              study. Please verbally summarize your insights and rationale every
              time you save a specific view and complete a task.
            </p>

            <!-- COLLEGES -->
            <template v-if="dataset == 'colleges'">
              <p>
                <b><u>Data:</u></b>
                You will be adding attributes into your tool from a set of data
                tables relating to <b>colleges</b>, where each row corresponds
                to a single US college.
              </p>

              <p>
                <b><u>Caveats:</u></b>
                During the task, carefully consider the <b>quality</b> of the
                data when deciding which attributes to use. In this interface,
                you <b>may not</b> directly edit the tables in any way.
              </p>
            </template>

            <!-- LOANS -->
            <template v-if="dataset == 'loans'">
              <p>
                <b><u>Data:</u></b>
                You will be adding attributes into your tool from a set of data
                tables relating to <b>loans</b>, where each row corresponds with
                a single loan application.
              </p>

              <p>
                <b><u>Caveats:</u></b>
                During the task, carefully consider the <b>quality</b> of the
                data when deciding which attributes to use. In this interface,
                you <b>may not</b> directly edit the tables in any way.
              </p>
            </template>
          </template>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { utils } from "@/utils/index.js";

export default {
  props: {
    // inherited from main.js
    phase: {
      type: String,
      default: () => "",
    },
    // inherited from main.js
    condition: {
      type: String,
      default: () => "",
    },
    // inherited from main.js
    dataset: {
      type: String,
      default: () => "",
    },
  },

  data: function () {
    return {
      utils: utils,
    };
  },

  computed: {
    title() {
      switch (this.phase) {
        case "practice":
          return "Practice - Instructions";
        case "activity":
          return "Activity - Instructions";
        default:
          return this.phase;
      }
    },
  },
};
</script>

<style scoped>
.table-col {
  border: 1px solid #ccc;
}

.custom-5-cols {
  width: 20%;
  max-width: 20%;
  flex-basis: 20%;
}

.data-table-container {
  padding: 0px;
  display: none;
}
</style>
