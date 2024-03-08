<template>
  <v-container fluid class="pa-12 view-container">
    <!-- DESCRIPTION -->
    <v-row justify="center">
      <v-col cols="auto">
        <span>
          The user study will consist of the following steps. The times below
          are <b>estimates</b>; however, you may take as much time as you like.
        </span>
      </v-col>
    </v-row>

    <!-- LIST -->
    <v-row justify="center">
      <v-col cols="auto">
        <ul class="no-bullets">
          <li>
            <b><u>Pre-Study</u></b>
          </li>
        </ul>
        <ul class="pb-6">
          <li><b>[2 min]</b> Survey</li>
        </ul>
        <ul class="no-bullets">
          <li>
            <b><u>Interface 1</u></b>
          </li>
        </ul>
        <ul class="pb-6">
          <li><b>[10 min]</b> Practice Activity</li>
          <li><b>[30 min]</b> Live Activity</li>
        </ul>
        <ul class="no-bullets">
          <li>
            <b><u>Interface 2</u></b>
          </li>
        </ul>
        <ul class="pb-6">
          <li><b>[10 min]</b> Practice Activity</li>
          <li><b>[30 min]</b> Live Activity</li>
        </ul>
        <ul class="no-bullets">
          <li>
            <b><u>Post-Study</u></b>
          </li>
        </ul>
        <ul>
          <li><b>[10 min]</b> Debrief Interview</li>
          <li><b>[5 min]</b> Survey</li>
        </ul>
      </v-col>
    </v-row>
  </v-container>
</template>

<script></script>

<style>
.no-bullets {
  list-style-type: none;
}
</style>
