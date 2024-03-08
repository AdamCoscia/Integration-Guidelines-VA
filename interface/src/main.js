import Vue from "vue";
import App from "./App.vue";
import VueRouter from "vue-router";
import vuetify from "./plugins/vuetify";

import ConsentPage from "@/views/ConsentPage.vue";
import OverviewPage from "@/views/OverviewPage.vue";
import PreSurveyPage from "@/views/PreSurveyPage.vue";
import TaskPage from "@/views/TaskPage.vue";
import ApplicationPage from "@/views/ApplicationPage.vue";
import PostSurveyPage from "@/views/PostSurveyPage.vue";
import ThanksPage from "@/views/ThanksPage.vue";

import { utils } from "@/utils/index.js";

/**
 * Define the study condition (the order of the interfaces and datasets)
 */

const studyPagesOrder = [0, 1]; // control => augmentation
// const studyPagesOrder = [1, 0]; // augmentation => control
// const studyPagesOrder = utils.shuffle([0, 1]); // randomize condition order

// const practiceTaskOrder = [0, 1]; // MQ1 => MQ2
// const practiceTaskOrder = [1, 0]; // MQ2 => MQ1
const practiceTaskOrder = utils.shuffle([0, 1]); // randomize practice task order

const liveDatasetOrder = [0, 1]; // colleges => loans
// const liveDatasetOrder = [1, 0]; // loans => colleges
// const liveDatasetOrder = utils.shuffle([0, 1]); // randomize live task dataset order

/**
 * Define the page order and metadata for each page.
 */

const preStudyPages = [
  {
    name: "consent",
    title: "Consent",
    hasTasks: false,
  },
  {
    name: "overview",
    title: "Overview",
    hasTasks: false,
  },
  {
    name: "pre-survey",
    title: "Pre-Study Survey",
    hasTasks: false,
  },
];

const studyPages = [
  [
    {
      name: "task-practice-control",
      title: "Practice - Instructions",
      hasTasks: false,
    },
    {
      name: "live-practice-control",
      title: "Practice - Live",
      hasTasks: true,
    },
    {
      name: "task-activity-control",
      title: "Activity - Instructions",
      hasTasks: false,
    },
    {
      name: "live-activity-control",
      title: "Activity - Live",
      hasTasks: true,
    },
  ],
  [
    {
      name: "task-practice-augmentation",
      title: "Practice - Instructions",
      hasTasks: false,
    },
    {
      name: "live-practice-augmentation",
      title: "Practice - Live",
      hasTasks: true,
    },
    {
      name: "task-activity-augmentation",
      title: "Activity - Instructions",
      hasTasks: false,
    },
    {
      name: "live-activity-augmentation",
      title: "Activity - Live",
      hasTasks: true,
    },
  ],
];

const postStudyPages = [
  {
    name: "post-survey",
    title: "Post-Study Survey",
    hasTasks: false,
  },
  {
    name: "thanks",
    title: "Thank you!",
    hasTasks: false,
  },
];

const pages = preStudyPages
  .concat(studyPages[studyPagesOrder[0]])
  .concat(studyPages[studyPagesOrder[1]])
  .concat(postStudyPages);

/**
 * Define the tasks for the live pages
 */

const practiceTasks = [
  [
    {
      id: "MQ1",
      text: "What are the 3 lowest-rated movies from the year 2000 to the year 2005?",
    },
  ],
  [
    {
      id: "MQ2",
      text: "Which genre has the highest average production budget for R-rated movies?",
    },
  ],
];

const liveTasks = [
  [
    {
      id: "CQ1",
      text:
        "Imagine you are a reporter writing an article about US colleges. Create a visualization that you feel best shows the relationship between colleges' tuition, admission rate, and location; then find 2 schools with a high enrollment and a high graduation rate.",
    },
    {
      id: "CQ2",
      text:
        "Your best friend wants to attend a prestigious US college. However, her test scores and her family’s income are lower than average. She's feeling discouraged and isn't sure whether she will qualify. Create visualizations and find examples in the data that could help your friend decide where to apply.",
    },
  ],
  [
    {
      id: "LQ1",
      text:
        "Mary, 22, is applying for a housing loan after finally deciding to pursue her PhD. She expects to borrow at least $20,000, but her annual income is low and she is worried about high interest rates. Create a visualization that you feel best shows the relationship between loan amount, annual income and interest rate; then find 2 examples of high grade loans given to renters.",
    },
    {
      id: "LQ2",
      text:
        "There have been news reports across the US that loan applicants are receiving unjustly graded loans due to personal and financial biases. Create visualizations and find examples in the data that support, refute, or tell a different story from these news reports.",
    },
  ],
];

const tasks = {
  "live-practice-control": practiceTasks[practiceTaskOrder[studyPagesOrder.indexOf(0)]],
  "live-activity-control": liveTasks[liveDatasetOrder[studyPagesOrder.indexOf(0)]],
  "live-practice-augmentation": practiceTasks[practiceTaskOrder[studyPagesOrder.indexOf(1)]],
  "live-activity-augmentation": liveTasks[liveDatasetOrder[studyPagesOrder.indexOf(1)]],
};

/**
 * Define the URI routes and associated component pages.
 */

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      redirect: "/consent",
    },
    {
      path: "/consent",
      name: "consent",
      component: ConsentPage,
    },
    {
      path: "/overview",
      name: "overview",
      component: OverviewPage,
    },
    {
      path: "/pre-survey",
      name: "pre-survey",
      component: PreSurveyPage,
    },
    {
      path: "/task-practice-hrq",
      name: "task-practice-control",
      component: TaskPage,
      props: {
        phase: "practice",
        condition: "control",
        dataset: "movies",
      },
    },
    {
      path: "/live-practice-u1p",
      name: "live-practice-control",
      component: ApplicationPage,
      props: {
        phase: "practice",
        condition: "control",
        dataset: "movies",
      },
    },
    {
      path: "/task-activity-ziw",
      name: "task-activity-control",
      component: TaskPage,
      props: {
        phase: "activity",
        condition: "control",
        dataset: liveDatasetOrder[studyPagesOrder.indexOf(0)] == 0 ? "colleges" : "loans",
      },
    },
    {
      path: "/live-activity-em7",
      name: "live-activity-control",
      component: ApplicationPage,
      props: {
        phase: "activity",
        condition: "control",
        dataset: liveDatasetOrder[studyPagesOrder.indexOf(0)] == 0 ? "colleges" : "loans",
      },
    },
    {
      path: "/task-practice-jlg",
      name: "task-practice-augmentation",
      component: TaskPage,
      props: {
        phase: "practice",
        condition: "augmentation",
        dataset: "movies",
      },
    },
    {
      path: "/live-practice-0fs",
      name: "live-practice-augmentation",
      component: ApplicationPage,
      props: {
        phase: "practice",
        condition: "augmentation",
        dataset: "movies",
      },
    },
    {
      path: "/task-activity-42x",
      name: "task-activity-augmentation",
      component: TaskPage,
      props: {
        phase: "activity",
        condition: "augmentation",
        dataset: liveDatasetOrder[studyPagesOrder.indexOf(1)] == 0 ? "colleges" : "loans",
      },
    },
    {
      path: "/live-activity-a8o",
      name: "live-activity-augmentation",
      component: ApplicationPage,
      props: {
        phase: "activity",
        condition: "augmentation",
        dataset: liveDatasetOrder[studyPagesOrder.indexOf(1)] == 0 ? "colleges" : "loans",
      },
    },
    {
      path: "/post-survey",
      name: "post-survey",
      component: PostSurveyPage,
    },
    {
      path: "/thanks",
      name: "thanks",
      component: ThanksPage,
    },
  ],
});

/**
 * The data structure for recording data from each page of the app.
 */

let prevTimestamp = new Date().getTime(); // for measuring elapsed time

class PageRecord {
  completed;
  timestamp; // milliseconds since epoch
  elapsed; // milliseconds since previous timestamp

  constructor() {
    this.completed = false;
    this.timestamp = null;
    this.elapsed = null;
  }

  complete(elapsed) {
    this.completed = true;
    this.timestamp = new Date().getTime();
    if (elapsed) {
      this.elapsed = elapsed;
    } else {
      this.elapsed = this.timestamp - prevTimestamp;
    }
    prevTimestamp = this.timestamp;
    return this.elapsed;
  }

  save() {
    return {
      completed: this.completed,
      timestamp: this.timestamp,
      elapsed: this.elapsed,
    };
  }
}

class SessionPage {
  pid;
  conditionOrder;
  acceptedConsent;
  practiceTaskOrder;
  consent;
  overview;
  "pre-survey";
  "task-practice-control";
  "live-practice-control";
  "task-activity-control";
  "live-activity-control";
  "task-practice-augmentation";
  "live-practice-augmentation";
  "task-activity-augmentation";
  "live-activity-augmentation";
  "post-survey";
  thanks;

  constructor() {
    this.pid = utils.generatePID(12);
    this.conditionOrder = studyPagesOrder[0] == 0 ? ["control", "augmentation"] : ["augmentation", "control"];
    this.datasetOrder = liveDatasetOrder[0] == 0 ? ["colleges", "loans"] : ["loans", "colleges"];
    this.practiceTaskOrder = practiceTaskOrder[0] == 0 ? ["MQ1", "MQ2"] : ["MQ2", "MQ1"];
    this.acceptedConsent = false;
    this.consent = {
      record: new PageRecord(),
    };
    this.overview = {
      record: new PageRecord(),
    };
    this["pre-survey"] = {
      record: new PageRecord(),
    };
    this["task-practice-control"] = {
      record: new PageRecord(),
    };
    this["live-practice-control"] = {
      record: {
        [tasks["live-practice-control"][0].id]: new PageRecord(), // practice question 1 timestamp
        "all-tasks": new PageRecord(), // all tasks timestamp
      },
      data: {
        [tasks["live-practice-control"][0].id]: {
          timesRefreshed: 0,
          attributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          attributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          attributes: {},
          saved: [],
        }, // practice question 1 data
      },
    };
    this["task-activity-control"] = {
      record: new PageRecord(),
    };
    this["live-activity-control"] = {
      record: {
        [tasks["live-activity-control"][0].id]: new PageRecord(), // live question 1 timestamp
        [tasks["live-activity-control"][1].id]: new PageRecord(), // live question 2 timestamp
        "all-tasks": new PageRecord(), // all tasks timestamp
      },
      data: {
        [tasks["live-activity-control"][0].id]: {
          timesRefreshed: 0,
          attributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          attributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          attributes: {},
          saved: [],
        }, // live question 1 data
        [tasks["live-activity-control"][1].id]: {
          timesRefreshed: 0,
          attributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          attributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          attributes: {},
          saved: [],
        }, // live question 2 data
      },
    };
    this["task-practice-augmentation"] = {
      record: new PageRecord(),
    };
    this["live-practice-augmentation"] = {
      record: {
        [tasks["live-practice-augmentation"][0].id]: new PageRecord(), // practice question 2 timestamp
        "all-tasks": new PageRecord(), // all tasks timestamp
      },
      data: {
        [tasks["live-practice-augmentation"][0].id]: {
          secondaryAttributesAddedToAttributesPanel: {
            total: 0,
            added: [],
          },
          attributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          primaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          attributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          primaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToElaboratePanel: {
            total: 0,
            added: [],
          },
          attributes: {},
          saved: [],
        }, // practice question 2 data
      },
    };
    this["task-activity-augmentation"] = {
      record: new PageRecord(),
    };
    this["live-activity-augmentation"] = {
      record: {
        [tasks["live-activity-augmentation"][0].id]: new PageRecord(), // live question 3 timestamp
        [tasks["live-activity-augmentation"][1].id]: new PageRecord(), // live question 4 timestamp
        "all-tasks": new PageRecord(), // all tasks timestamp
      },
      data: {
        [tasks["live-activity-augmentation"][0].id]: {
          secondaryAttributesAddedToAttributesPanel: {
            total: 0,
            added: [],
          },
          attributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          primaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          attributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          primaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToElaboratePanel: {
            total: 0,
            added: [],
          },
          attributes: {},
          saved: [],
        }, // live question 3 data
        [tasks["live-activity-augmentation"][1].id]: {
          secondaryAttributesAddedToAttributesPanel: {
            total: 0,
            added: [],
          },
          attributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          primaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToEncodePanel: {
            total: 0,
            added: [],
          },
          attributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          primaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToFilterPanel: {
            total: 0,
            added: [],
          },
          secondaryAttributesAddedToElaboratePanel: {
            total: 0,
            added: [],
          },
          attributes: {},
          saved: [],
        }, // live question 4 data
      },
    };
    this["post-survey"] = {
      record: new PageRecord(),
    };
    this.thanks = {
      record: new PageRecord(),
    };
  }
}

const session = new SessionPage();

/**
 * Finally, load the app!
 */

Vue.config.productionTip = false;
Vue.use(VueRouter);
new Vue({
  vuetify,
  router,
  data: {
    currPageIndex: 0,
    currTaskIndex: 0,
    attributes: {},
    encodings: {},
    filters: {},
    selectedDataPoints: [],
    pages: pages,
    tasks: tasks,
    session: session,
  },
  render: (h) => h(App),
}).$mount("#app");
