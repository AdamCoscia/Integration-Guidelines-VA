<template>
  <v-dialog
    persistent
    loading
    :value="dialogOpen"
    :max-width="!loadAttributeTable ? '500px' : '90%'"
  >
    <v-card>
      <!-- TITLE BAR -->
      <v-toolbar dense dark flat color="blue-grey darken-1">
        <v-toolbar-title>Upload</v-toolbar-title>
      </v-toolbar>

      <!-- CONTENT -->
      <div class="dialog-card-content">
        <!-- FILE INPUT -->
        <v-file-input
          chips
          show-size
          persistent-hint
          clearable
          accept="text/csv"
          placeholder="Select a *.csv file"
          label="File input"
          prepend-icon="mdi-paperclip"
          v-bind:hint="hintText"
          @change="fileChanged"
        >
          <template v-slot:selection="{ text }">
            <v-chip label color="primary">{{ text }}</v-chip>
          </template>
        </v-file-input>

        <!-- LOADED DATASET -->
        <AttributeTable
          v-if="loadAttributeTable"
          :filename="filename"
          :attributes="attributes"
          @attributeTypeOverride="attributeTypeOverride"
        ></AttributeTable>

        <!-- CONTINUE BUTTON -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            outlined
            text
            color="primary"
            :disabled="!loadAttributeTable"
            @click.native="close()"
          >
            OK
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import * as Papa from "papaparse";
import { Table } from "tableschema";
import { utils } from "@/utils/index.js";
import AttributeTable from "@/components/LoadDialog/AttributeTable.vue";

export default {
  components: { AttributeTable },

  data() {
    return {
      publicPath: process.env.BASE_URL, // for opening /assets folder in /public

      dialogOpen: true, // whether dialog is open or closed
      tableLoaded: false, // updated when finished parsing CSV
      schemaLoaded: false, // updated when table schema fetched/computed

      filename: "", // uploaded file name
      dataset: null, // list of objects representing data points
      attributes: null, // map of attribute schema values
      attributeTypeOverrides: null, // map of attribute type override assignments
    };
  },

  mounted: function () {
    let vm = this;
    vm.resetData();
  },

  computed: {
    loadAttributeTable() {
      return this.tableLoaded && this.schemaLoaded;
    },

    hintText: {
      get() {
        return this.loadAttributeTable
          ? "Success! Modify the attributes below and press OK to continue, or X to upload a new file"
          : "Acceptable *.csv files must be separated by commas";
      },
    },
  },

  methods: {
    /**
     * Resets loaded data.
     */
    resetData() {
      let vm = this;
      vm.tableLoaded = false;
      vm.schemaLoaded = false;
      vm.dataset = [];
      vm.attributes = {};
      vm.attributeTypeOverrides = {};
    },

    /**
     * Handles v-file-input state changes.
     * @param {*} input File object; see https://developer.mozilla.org/en-US/docs/Web/API/File
     */
    fileChanged(input) {
      let vm = this;
      vm.resetData(); // always purge data when file changes

      if (input instanceof File) {
        // save file name without .csv suffix
        vm.filename = input.name.replace(".csv", "");

        // parse the csv
        Papa.parse(input, {
          // dynamicTyping: true,
          complete: function (results) {
            // load results array into Table schema parser
            Table.load(results.data).then(function (table) {
              // Read back table as a list of objects
              table.read({ keyed: true }).then(function (data) {
                vm.dataset = data; // store data
                vm.tableLoaded = true; // flag that table has been loaded

                // Get schema from table
                table.infer().then(function (schema) {
                  let numSampleValues = 5; // get 5 sample values for each attribute
                  let start = utils.getRandomInt(
                    1,
                    vm.dataset.length - numSampleValues
                  );
                  let sampleRows = vm.dataset.slice(
                    start,
                    start + numSampleValues
                  );

                  // parse each field of the generated schema
                  schema.fields.forEach((field) => {
                    // resolve data type
                    let dtype;
                    switch (field.type) {
                      case "integer":
                      case "real":
                      case "number":
                        dtype = "number";
                        break;
                      case "datetime":
                      case "dateTime":
                        dtype = "datetime";
                        break;
                      default:
                        dtype = "string";
                        break;
                    }

                    // save attribute
                    Object.assign(vm.attributes, {
                      [field.name]: {
                        name: field.name,
                        dataType: dtype,
                        examples: sampleRows.map((row) => row[field.name]),
                        originalDataTypeChangedIcon: "",
                        range: [], // updated when interface loads
                        primary: Math.random() >= 0.5, // treat as part of source table
                        relatedAttributes: Math.random() >= 0.5 ? ["yes"] : [], // list of attr names
                      },
                    });
                  });

                  console.log(vm.attributes);

                  // flag that schema has been loaded
                  vm.schemaLoaded = true;
                });
              });
            });
          },
        });
      }
    },

    /**
     * Store any overrides emitted by AttributeTable.vue
     * @param {*} override Array => [index, name, dType]
     */
    attributeTypeOverride(override) {
      Object.assign(this.attributeTypeOverrides, override);
    },

    /**
     * Update the attribute data type schema and load the vis panel.
     */
    close() {
      let vm = this;

      // close the modal
      vm.dialogOpen = false;

      // updated attribute data type schema with overrides
      Object.keys(vm.attributeTypeOverrides).forEach((attr) => {
        vm.attributes[attr].dataType = vm.attributeTypeOverrides[attr]; // overwrite data type in attributes
      });

      // send params to ApplicationPage.vue
      vm.$emit("datasetLoaded", {
        filename: vm.filename,
        dataset: vm.dataset,
        attributes: vm.attributes,
      });
    },
  },
};
</script>

<style scoped>
.dialog-card-content {
  margin: 1.5rem 1.5rem 0 1.5rem;
  padding-bottom: 1.5rem;
}
</style>
