<template>
  <!-- ATTRIBUTES LIST -->
  <div class="attribute-container">
    <!-- HEADER ROW -->
    <v-row class="header-row text-center">
      <v-col cols="2">Data Type</v-col>
      <v-col cols="3">Attribute</v-col>
      <v-col cols="7">Examples</v-col>
    </v-row>

    <!-- ATTRIBUTE ROWS -->
    <v-row
      class="attribute-row"
      v-for="(attr, index) in attributeList"
      :key="index"
    >
      <!-- DYNAMIC DATA TYPE LABEL  -->
      <v-col cols="3">
        <v-menu offset-y :nudge-bottom="5">
          <!-- BUTTON -->
          <template v-slot:activator="{ on }">
            <!-- LABEL -->
            <span
              v-on="on"
              class="data-type-menu"
              :style="{
                'border-color': utils.getDataTypeIconAndColor(attr.dataType)
                  .color,
              }"
            >
              <v-icon
                :color="utils.getDataTypeIconAndColor(attr.dataType).color"
                v-text="utils.getDataTypeIconAndColor(attr.dataType).icon"
              ></v-icon>
              <span
                class="data-type-menu-label"
                :style="{
                  color: utils.getDataTypeIconAndColor(attr.dataType).color,
                }"
                v-text="attr.dataType"
              ></span>
              <v-icon>mdi-chevron-down</v-icon>
            </span>

            <!-- RESET ICON -->
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-icon
                  class="original-data-type-changed-icon"
                  v-text="attr.originalDataTypeChangedIcon"
                  v-on="on"
                  @click="resetDataType(index)"
                ></v-icon>
              </template>
              <span>Reset to default</span>
            </v-tooltip>
          </template>

          <!-- MENU -->
          <v-card>
            <v-list dense nav>
              <v-list-item-group
                mandatory
                v-model="attr.dataType"
                @change="onChangeDataType(index)"
              >
                <v-list-item :value="'string'">
                  <v-list-item-icon>
                    <!-- Categorical | Freesia -->
                    <v-icon color="#E3AE09">mdi-shape</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>string</v-list-item-content>
                </v-list-item>
                <v-list-item :value="'number'">
                  <v-list-item-icon>
                    <!-- Numerical | Emerald Green -->
                    <v-icon color="#50C878">mdi-pound</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>number</v-list-item-content>
                </v-list-item>
                <v-list-item :value="'datetime'">
                  <v-list-item-icon>
                    <!-- Temporal | Coral -->
                    <v-icon color="#FF8370">mdi-clock</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>datetime</v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
        </v-menu>
      </v-col>

      <!-- ATTRIBUTE NAME -->
      <v-col cols="3">
        <span class="font-weight-bold" v-text="attr.name"></span>
      </v-col>

      <!-- ROW EXAMPLES -->
      <v-col cols="6">
        <span v-text="attr.examples"></span>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { utils } from "@/utils/index.js";

export default {
  props: {
    // inherited from LoadDialog.vue
    filename: {
      type: String,
      default: () => "",
    },
    // inherited from LoadDialog.vue
    attributes: {
      type: Object,
      default: () => ({}),
    },
  },

  data: function () {
    return {
      utils: utils,
      attributeList: [], // make a reactive attribute list from passed attribute prop
      originalDataTypes: [], // preserve original data types
    };
  },

  mounted: function () {
    let vm = this;
    Object.keys(vm.attributes).forEach((attr) => {
      vm.attributeList.push(vm.attributes[attr]);
      vm.originalDataTypes.push(vm.attributes[attr].dataType);
    });
  },

  methods: {
    onChangeDataType(index) {
      let vm = this;

      // update attributeList to trigger list change
      let attr = vm.attributeList[index];
      if (attr.dataType !== vm.originalDataTypes[index]) {
        attr.originalDataTypeChangedIcon = "mdi-update"; // update icon
      } else {
        attr.originalDataTypeChangedIcon = ""; // no icon
      }
      vm.$set(vm.attributeList, index, attr);

      // emit override to LoadDialog.vue
      vm.$emit("attributeTypeOverride", {
        [attr.name]: attr.dataType,
      });
    },

    resetDataType(index) {
      let vm = this;

      // update attributeList to trigger list change
      let attr = vm.attributeList[index];
      attr.dataType = vm.originalDataTypes[index];
      attr.originalDataTypeChangedIcon = ""; // no icon
      vm.$set(vm.attributeList, index, attr);

      // emit override to LoadDialog.vue
      vm.$emit("attributeTypeOverride", {
        [attr.name]: attr.dataType,
      });
    },
  },
};
</script>

<style scoped>
.attribute-container {
  padding: 0.5rem 1.5rem 2rem 1.5rem;
}

.header-row {
  font-weight: 800 !important;
  border-bottom: 2px solid grey;
}

.attribute-row {
  border-bottom: 1px dashed lightgrey;
  align-items: center;
}

.data-type-menu {
  padding: 4px 0;
  margin-right: 2px;
  border: 2px solid; /* Set the color using attr props */
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.data-type-menu:hover {
  background-color: #eee;
}

.data-type-menu-label {
  font-weight: bold;
  font-size: 0.9rem;
  margin: 0 0.25rem;
}

.original-data-type-changed-icon {
  cursor: pointer;
}

.original-data-type-changed-icon:hover {
  color: black;
}
</style>
