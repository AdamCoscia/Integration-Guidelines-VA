<template>
  <div>
    <!-- LOAD DATASET -->
    <template v-if="!loadInterface">
      <LoadDialog v-if="useLoadDialog" @datasetLoaded="datasetLoaded" />
      <v-container v-else fluid class="pa-6">
        <v-row justify="center">
          <v-col cols="auto">
            <span>loading...</span>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <!-- LOAD INTERFACE -->
    <template v-if="loadInterface">
      <ControlInterface
        v-if="condition == 'control'"
        :filename="filename"
        :dataset="items"
        :attributes="attributes"
        @refreshAttributes="refreshAttributes"
      />
      <AugmentationInterface
        v-if="condition == 'augmentation'"
        :filename="filename"
        :dataset="items"
        :attributes="attributes"
      />
    </template>
  </div>
</template>

<script>
import axios from "axios";
import * as Papa from "papaparse";
import { Table } from "tableschema";

import LoadDialog from "@/components/LoadDialog/LoadDialog";
import ControlInterface from "@/components/ToolInterface/ControlInterface";
import AugmentationInterface from "@/components/ToolInterface/AugmentationInterface";

/**
 * 	items = [                            // each Object in Array is a single data point
 *    {
 *      <attribute>: ... ,                 // String   Value of <attribute> for this data point
 *      ...
 *    },
 *    ...
 *  ]
 *
 * 	attributes = {
 *    <attribute>: {
 *      name: ... ,                        // String   attribute name from file
 *      dataType: ... ,                    // String   one of { "number", "string", "datetime" }
 *      examples: [ ... ],                 // Array    randomly sampled list of cell values for attribute
 *      originalDataTypeChangedIcon: ...,  // String   either "mdi-update" or empty string
 *      range: [ ... ],                    // Array    either Set of [unique values ...] if dataType is string/datetime,
 *                                                     or 3-tuple of [min, max, step] if dataType is number
 *      source: ... ,                      // String   table where the attribute came from
 *      primary: ... ,                     // Boolean  whether to treat attribute as coming from primary table or not
 *      secondary: ... ,                   // Boolean  whether to treat attribute as coming from secondary table or not
 *      addedToAttributes: ... ,           // Boolean  whether attribute was added to attributes panel or not
 *      addedToElaborate: ... ,            // Boolean  whether attribute was added to elaborate panel or not
 *      relatedAttributes: [ ... ],        // Array    list of related attribute names
 *    },
 *    ...
 *  }
 */

export default {
  components: { LoadDialog, ControlInterface, AugmentationInterface },

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
      publicPath: process.env.BASE_URL,
      useLoadDialog: false, // whether to manually select file to load and parse
      tableLoaded: false, // updated when finished parsing CSV
      schemaLoaded: false, // updated when table schema fetched/computed
      filename: null, // either from schema.json or updated in LoadDialog.vue
      items: null, // either from schema.json or updated in LoadDialog.vue
      attributes: null, // either from schema.json or updated in LoadDialog.vue
      inferredAttributes: [], // inferred when loading data table
    };
  },

  mounted: function () {
    this.init(); // initialize the app
  },

  computed: {
    loadInterface() {
      return this.tableLoaded && this.schemaLoaded;
    },
  },

  watch: {
    "$root.$data.currTaskIndex": function (newIndex) {
      if (newIndex !== 0) {
        this.refreshAttributes();
      }
    },
  },

  methods: {
    init() {
      if (!this.useLoadDialog) {
        this.loadDataset(); // have to make request for data if not loading manually
      }
    },

    handleAxiosError(error) {
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
    },

    loadDataset() {
      let vm = this;

      let inferredAttributes = [];

      // get the attribute data for the current table and phase (JSON)
      const jsonURL = `${vm.publicPath}assets/data/${vm.dataset}_schema.json`;
      const jsonRequestConfig = {
        method: "GET",
        url: jsonURL,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        params: {
          t: new Date().getTime(),
        },
      };
      const jsonCallback = (res) => {
        // filter attributes from JSON that don't appear in the parsed table
        vm.attributes = Object.fromEntries(
          Object.entries(res.data).filter(
            ([key]) => inferredAttributes.indexOf(key.trim()) !== -1
          )
        );
        vm.schemaLoaded = true; // flag that table has been loaded
      };

      // get primary table for the current phase (CSV)
      let csvURL;
      switch (vm.condition) {
        case "control": {
          csvURL = `${vm.publicPath}assets/data/${vm.dataset}_tables/primary.csv`;
          break;
        }
        case "augmentation": {
          csvURL = `${vm.publicPath}assets/data/${vm.dataset}_all.csv`;
          break;
        }
      }
      const csvRequestConfig = {
        method: "GET",
        url: csvURL,
        headers: {
          Accept: "text/csv",
          "Content-Type": "text/csv",
          "Access-Control-Allow-Origin": "*",
        },
        params: {
          t: new Date().getTime(),
        },
      };
      const csvCallback = (res) => {
        // parse csv data, where each row becomes an object
        Papa.parse(res.data, {
          // dynamicTyping: true,
          complete: function (results) {
            // load results array into Table schema parser
            Table.load(results.data).then(function (table) {
              // Read back table as a list of objects
              table.read({ keyed: true }).then(function (data) {
                vm.items = data; // store data
                vm.tableLoaded = true; // flag that table has been loaded
                // Get schema from table
                table.infer().then(function (schema) {
                  // get list of inferred attributes from table
                  inferredAttributes = schema.fields.map((field) =>
                    field.name.trim()
                  );
                  // chain the request to get schema from JSON
                  axios(jsonRequestConfig)
                    .then(jsonCallback)
                    .catch((error) => vm.handleAxiosError(error));
                });
              });
            });
          },
        });
      };

      // make the initial request
      axios(csvRequestConfig)
        .then(csvCallback)
        .catch((error) => vm.handleAxiosError(error));
    },

    datasetLoaded(params) {
      let vm = this;
      vm.filename = params["filename"]; // send filename to interface component
      vm.items = params["dataset"]; // send dataset to interface component
      vm.attributes = params["attributes"]; // send attributes to interface component
      vm.tableLoaded = true; // flag that table has been loaded
      vm.schemaLoaded = true; // flag that schema has been loaded
    },

    refreshAttributes() {
      let vm = this;
      vm.filename = null; // reset data
      vm.items = null; // reset data
      vm.attributes = null; // reset data
      vm.tableLoaded = false; // reset flag
      vm.schemaLoaded = false; // reset flag
      vm.init(); // re-initialize the data
    },
  },
};
</script>

<style></style>
