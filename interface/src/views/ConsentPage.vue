<template>
  <v-container fluid class="py-6 px-12 view-container">
    <!-- TITLE -->
    <v-row>
      <v-col class="text-center" cols="12">
        <h1>
          Consent Document for Enrolling Adult Participants in a Research Study
        </h1>
      </v-col>
    </v-row>

    <!-- SUBTITLE -->
    <v-row>
      <v-col cols="12">
        <!-- PROJECT TITLE -->
        <span>
          <b>Project Title:</b>
          Identifying the Cognitive Costs of Integrating Data During Visual Data
          Analysis
        </span>

        <br />

        <!-- PRINCIPLE INVESTIGATOR -->
        <span>
          <b>Principal Investigator:</b>
          Alex Endert
        </span>

        <br />

        <!-- CO-INVESTIGATOR -->
        <span>
          <b>Co-Investigators:</b>
          Adam Coscia
        </span>
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <!-- CONTENT -->
    <v-row>
      <v-col cols="12">
        <p>You are being asked to be a volunteer in a research study.</p>

        <p>
          <b><u>Purpose:</u></b>
          The purpose of this study is to compare two interface alternatives for
          integrating data to investigate potential cognitive limitations during
          visual data analysis.
        </p>

        <p>
          <b><u>Exclusion/Inclusion Criteria:</u></b>
          Participants in this study must be at least 18 years of age or older
          and have general familiarity with using web-based systems.
          Participants currently in an EU country cannot participate in this
          study.
        </p>

        <p>
          <b><u>Procedures:</u></b>
          If you decide to be in this study, your part will involve
          approximately two hours, during which time you will complete a
          pre-study survey, watch demonstrations of using both interfaces,
          perform a set of tasks visualizing data with each interface, and
          complete a post-study survey. With your permission we will record your
          interactions using logging software that will capture things like
          clicks and hovers. We will also capture screen and audio recording
          during the session.
        </p>

        <p>
          <b><u>Risks or Discomforts:</u></b>
          The risks involved are no greater than those involved in daily
          activities such as using a laptop for web-browsing.
        </p>

        <p>
          <b><u>Benefits:</u></b>
          You are not likely to benefit in any way from joining this study. We
          hope that what we learn will help to enhance our understanding of user
          interaction patterns related to decision making.
        </p>

        <p>
          <b><u>Compensation to You:</u></b>
          You will receive a $30 gift card for your time. U.S. Tax Law requires
          that a 1099-misc be issued if U.S. tax residents receive $600 or more
          per calendar year. If non-U.S. tax residents receive more than $75,
          mandatory 30% withholding is required. Your address and Tax I.D. may
          be collected for compensation purposes only. This information will be
          shared only with the Georgia Tech department that issues compensation,
          if any, for your participation.
        </p>

        <p>
          <b><u>Confidentiality:</u></b>
          We will comply with any applicable laws and regulations regarding
          confidentiality. To protect your privacy, your records will be kept
          under a code number rather than by name. Interaction logs will be
          stored on an external storage device. Your records, including
          interaction logs, questionnaire responses, and consent form will be
          kept in locked files and only study staff will be allowed to look at
          them. Your name and any other fact that might point to you will not
          appear when results of this study are presented or published. Federal
          regulations require that all study data be stored for a minimum of 3
          years. After analysis and publication, all records of your
          participation in the study will be destroyed. To make sure that this
          research is being carried out properly, the Georgia Institute of
          Technology IRB may review study records. The Office of Human Research
          Protections and the National Science Foundation may also look over
          study records during required reviews.
        </p>

        <p>
          <b><u>Costs to You:</u></b>
          If you participate in this study, you will be responsible for any data
          costs incurred while participating in the online study.
        </p>

        <p>
          <b><u>Participant Rights:</u></b>
          Your participation in this study is voluntary. You do not have to be
          in this study if you don't want to be. You have the right to change
          your mind and leave the study at any time without giving any reason
          and without penalty. If you decide not to finish the study, you have
          the right to withdraw any data collected about you. Should you decide
          to withdraw from the study, your questionnaires will be shredded. Any
          new information that may make you change your mind about being in this
          study will be given to you. You will be given a copy of this consent
          form to keep. You do not waive any of your legal rights by signing
          this consent form.
        </p>

        <p>
          <b><u>Questions about the Study:</u></b>
          If you have any questions about the study, you may contact Dr. Alex
          Endert at (404) 385-4477 or endert@gatech.edu.
        </p>

        <p>
          <b><u>Questions about Your Rights as a Research Participant:</u></b>
          If you have any questions about your rights as a research participant,
          you may contact Ms. Melanie Clark, Office of Research Integrity and
          Assurance, at (404) 894-6942.
        </p>
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <!-- ACCEPT STATEMENT -->
    <v-row justify="center">
      <v-col cols="auto">
        <p class="mb-0">
          By selecting <b>Accept</b>, you indicate that you have read the
          information in this consent form and consent to be in the study.
        </p>
      </v-col>
    </v-row>

    <!-- ACCEPT CHECKBOX -->
    <v-row justify="center">
      <v-col class="pa-0" cols="auto">
        <v-checkbox dense label="Accept" v-model="acceptedConsent"></v-checkbox>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: function () {
    return {
      acceptedConsent: false,
    };
  },

  watch: {
    acceptedConsent: function (newValue) {
      this.$set(this.$root.$data.session, "acceptedConsent", newValue);
    },
  },
};
</script>

<style></style>
