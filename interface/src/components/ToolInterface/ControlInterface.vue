<template>
  <div>
    <!-- PROGRESS BAR -->
    <v-progress-linear
      indeterminate
      color="primary"
      class="mb-0"
      v-if="loading"
      height="2"
    ></v-progress-linear>

    <!-- VIS PANEL -->
    <v-container v-if="!loading" id="mainContainer" ref="mainContainer" fluid>
      <v-row class="flex-nowrap">
        <!-- ATTRIBUTE LIST -->
        <v-col id="attrCol" ref="attrCol" cols="auto">
          <!-- HEADER -->
          <v-row class="pb-3" align="center">
            <!-- LABEL -->
            <v-col class="attr-col-header" cols="auto">
              <span>Attributes</span>
            </v-col>

            <v-spacer></v-spacer>

            <!-- REFRESH -->
            <v-col cols="auto">
              <v-btn
                class="pa-1"
                style="height: 28px"
                @click="refreshAttributes"
              >
                <v-icon>mdi-sync</v-icon>
                <span style="font-size: 0.8rem">Refresh</span>
              </v-btn>
            </v-col>
          </v-row>

          <!-- ATTRIBUTES -->
          <v-row
            class="attr-col-card"
            :style="{
              'border-color': utils.getDataTypeIconAndColor(value.dataType)
                .color,
              'background-color': isEncoded(value) ? '#1976d2' : null,
            }"
            align="center"
            v-for="(value, key) in attributes"
            :key="key"
          >
            <!-- DATA TYPE ICON -->
            <v-icon
              :color="utils.getDataTypeIconAndColor(value.dataType).color"
              v-text="utils.getDataTypeIconAndColor(value.dataType).icon"
            ></v-icon>

            <!-- TEXT -->
            <span
              class="attr-col-card-name"
              :style="{
                color: utils.getDataTypeIconAndColor(value.dataType).color,
              }"
              v-text="key"
            ></span>
          </v-row>
        </v-col>

        <!-- CONFIGURATION -->
        <v-col id="configCol" ref="configCol" cols="auto">
          <!-- ENCODE -->
          <v-row class="encode-panel">
            <v-col cols="12">
              <!-- HEADER -->
              <v-row class="ma-n6 pb-3" align="center">
                <!-- LABEL -->
                <v-col class="encode-panel-header" cols="auto">
                  <span>Encode</span>
                </v-col>

                <v-spacer></v-spacer>

                <!-- SWAP -->
                <v-col cols="auto">
                  <v-btn
                    class="pa-1"
                    style="height: 28px"
                    @click="swapXY"
                    :disabled="!encodings.xVar && !encodings.yVar"
                  >
                    <v-icon>mdi-swap-vertical-bold</v-icon>
                    <span style="font-size: 0.8rem">Swap X/Y</span>
                  </v-btn>
                </v-col>

                <!-- RESET -->
                <v-col cols="auto">
                  <v-btn
                    class="pa-1"
                    style="height: 28px"
                    @click="resetEncodings"
                  >
                    <v-icon>mdi-refresh</v-icon>
                    <span style="font-size: 0.8rem">Reset</span>
                  </v-btn>
                </v-col>
              </v-row>

              <!-- SELECT PLOT TYPE -->
              <v-row class="py-3">
                <v-select
                  dense
                  hide-details
                  label="Chart Type"
                  v-model="encodings.plotType"
                  :items="plots"
                  :menu-props="{ bottom: true, offsetY: true }"
                  @change="updateChartType"
                ></v-select>
              </v-row>

              <v-row class="py-3" justify="space-between">
                <!-- SELECT AXIS ATTRIBUTE -->
                <v-col cols="7">
                  <!-- X-AXIS ATTRIBUTE -->
                  <v-row class="pb-6">
                    <v-select
                      dense
                      hide-details
                      clearable
                      label="X-axis Attribute"
                      v-model="encodings.xVar"
                      :items="Object.keys(attributes)"
                      :menu-props="{ bottom: true, offsetY: true }"
                      @change="updateXAxisAttr"
                    >
                      <template v-slot:item="{ item, on, attrs }">
                        <v-list-item v-on="on" v-bind="attrs">
                          <v-list-item-icon>
                            <v-icon
                              :color="
                                utils.getDataTypeIconAndColor(
                                  attributes[item].dataType
                                ).color
                              "
                              v-text="
                                utils.getDataTypeIconAndColor(
                                  attributes[item].dataType
                                ).icon
                              "
                            ></v-icon>
                          </v-list-item-icon>

                          <v-list-item-content>
                            <v-list-item-title
                              v-text="item"
                            ></v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-row>

                  <!-- Y-AXIS ATTRIBUTE -->
                  <v-row>
                    <v-select
                      dense
                      hide-details
                      clearable
                      label="Y-axis Attribute"
                      v-model="encodings.yVar"
                      :items="Object.keys(attributes)"
                      :menu-props="{ bottom: true, offsetY: true }"
                      @change="updateYAxisAttr"
                    >
                      <template v-slot:item="{ item, on, attrs }">
                        <v-list-item v-on="on" v-bind="attrs">
                          <v-list-item-icon>
                            <v-icon
                              :color="
                                utils.getDataTypeIconAndColor(
                                  attributes[item].dataType
                                ).color
                              "
                              v-text="
                                utils.getDataTypeIconAndColor(
                                  attributes[item].dataType
                                ).icon
                              "
                            ></v-icon>
                          </v-list-item-icon>

                          <v-list-item-content>
                            <v-list-item-title
                              v-text="item"
                            ></v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-row>
                </v-col>

                <!-- SELECT AGGREGATION -->
                <v-col cols="4">
                  <!-- X-AXIS AGGREGATION -->
                  <v-row class="pb-6">
                    <v-select
                      dense
                      hide-details
                      label="X-axis Aggregation"
                      v-model="encodings.axisAggType"
                      :style="{
                        visibility: showXAxisAggSelect ? 'visible' : 'hidden',
                        opacity: showXAxisAggSelect ? 1 : 0,
                      }"
                      :items="axisAggs"
                      :menu-props="{ bottom: true, offsetY: true }"
                      @change="$refs.plotSVG.updatePlot(true, false)"
                    ></v-select>
                  </v-row>

                  <!-- Y-AXIS AGGREGATION -->
                  <v-row>
                    <v-select
                      dense
                      hide-details
                      label="Y-axis Aggregation"
                      v-model="encodings.axisAggType"
                      :style="{
                        visibility: showYAxisAggSelect ? 'visible' : 'hidden',
                        opacity: showYAxisAggSelect ? 1 : 0,
                      }"
                      :items="axisAggs"
                      :menu-props="{ bottom: true, offsetY: true }"
                      @change="$refs.plotSVG.updatePlot(true, false)"
                    ></v-select>
                  </v-row>
                </v-col>
              </v-row>

              <!-- SELECT COLOR -->
              <v-row class="py-3" justify="space-between">
                <!-- COLOR ATTRIBUTE -->
                <v-col cols="7">
                  <v-row>
                    <v-select
                      dense
                      hide-details
                      clearable
                      label="Color Attribute"
                      v-model="encodings.colorVar"
                      :style="{
                        visibility:
                          colorAttributes.length > 0 ? 'visible' : 'hidden',
                        opacity: colorAttributes.length > 0 ? 1 : 0,
                      }"
                      :items="colorAttributes"
                      :menu-props="{ bottom: true, offsetY: true }"
                      @change="updateColorAttr"
                    >
                      <template v-slot:item="{ item, on, attrs }">
                        <v-list-item v-on="on" v-bind="attrs">
                          <v-list-item-icon>
                            <v-icon
                              :color="
                                utils.getDataTypeIconAndColor(
                                  attributes[item].dataType
                                ).color
                              "
                              v-text="
                                utils.getDataTypeIconAndColor(
                                  attributes[item].dataType
                                ).icon
                              "
                            ></v-icon>
                          </v-list-item-icon>

                          <v-list-item-content>
                            <v-list-item-title
                              v-text="item"
                            ></v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-row>
                </v-col>

                <!-- COLOR AGGREGATION -->
                <v-col cols="4">
                  <v-row>
                    <v-select
                      dense
                      hide-details
                      label="Color Aggregation"
                      v-model="encodings.colorAggType"
                      :style="{
                        visibility: showColorAggSelect ? 'visible' : 'hidden',
                        opacity: showColorAggSelect ? 1 : 0,
                      }"
                      :items="colorAggs"
                      :menu-props="{ bottom: true, offsetY: true }"
                      @change="$refs.plotSVG.updatePlot(true, true)"
                    ></v-select>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- FILTER PANEL -->
          <v-row class="filter-panel" ref="filterPanel">
            <v-col cols="12">
              <!-- HEADER -->
              <v-row class="ma-n6 pb-3" align="center">
                <!-- LABEL -->
                <v-col class="filter-panel-header" cols="auto">
                  <span>Filter</span>
                </v-col>

                <v-spacer></v-spacer>

                <!-- RESET -->
                <v-col cols="auto">
                  <v-btn
                    class="pa-1"
                    style="height: 28px"
                    @click="resetFilters"
                  >
                    <v-icon>mdi-refresh</v-icon>
                    <span style="font-size: 0.8rem">Reset</span>
                  </v-btn>
                </v-col>
              </v-row>

              <!-- ADD BUTTON -->
              <v-row class="pb-3">
                <v-menu bottom :offset-y="true">
                  <!-- MENU PREVIEW -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn block v-on="on" v-bind="attrs">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </template>

                  <!-- MENU CONTENTS -->
                  <v-card style="max-height: 304px">
                    <v-list dense>
                      <template v-if="inactiveFilterAttributes.length > 0">
                        <v-list-item
                          v-for="(attr, index) in inactiveFilterAttributes"
                          :key="index"
                          @click="addFilter(attr)"
                        >
                          <v-list-item-icon>
                            <v-icon
                              :color="
                                utils.getDataTypeIconAndColor(
                                  attributes[attr].dataType
                                ).color
                              "
                              v-text="
                                utils.getDataTypeIconAndColor(
                                  attributes[attr].dataType
                                ).icon
                              "
                            ></v-icon>
                          </v-list-item-icon>

                          <v-list-item-content>
                            <v-list-item-title
                              v-text="attr"
                            ></v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>

                      <template v-else>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              (all filters active!)
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-list>
                  </v-card>
                </v-menu>
              </v-row>

              <v-row
                class="filter-card"
                :style="{
                  'border-color': utils.getDataTypeIconAndColor(
                    attributes[attr].dataType
                  ).color,
                  'background-color': isEncoded(attributes[attr])
                    ? '#1976d2'
                    : null,
                }"
                align="center"
                v-for="(attr, index) in activeFilterAttributes"
                :key="index"
              >
                <v-col cols="12">
                  <!-- FILTER HEADER -->
                  <v-row class="pb-1">
                    <!-- DATA TYPE ICON -->
                    <v-icon
                      :color="
                        utils.getDataTypeIconAndColor(attributes[attr].dataType)
                          .color
                      "
                      v-text="
                        utils.getDataTypeIconAndColor(attributes[attr].dataType)
                          .icon
                      "
                    ></v-icon>

                    <!-- TEXT -->
                    <span
                      class="filter-card-name"
                      :style="{
                        color: utils.getDataTypeIconAndColor(
                          attributes[attr].dataType
                        ).color,
                      }"
                      v-text="attr"
                    ></span>

                    <v-spacer></v-spacer>

                    <!-- REMOVE FILTER -->
                    <v-btn
                      icon
                      class="action-button"
                      style="background: white"
                      @click="removeFilter(attr)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-row>

                  <!-- FILTER CONTENT (STRING, DATETIME) -->
                  <v-row
                    v-if="
                      ['string', 'datetime'].indexOf(
                        attributes[attr].dataType
                      ) !== -1
                    "
                    class="pb-1"
                  >
                    <v-col cols="12">
                      <!-- SELECT/DESELECT ALL -->
                      <v-row class="px-3 py-2" justify="space-between">
                        <v-col class="pa-0 pl-4" cols="auto">
                          <v-btn
                            class="pa-1"
                            style="height: 28px"
                            @click="selectAllFilter(attr)"
                          >
                            <v-icon>mdi-checkbox-marked</v-icon>
                            <span style="font-size: 0.8rem">Select All</span>
                          </v-btn>
                        </v-col>
                        <v-col class="pa-0 pr-4" cols="auto">
                          <v-btn
                            class="pa-1"
                            style="height: 28px"
                            @click="deselectAllFilter(attr)"
                          >
                            <v-icon>mdi-minus-box</v-icon>
                            <span style="font-size: 0.8rem">Deselect All</span>
                          </v-btn>
                        </v-col>
                      </v-row>

                      <!-- SELECTION -->
                      <v-row class="px-3 py-2">
                        <v-autocomplete
                          solo
                          multiple
                          hide-details
                          class="pa-1"
                          v-model="filters[attr]"
                          :menu-props="{ bottom: true, offsetY: true }"
                          :items="getSortedRange(attr)"
                          @change="$refs.plotSVG.updatePlot(true, true)"
                        >
                          <template v-slot:selection="{ item, index }">
                            <span
                              v-if="index === 0"
                              class="custom-text-field-input"
                              :style="{
                                'max-width':
                                  filters[attr].length == 1
                                    ? '100%'
                                    : 'calc(100% - 32px)',
                              }"
                            >
                              {{ item }}
                            </span>
                            <span
                              v-if="index === 1"
                              class="grey--text text-caption mx-1"
                            >
                              (+{{ filters[attr].length - 1 }})
                            </span>
                          </template>
                        </v-autocomplete>
                      </v-row>
                    </v-col>
                  </v-row>

                  <!-- FILTER CONTENT (NUMBER) -->
                  <v-row v-if="attributes[attr].dataType == 'number'">
                    <v-col cols="12">
                      <!-- CONFIGURATION -->
                      <v-row
                        class="px-3 py-2"
                        justify="space-between"
                        align="center"
                      >
                        <v-col class="pa-0 pl-3" cols="auto">
                          <v-text-field
                            solo
                            dense
                            single-line
                            hide-details
                            class="range-slider-text-field"
                            style="width: 76px"
                            :value="filters[attr][0]"
                            @change="setRangeFilter(attr, 0, $event)"
                          ></v-text-field>
                        </v-col>
                        <v-col class="pa-0" cols="auto">
                          <v-btn
                            class="pa-1"
                            style="height: 24px"
                            @click="resetRangeFilter(attr)"
                          >
                            <v-icon>mdi-undo</v-icon>
                            <span style="font-size: 0.8rem">Reset</span>
                          </v-btn>
                        </v-col>
                        <v-col class="pa-0 pr-3" cols="auto">
                          <v-text-field
                            solo
                            dense
                            single-line
                            hide-details
                            class="range-slider-text-field"
                            style="width: 76px"
                            :value="filters[attr][1]"
                            @change="setRangeFilter(attr, 1, $event)"
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <!-- SELECTION -->
                      <v-row class="px-3 py-2">
                        <v-range-slider
                          hide-details
                          class="range-slider"
                          background-color="white"
                          v-model="filters[attr]"
                          :key="sliderKey"
                          :min="attributes[attr].range[0]"
                          :max="attributes[attr].range[1]"
                          :step="attributes[attr].range[2]"
                          @input="updateRangeFilter()"
                        >
                        </v-range-slider>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>

        <!-- VISUALIZATION -->
        <v-col id="visCol" ref="visCol" cols="auto">
          <!-- ELABORATE PANEL -->
          <v-row class="elaborate-panel" ref="elaboratePanel">
            <v-col cols="12">
              <!-- HEADER -->
              <v-row class="ma-n6" align="center">
                <!-- LABEL -->
                <v-col class="elaborate-panel-header" cols="auto">
                  <span>Elaborate</span>
                </v-col>

                <!-- CLEAR SELECTED -->
                <v-col cols="auto">
                  <v-btn
                    class="pa-1"
                    style="height: 28px"
                    @click="clearSelectedDataPoints"
                    :disabled="selectedDataPoints.length == 0"
                  >
                    <v-icon>mdi-close</v-icon>
                    <span style="font-size: 0.8rem">Clear</span>
                  </v-btn>
                </v-col>

                <!-- PAGINATION -->
                <v-col cols="auto">
                  <!-- CURRENT PAGE -->
                  <span style="margin-right: 4px">
                    Page: {{ eTblCurrPage }} / {{ eTblTotalPages }}
                  </span>

                  <v-btn
                    class="action-button"
                    style="margin-right: 4px"
                    @click="eTblCurrPage--"
                    :disabled="
                      eTblCurrPage == 1 ||
                      eTblDataPoints.length <= eTblRowsPerPage
                    "
                  >
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>

                  <v-btn
                    class="action-button"
                    @click="eTblCurrPage++"
                    :disabled="
                      eTblCurrPage == eTblTotalPages ||
                      eTblDataPoints.length <= eTblRowsPerPage
                    "
                  >
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </v-col>

                <!-- NUMBER OF ROWS VISIBLE -->
                <v-col cols="auto">
                  <span style="margin-right: 4px">
                    Rows: {{ eTblRowsVisible[0] }} - {{ eTblRowsVisible[1] }} /
                    {{ eTblDataPoints.length }}
                  </span>
                </v-col>
              </v-row>

              <!-- TABLE -->
              <v-row class="flex-nowrap pt-3">
                <v-col
                  class="elaborate-table-col"
                  :style="{
                    'background-color': isEncoded(attributes[header.value])
                      ? '#1976d2'
                      : null,
                  }"
                  cols="auto"
                  v-for="header in eTblHeaders"
                  :key="header.value"
                >
                  <!-- HEADER ROW -->
                  <v-row class="elaborate-table-row-header">
                    <v-col class="pa-1" cols="12">
                      <!-- DATA TYPE ICON -->
                      <v-icon
                        :color="
                          utils.getDataTypeIconAndColor(
                            attributes[header.value].dataType
                          ).color
                        "
                        v-text="
                          utils.getDataTypeIconAndColor(
                            attributes[header.value].dataType
                          ).icon
                        "
                      ></v-icon>

                      <!-- TEXT -->
                      <span
                        class="attr-col-card-name"
                        :style="{
                          color: utils.getDataTypeIconAndColor(
                            attributes[header.value].dataType
                          ).color,
                        }"
                        v-text="header.text"
                      ></span>
                    </v-col>
                  </v-row>

                  <!-- DATA ROWS (HOVERED) -->
                  <v-row
                    class="elaborate-table-row-data"
                    v-for="dataPoint in eTblDataPoints.slice(
                      eTblRowsPerPage * (eTblCurrPage - 1),
                      eTblRowsPerPage * eTblCurrPage
                    )"
                    :key="dataPoint.__id__"
                  >
                    <v-col class="pa-1" cols="12">
                      <span
                        v-if="!!dataPoint[header.value]"
                        v-text="dataPoint[header.value]"
                      ></span>
                      <span v-else>&nbsp;</span>
                    </v-col>
                  </v-row>
                </v-col>

                <v-col class="pa-0" style="width: 12px" cols="auto"> </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- VISUALIZATION PANEL -->
          <v-row
            class="vis-panel"
            align="center"
            justify="center"
            style="position: relative"
          >
            <!-- SVG -->
            <keep-alive>
              <PlotSVG
                ref="plotSVG"
                :encodings="encodings"
                :attributes="attributes"
                :items="rawData"
                :filters="filters"
                :activeFilterAttributes="activeFilterAttributes"
                @updateHoveredDataPoints="updateHoveredDataPoints"
                @updateSelectedDataPoints="updateSelectedDataPoints"
              ></PlotSVG>
            </keep-alive>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import _cloneDeep from "lodash/cloneDeep";
import { utils } from "@/utils/index.js";
import PlotSVG from "@/components/ToolInterface/PlotSVG.vue";

export default {
  components: {
    PlotSVG,
  },

  props: {
    // inherited from ApplicationPage.vue
    filename: {
      type: String,
      default: () => "",
    },
    // inherited from ApplicationPage.vue
    dataset: {
      type: Array,
      default: () => [],
    },
    // inherited from ApplicationPage.vue
    attributes: {
      type: Object,
      default: () => ({}),
    },
  },

  data: function () {
    return {
      utils: utils,

      loading: true,
      bottomDrawerActive: false,
      eTblRowsPerPage: 50,
      eTblCurrPage: 1,
      sliderKey: 0,

      rawData: null,
      filters: null,
      encodings: null,
      activeFilterAttributes: null,
      hoveredDataPoints: null,
      selectedDataPoints: null,

      // list of plot types
      plots: [
        "Bar Chart",
        "Dot Plot",
        "Line Chart",
        "Scatter Plot",
        "Strip Plot",
      ],
      // list of aggregation operations
      axisAggs: ["Average", "Minimum", "Maximum", "Sum", "Count"],
      colorAggs: ["Average", "Minimum", "Maximum"],
    };
  },

  mounted: function () {
    let vm = this;
    vm.init();
  },

  computed: {
    currPage() {
      return this.$root.$data.pages[this.$root.$data.currPageIndex];
    },

    currTasks() {
      return this.$root.$data.tasks[this.currPage.name];
    },

    currTask() {
      return this.currTasks[this.$root.$data.currTaskIndex];
    },

    taskData() {
      return this.$root.$data.session[this.currPage.name].data[
        this.currTask.id
      ];
    },

    showXAxisAggSelect() {
      return (
        ["Bar Chart", "Line Chart"].indexOf(this.encodings.plotType) !== -1 &&
        this.encodings.xVar &&
        this.encodings.yVar &&
        this.attributes[this.encodings.yVar].dataType !== "number" &&
        this.attributes[this.encodings.xVar].dataType == "number"
      );
    },

    showYAxisAggSelect() {
      return (
        ["Bar Chart", "Line Chart"].indexOf(this.encodings.plotType) !== -1 &&
        this.encodings.xVar &&
        this.encodings.yVar &&
        this.attributes[this.encodings.yVar].dataType == "number"
      );
    },

    colorAttributes() {
      return ["Bar Chart", "Line Chart", "Dot Plot"].indexOf(
        this.encodings.plotType
      ) !== -1
        ? Object.keys(this.attributes).filter(
            (x) => this.attributes[x].dataType == "number"
          )
        : Object.keys(this.attributes);
    },

    showColorAggSelect() {
      return (
        ["Bar Chart", "Line Chart", "Dot Plot"].indexOf(
          this.encodings.plotType
        ) !== -1 && this.encodings.colorVar
      );
    },

    inactiveFilterAttributes() {
      return Object.keys(this.attributes).filter(
        (attr) => this.activeFilterAttributes.indexOf(attr) == -1
      );
    },

    eTblHeaders() {
      return Object.keys(this.attributes).map((attr) => {
        return { text: attr, value: attr };
      });
    },

    eTblDataPoints() {
      return this.hoveredDataPoints.length > 0
        ? this.hoveredDataPoints.map((pos) => this.rawData[pos])
        : this.selectedDataPoints.length > 0
        ? this.selectedDataPoints.map((pos) => this.rawData[pos])
        : [];
    },

    eTblTotalPages() {
      return Math.max(
        Math.ceil(this.eTblDataPoints.length / this.eTblRowsPerPage),
        1
      );
    },

    eTblRowsVisible() {
      if (this.eTblDataPoints.length == 0) {
        return [null, null];
      } else {
        return this.eTblCurrPage == this.eTblTotalPages
          ? [
              this.eTblRowsPerPage * (this.eTblCurrPage - 1) + 1,
              this.eTblDataPoints.length,
            ]
          : [
              this.eTblRowsPerPage * (this.eTblCurrPage - 1) + 1,
              this.eTblRowsPerPage * this.eTblCurrPage,
            ];
      }
    },
  },

  watch: {
    dataset: function () {
      let vm = this;
      vm.init(); // re-initialize the app
      setTimeout(function () {
        vm.$refs.plotSVG.updatePlot(true, true); // update the plot
      }, 200);
    },
  },

  methods: {
    init() {
      let vm = this;

      // set default values
      vm.activeFilterAttributes = [];
      vm.hoveredDataPoints = [];
      vm.selectedDataPoints = [];
      vm.encodings = {
        plotType: "Bar Chart",
        xVar: "",
        yVar: "",
        axisAggType: "Average",
        colorVar: "",
        colorAggType: "Average",
      };

      // create raw data table with custom tracked values
      vm.rawData = _cloneDeep(vm.dataset).map((dataPoint, index) => {
        return {
          ...dataPoint,
          __id__: index,
          __hovered__: false,
          __selected__: false,
        };
      });

      Number.prototype.countDecimals = function () {
        if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
        return this.toString().split(".")[1].length || 0;
      };

      // get attribute extents, filters, and parse values
      vm.filters = {};
      for (const [key, value] of Object.entries(vm.attributes)) {
        switch (value.dataType) {
          case "string":
          case "datetime": {
            value.range = [
              ...new Set(vm.rawData.map((d) => d[key]).filter((v) => !!v)),
            ];
            break;
          }
          case "number": {
            vm.rawData.forEach(function (d) {
              d[key] = parseFloat(d[key]); // convert values to floats or NaN
            });
            const values = vm.rawData.map((d) => d[key]).filter((v) => !!v);
            if (values.length == 0) {
              value.range = [0, 1, 1]; // default if no values to create range from
            } else {
              value.range = [
                Math.min(...values),
                Math.max(...values),
                10 ** -Math.max(...values.map((x) => x.countDecimals())),
              ];
            }
            break;
          }
        }
        Object.assign(vm.filters, { [key]: _cloneDeep(value.range) });
      }

      // update store values
      vm.$root.$data.attributes = vm.attributes;
      vm.$root.$data.encodings = vm.encodings;
      vm.$root.$data.filters = vm.activeFilterAttributes.map(
        (attr) => vm.filters[attr]
      );
      vm.$root.$data.selectedDataPoints = vm.selectedDataPoints;

      // let the interface show!
      vm.loading = false;
    },

    refreshAttributes() {
      this.loading = true; // hide the interface
      this.taskData.timesRefreshed += 1; // increment refresh attribute counter
      this.$emit("refreshAttributes");
    },

    swapXY() {
      const xVar = this.encodings["xVar"];
      this.encodings["xVar"] = this.encodings["yVar"];
      this.encodings["yVar"] = xVar;
      this.$refs.plotSVG.updatePlot(true, false);
    },

    resetEncodings() {
      let vm = this;
      vm.encodings = {
        plotType: "Bar Chart",
        xVar: "",
        yVar: "",
        axisAggType: "Average",
        colorVar: "",
        colorAggType: "Average",
      };
      setTimeout(function () {
        vm.$refs.plotSVG.updatePlot(true, true); // update the plot
      }, 200);
    },

    isEncoded(attr) {
      return (
        attr.name == this.encodings.xVar || attr.name == this.encodings.yVar
      );
    },

    updateChartType() {
      this.encodings.colorVar = ""; // reset color var
      this.$refs.plotSVG.init();
      this.$refs.plotSVG.updatePlot(true, true);
    },

    updateXAxisAttr() {
      let vm = this;
      const attr = vm.encodings.xVar;
      vm.taskData.attributesAddedToEncodePanel.total += 1;
      vm.taskData.attributesAddedToEncodePanel.added.push(attr);
      if (vm.attributes[attr].secondary) {
        vm.taskData.secondaryAttributesAddedToEncodePanel.total += 1;
        vm.taskData.secondaryAttributesAddedToEncodePanel.added.push(attr);
      }
      vm.$refs.plotSVG.updatePlot(true, false);
    },

    updateYAxisAttr() {
      let vm = this;
      const attr = vm.encodings.yVar;
      vm.taskData.attributesAddedToEncodePanel.total += 1;
      vm.taskData.attributesAddedToEncodePanel.added.push(attr);
      if (vm.attributes[attr].secondary) {
        vm.taskData.secondaryAttributesAddedToEncodePanel.total += 1;
        vm.taskData.secondaryAttributesAddedToEncodePanel.added.push(attr);
      }
      vm.$refs.plotSVG.updatePlot(true, false);
    },

    updateColorAttr() {
      let vm = this;
      const attr = vm.encodings.colorVar;
      vm.taskData.attributesAddedToEncodePanel.total += 1;
      vm.taskData.attributesAddedToEncodePanel.added.push(attr);
      if (vm.attributes[attr].secondary) {
        vm.taskData.secondaryAttributesAddedToEncodePanel.total += 1;
        vm.taskData.secondaryAttributesAddedToEncodePanel.added.push(attr);
      }
      vm.$refs.plotSVG.updatePlot(true, true);
    },

    resetFilters() {
      let vm = this;
      Object.keys(this.attributes).forEach((attr) => {
        const index = vm.activeFilterAttributes.indexOf(attr);
        if (index !== -1) {
          vm.activeFilterAttributes.splice(index, 1);
          vm.filters[attr] = vm.attributes[attr].range.slice(); // reset filter
        }
      });
      setTimeout(function () {
        vm.$refs.plotSVG.updatePlot(true, true); // update the plot
      }, 200);
    },

    addFilter(attr) {
      let vm = this;
      const index = vm.activeFilterAttributes.indexOf(attr);
      if (index == -1) {
        vm.activeFilterAttributes.push(attr);
        vm.taskData.attributesAddedToFilterPanel.total += 1;
        vm.taskData.attributesAddedToFilterPanel.added.push(attr);
        if (vm.attributes[attr].secondary) {
          vm.taskData.secondaryAttributesAddedToFilterPanel.total += 1;
          vm.taskData.secondaryAttributesAddedToFilterPanel.added.push(attr);
        }
      }
    },

    removeFilter(attr) {
      let vm = this;
      const index = vm.activeFilterAttributes.indexOf(attr);
      if (index !== -1) {
        vm.activeFilterAttributes.splice(index, 1);
        vm.filters[attr] = vm.attributes[attr].range.slice(); // reset filter
        vm.$refs.plotSVG.updatePlot(true, true);
      }
    },

    selectAllFilter(attr) {
      let vm = this;
      vm.$nextTick(() => {
        vm.filters[attr] = vm.attributes[attr].range.slice();
        vm.$forceUpdate();
        vm.$refs.plotSVG.updatePlot(true, true);
      });
    },

    deselectAllFilter(attr) {
      let vm = this;
      vm.$nextTick(() => {
        vm.filters[attr] = [];
        vm.$forceUpdate();
        vm.$refs.plotSVG.updatePlot(true, true);
      });
    },

    getSortedRange(attr) {
      return [...this.attributes[attr].range].sort();
    },

    setRangeFilter(attr, index, value) {
      let vm = this;
      vm.$nextTick(() => {
        const minVal = vm.attributes[attr].range[0];
        const maxVal = vm.attributes[attr].range[1];
        const step = vm.attributes[attr].range[2];
        if (index == 0) {
          if (value < minVal) {
            vm.$set(vm.filters[attr], index, minVal);
          } else if (value >= maxVal) {
            vm.$set(vm.filters[attr], index, maxVal - step);
          } else {
            vm.$set(vm.filters[attr], index, value);
          }
        } else if (index == 1) {
          if (value <= minVal) {
            vm.$set(vm.filters[attr], index, minVal + step);
          } else if (value > maxVal) {
            vm.$set(vm.filters[attr], index, maxVal);
          } else {
            vm.$set(vm.filters[attr], index, value);
          }
        }
        vm.$forceUpdate();
        vm.$refs.plotSVG.updatePlot(true, false);
        vm.sliderKey += 1;
      });
    },

    resetRangeFilter(attr) {
      let vm = this;
      vm.$nextTick(() => {
        vm.filters[attr] = vm.attributes[attr].range.slice(); // reset filter
        vm.$forceUpdate();
        vm.$refs.plotSVG.updatePlot(true, false);
        vm.sliderKey += 1;
      });
    },

    updateRangeFilter() {
      let vm = this;
      vm.$nextTick(() => {
        vm.$forceUpdate();
        vm.$refs.plotSVG.updatePlot(true, false);
      });
    },

    updateHoveredDataPoints(newHoveredDataPoints) {
      let vm = this;
      for (let i = 0; i < vm.rawData.length; i++) {
        vm.rawData[i].__hovered__ = newHoveredDataPoints.indexOf(i) !== -1;
      }
      vm.eTblCurrPage = 1; // reset current page
      vm.hoveredDataPoints = newHoveredDataPoints; // update hovered points
    },

    updateSelectedDataPoints(newSelectedDataPoints) {
      let vm = this;
      for (let i = 0; i < vm.rawData.length; i++) {
        vm.rawData[i].__selected__ = newSelectedDataPoints.indexOf(i) !== -1;
      }
      vm.eTblCurrPage = 1; // reset current page
      vm.selectedDataPoints = newSelectedDataPoints; // update selected points
      vm.$root.$data.selectedDataPoints = vm.selectedDataPoints; // update store
    },

    clearSelectedDataPoints() {
      let vm = this;
      for (let i = 0; i < vm.rawData.length; i++) {
        vm.rawData[i].__selected__ = false;
      }
      vm.eTblCurrPage = 1; // reset current page
      vm.selectedDataPoints = []; // reset selected points
      vm.$refs.plotSVG.selectedDataPoints = [];
      vm.$refs.plotSVG.updatePlot(false, false);
      vm.$root.$data.selectedDataPoints = vm.selectedDataPoints; // update store
    },
  },
};
</script>

<style scoped>
.action-button {
  height: 24px !important;
  width: 24px !important;
  vertical-align: bottom;
}

.custom-text-field-input {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#attrCol {
  margin: 12px 0px 12px 12px;
  width: 320px;
  overflow-y: auto;
  background: #eaeaea;
  /* full height - app bar - 2 margins */
  height: calc(100vh - 64px - (12px * 2));
}

.attr-col-header {
  font-weight: bold;
}

.attr-col-card {
  padding: 4px;
  margin: 6px 0px;
  border: 2px solid; /* Set the color using attr props */
  border-radius: 4px;
  background-color: white;
}

.attr-col-card-name {
  margin: 0px 4px;
  font-weight: bold;
  font-size: 0.9rem;
}

#configCol {
  margin: 12px;
  width: 384px;
}

.encode-panel {
  padding: 12px;
  background: #eaeaea;
  height: calc(256px + (12px * 2)); /* 2 margins */
}

.encode-panel-header {
  font-weight: bold;
}

.filter-panel {
  padding: 12px;
  margin-top: 24px !important;
  overflow-y: auto;
  background: #eaeaea;
  /* full height - app bar - encodePanel - 5 margins */
  height: calc(100vh - 64px - 256px - (12px * 5));
}

.filter-panel-header {
  font-weight: bold;
}

.filter-card {
  padding: 4px;
  margin-bottom: 0 !important;
  border: 2px solid; /* Set the color using attr props */
  border-radius: 4px;
  background-color: white;
}

.filter-card-name {
  margin: 0px 4px;
  font-weight: bold;
  font-size: 0.9rem;
}

.range-slider >>> .v-input__slot {
  border-radius: 8px;
}

.range-slider >>> .v-slider--horizontal {
  margin-left: 16px;
  margin-right: 16px;
}

.range-slider-text-field {
  height: 24px !important;
  min-height: 0 !important;
}

.range-slider-text-field >>> .v-input__control {
  height: 24px !important;
  min-height: 0 !important;
}

.range-slider-text-field >>> .v-input__slot {
  padding: 0 4px !important;
  height: 24px !important;
  min-height: 0 !important;
}

#visCol {
  margin: 12px 12px 12px 0px;
  /* full width - attrCol - configCol - 4 margins */
  width: calc(100vw - 320px - 384px - (12px * 4));
}

.elaborate-panel {
  padding: 12px;
  overflow: auto;
  background: #eaeaea;
  /* 2 margins */
  height: calc(128px + (12px * 2));
}

.elaborate-panel-header {
  font-weight: bold;
}

.elaborate-table-col {
  border: 1px solid #ccc;
  background-color: white;
}

.elaborate-table-row-header {
  border-bottom: 2px solid #727272;
}

.vis-panel {
  margin-top: 24px;
  /* full height - app bar - elaboratePanel - 5 margins */
  height: calc(100vh - 64px - 128px - (12px * 5));
}
</style>
