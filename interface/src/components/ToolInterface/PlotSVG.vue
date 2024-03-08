<template>
  <div>
    <svg ref="plotSVG" class="plotSVG" />
    <svg ref="legendSVG" class="legendSVG" />
  </div>
</template>

<script>
import * as d3 from "d3";
import { utils, plotUtils } from "@/utils/index.js";

export default {
  props: {
    // inherited from ControlInterface.vue / AugmentationInterface.vue
    encodings: {
      type: Object,
      default: () => ({}),
    },
    // inherited from ControlInterface.vue / AugmentationInterface.vue
    attributes: {
      type: Object,
      default: () => ({}),
    },
    // inherited from ControlInterface.vue / AugmentationInterface.vue
    items: {
      type: Array,
      default: () => [],
    },
    // inherited from ControlInterface.vue / AugmentationInterface.vue
    filters: {
      type: Object,
      default: () => ({}),
    },
    // inherited from ControlInterface.vue / AugmentationInterface.vue
    activeFilterAttributes: {
      type: Array,
      default: () => [],
    },
  },

  data: function () {
    return {
      plotSVG: undefined,

      plotMargins: undefined,
      plotWidth: undefined,
      plotHeight: undefined,
      plotGroup: undefined,

      xScale: undefined,
      xAxis: undefined,
      xAxisGroup: undefined,
      yScale: undefined,
      yAxis: undefined,
      yAxisGroup: undefined,

      marksGroup: undefined,

      legendSVG: undefined,
      legendMargins: undefined,
      legendSVGWidth: undefined,
      legendSVGHeight: undefined,
      legendGroup: undefined,

      prepared: [],
      hoveredDataPoints: [],
      selectedDataPoints: [],

      strIcon: `<tspan style="font-family: 'Material Design Icons'; font-size: 1rem; fill: #E3AE09;">&#xF0831;</tspan>`,
      numIcon: `<tspan style="font-family: 'Material Design Icons'; font-size: 1rem; fill: #50C878;">&#xF0423;</tspan>`,
      dteIcon: `<tspan style="font-family: 'Material Design Icons'; font-size: 1rem; fill: #FF8370;">&#xF0954;</tspan>`,

      nothingSelectedMessage: `
        <tspan>To get started, please select</tspan>
        <tspan x="0" dy="1.2em">encodings from the Encode panel!</tspan>
      `,
      noDataMessage: `
        <tspan>No data with the current configuration.</tspan>
        <tspan x="0" dy="1.2em">Please review your filters and encodings.</tspan>
      `,
    };
  },

  mounted: function () {
    let vm = this;

    // add event listeners
    window.addEventListener("resize", vm.onResize); // Register an event listener when the Vue component is ready

    // wait 300ms until any transitions have finished before updating
    setTimeout(function () {
      vm.init(); // calculate the size of the vis
      vm.updatePlot(true, true); // draw the vis
    }, 300);
  },

  beforeDestroy: function () {
    window.removeEventListener("resize", this.onResize); // Unregister the event listener before destroying this Vue instance
  },

  computed: {
    unsupportedMessage: function () {
      let vm = this;
      switch (vm.encodings.plotType) {
        case "Bar Chart": {
          return `
            <tspan>If using string (</tspan>${vm.strIcon}<tspan>) and/or datetime (</tspan>${vm.dteIcon}<tspan>)</tspan>
            <tspan x="0" dy="1.2em">attributes, you must have <tspan style="font-weight: 800 !important">only one</tspan>!</tspan>
          `;
        }
        case "Dot Plot": {
          return `
            <tspan>You cannot use number (</tspan>${vm.numIcon}<tspan>) attributes!</tspan>
          `;
        }
        case "Line Chart": {
          return `
            <tspan>Try using a datetime (</tspan>${vm.dteIcon}<tspan>)</tspan>
            <tspan x="0" dy="1.2em">attribute on the <tspan style="font-weight: 800 !important">X-axis</tspan>!</tspan>
          `;
        }
        case "Scatter Plot": {
          return `
            <tspan>Use both x- and y- axes and select at</tspan>
            <tspan x="0" dy="1.2em">least <tspan style="font-weight: 800 !important">one</tspan> number (</tspan>${vm.numIcon}<tspan>) attribute!</tspan>
          `;
        }
        case "Strip Plot": {
          return `
            <tspan>Try using one number (</tspan>${vm.numIcon}<tspan>)</tspan>
            <tspan x="0" dy="1.2em">attribute <tspan style="font-weight: 800 !important">at most</tspan> on either axis!</tspan>
          `;
        }
        default: {
          return `<tspan>(unknown plot type: ${vm.encodings.plotType})</tspan>`;
        }
      }
    },
  },

  methods: {
    init() {
      let vm = this;

      let plotSVGWidth =
        vm.$parent.$refs.mainContainer.clientWidth -
        vm.$parent.$refs.attrCol.clientWidth -
        vm.$parent.$refs.configCol.clientWidth -
        90 - // legendSVG width
        12 * 4; // 4 margins
      let plotSVGHeight =
        vm.$parent.$refs.mainContainer.clientHeight -
        vm.$parent.$refs.elaboratePanel.clientHeight -
        12 * 4; // 4 margins

      // make the plot square
      if (plotSVGWidth > plotSVGHeight) {
        plotSVGWidth = plotSVGHeight;
      } else {
        plotSVGHeight = plotSVGWidth;
      }

      // remove any children of the SVG and set new width and height
      vm.plotSVG = d3.select(vm.$refs.plotSVG);
      vm.plotSVG.selectAll("*").remove();
      vm.plotSVG.attr("width", plotSVGWidth).attr("height", plotSVGHeight);

      // set plot margins, width and height
      vm.plotMargins = { top: 12, bottom: 60, left: 60, right: 12 };
      vm.plotWidth = plotSVGWidth - vm.plotMargins.left - vm.plotMargins.right;
      vm.plotHeight =
        plotSVGHeight - vm.plotMargins.top - vm.plotMargins.bottom;

      // Add plot group, containing axes, marks, and legend
      vm.plotGroup = vm.plotSVG
        .append("g")
        .classed("plot", true)
        .attr(
          "transform",
          `translate(${vm.plotMargins.left}, ${vm.plotMargins.top})`
        );

      // Add X and Y axis groups
      vm.yAxisGroup = vm.plotGroup
        .append("g")
        .classed("y", true)
        .classed("axis", true);
      vm.xAxisGroup = vm.plotGroup
        .append("g")
        .classed("x", true)
        .classed("axis", true)
        .attr("transform", `translate(${0}, ${vm.plotHeight})`);

      // Add data marks group
      vm.marksGroup = vm.plotGroup.append("g").classed("marks", true);

      // define parameters for legend
      const legendSVGWidth = 90;
      const legendSVGHeight = plotSVGHeight;

      // remove any children of the SVG and set new width and height
      vm.legendSVG = d3.select(vm.$refs.legendSVG);
      vm.legendSVG.selectAll("*").remove();
      vm.legendSVG
        .attr("width", legendSVGWidth)
        .attr("height", legendSVGHeight);

      vm.legendMargins = { top: 12, bottom: 60, left: 12, right: 60 };
      vm.legendWidth =
        legendSVGWidth - vm.legendMargins.left - vm.legendMargins.right;
      vm.legendHeight =
        legendSVGHeight - vm.legendMargins.top - vm.legendMargins.bottom;

      // Add legend group
      vm.legendGroup = vm.legendSVG
        .append("g")
        .classed("legend", true)
        .attr(
          "transform",
          `translate(${vm.legendMargins.left}, ${vm.legendMargins.top})`
        );

      if (vm.encodings.plotType == "Line Chart") {
        // enable pointer-events on marks group
        vm.marksGroup.style("pointer-events", "fill");

        // Add bounding box to line group for event listeners
        vm.marksGroup
          .append("rect")
          .attr("class", "event-bbox")
          .attr("height", vm.plotHeight)
          .attr("width", vm.plotWidth)
          .attr("visibility", "hidden");

        // draw intersection line (hidden at first)
        vm.marksGroup
          .append("line")
          .attr("y2", vm.plotHeight)
          .attr("class", "intersect-line")
          .attr("stroke", "currentColor")
          .attr("stroke-dasharray", "5,5")
          .style("display", "none");

        // add empty path element to be drawn on update
        vm.marksGroup
          .append("path")
          .attr("class", "connect-line")
          .attr("fill", "none")
          .attr("stroke", "currentColor");
      }
    },

    onResize() {
      this.init(); // set the size of the vis
      this.updatePlot(false, true); // re-draw the vis
    },

    xVarIs(dataType) {
      let vm = this;
      let result = false;
      if (!vm.encodings["xVar"]) {
        if (dataType == "NA") {
          result = true;
        }
      } else {
        if (vm.attributes[vm.encodings["xVar"]].dataType == dataType) {
          result = true;
        }
      }
      return result;
    },

    yVarIs(dataType) {
      let vm = this;
      let result = false;
      if (!vm.encodings["yVar"]) {
        if (dataType == "NA") {
          result = true;
        }
      } else {
        if (vm.attributes[vm.encodings["yVar"]].dataType == dataType) {
          result = true;
        }
      }
      return result;
    },

    updateLegend() {
      let vm = this;

      // clear current legend
      vm.legendGroup.selectAll("*").remove();

      // range of the color var
      const range = vm.attributes[vm.encodings["colorVar"]].range;

      if (vm.attributes[vm.encodings["colorVar"]].dataType == "number") {
        // numerical attribute => sequential scale
        // method adopted from: https://bl.ocks.org/starcalibre/6cccfa843ed254aa0a0d

        // append gradient bar
        const gradient = vm.legendGroup
          .append("defs")
          .append("linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%") // bottom
          .attr("y1", "100%")
          .attr("x2", "0%") // to top
          .attr("y2", "0%")
          .attr("spreadMethod", "pad");

        // programatically generate the gradient for the legend
        // this creates an array of [pct, colour] pairs as stop
        // values for legend
        const pct = plotUtils
          .linspace(0, 100, plotUtils.scaleViridis.length)
          .map(function (d) {
            return Math.round(d) + "%";
          });
        const colourPct = d3.zip(pct, plotUtils.scaleViridis);
        colourPct.forEach(function (d) {
          gradient
            .append("stop")
            .attr("offset", d[0])
            .attr("stop-color", d[1])
            .attr("stop-opacity", 1);
        });

        // add gradient rect to the svg
        vm.legendGroup
          .append("rect")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("width", vm.legendWidth)
          .attr("height", vm.legendHeight)
          .style("fill", "url(#gradient)");

        // create a scale and axis for the legend
        const legendScale = d3
          .scaleLinear()
          .domain([range[0], range[1]])
          .range([vm.legendHeight, 0]);
        const legendAxis = d3
          .axisRight(legendScale)
          .tickValues(plotUtils.linspace(range[0], range[1], 10))
          .tickFormat((d) => plotUtils.formatLargeNum(+d));

        // add axis to legend plot
        vm.legendGroup
          .append("g")
          .attr("class", "legend axis")
          .attr("transform", `translate(${vm.legendWidth}, 0)`)
          .call(legendAxis);
      } else {
        // categorical attribute => ordinal scale
        const swatchWidth = 12;
        const swatchHeight = 12;
        const newRange = utils.shuffle(vm.filters[vm.encodings["colorVar"]]); // randomly shuffle range
        const n = Math.min(10, newRange.length);

        for (let i = 0; i < n; i++) {
          // get color of i-th value in ordinal scale
          const norm = range.indexOf(newRange[i]) / range.length;
          const h = (norm + 0.618033988749895) % 1; // convert index to [0..1]
          const color = plotUtils.hsv_to_rgb(h, 0.5, 0.85); // rbg hex string

          // create swatch group
          const swatchGroup = vm.legendGroup
            .append("g")
            .classed("legend swatch", true)
            .attr(
              "transform",
              `translate(0, ${(i + 0.5) * (vm.legendHeight / n)})`
            );

          // add i-th value's color swatch
          swatchGroup
            .append("rect")
            .attr("x", () => (i % 2 == 0 ? 0 : 36)) // stagger swatches
            .attr("y", 0)
            .attr("width", swatchWidth)
            .attr("height", swatchHeight)
            .style("fill", color)
            .style("stroke", "black")
            .style("stroke-width", "1px");

          // add i-th value's text
          swatchGroup
            .append("text")
            .attr("dy", () => (i % 2 == 0 ? 24 : 60)) // stagger text
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .html(newRange[i]);

          // add a border to the left of the legend to separate it from the plot
          vm.legendGroup
            .append("g")
            .attr("transform", "translate(-12, -12)")
            .append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", "100%")
            .attr("stroke", "grey")
            .attr("stroke-width", "2")
            .attr("stroke-dasharray", "8");
        }

        // if more than 10 categories exist, add message at the bottom
        if (n < range.length) {
          vm.legendGroup
            .append("g")
            .classed("legend subtitle", true)
            .attr(
              "transform",
              `translate(0, ${vm.legendHeight + vm.legendMargins.bottom - 4})`
            )
            .append("text")
            .html(`(+${range.length - n})`);
        }
      }
    },

    updatePlot(needsDataUpdate, needsLegendUpdate) {
      let vm = this;

      if (vm.items.length == 0) return;

      // remove any text from the marks group area
      vm.marksGroup.select(".no-data-text").remove();
      vm.marksGroup.select(".nothing-selected-text").remove();
      vm.marksGroup.select(".unsupported-text").remove();

      // show/hide the legend
      if (vm.encodings.colorVar) {
        vm.legendGroup.style("display", "block");
      } else {
        vm.legendGroup.style("display", "none");
      }

      // attempt to update the legend
      if (needsLegendUpdate && vm.encodings.colorVar) {
        vm.updateLegend();
      }

      // attempt to update the dataset
      if (needsDataUpdate) {
        // create list of data points
        // can be shallow copy, only filtering list!
        vm.prepared = vm.items.map((dataPoint) => {
          return {
            ...dataPoint,
            __xVar__: !vm.encodings["xVar"]
              ? null
              : dataPoint[vm.encodings["xVar"]],
            __yVar__: !vm.encodings["yVar"]
              ? null
              : dataPoint[vm.encodings["yVar"]],
          };
        });

        // filter raw data into a prepared data set
        for (const [key, value] of Object.entries(vm.attributes)) {
          if (key == vm.encodings["xVar"] || key == vm.encodings["yVar"]) {
            // attribute is being visualized => filter out "false-y" values
            switch (value.dataType) {
              case "string": {
                vm.prepared = vm.prepared.filter((dataPoint) => {
                  return (
                    dataPoint[key] &&
                    vm.filters[key].indexOf(dataPoint[key]) !== -1
                  );
                });
                break;
              }
              case "number": {
                vm.prepared = vm.prepared.filter((dataPoint) => {
                  return (
                    dataPoint[key] &&
                    parseFloat(dataPoint[key]) >=
                      parseFloat(vm.filters[key][0]) &&
                    parseFloat(dataPoint[key]) <= parseFloat(vm.filters[key][1])
                  );
                });
                break;
              }
              case "datetime": {
                vm.prepared = vm.prepared.filter((dataPoint) => {
                  return (
                    dataPoint[key] &&
                    vm.filters[key].indexOf(dataPoint[key]) !== -1
                  );
                });
                break;
              }
            }
          } else {
            // attribute is not being visualized => keep "false-y" values
            switch (value.dataType) {
              case "string": {
                vm.prepared = vm.prepared.filter((dataPoint) => {
                  return (
                    !dataPoint[key] ||
                    vm.filters[key].indexOf(dataPoint[key]) !== -1
                  );
                });
                break;
              }
              case "number": {
                vm.prepared = vm.prepared.filter((dataPoint) => {
                  return (
                    !dataPoint[key] ||
                    (parseFloat(dataPoint[key]) >=
                      parseFloat(vm.filters[key][0]) &&
                      parseFloat(dataPoint[key]) <=
                        parseFloat(vm.filters[key][1]))
                  );
                });
                break;
              }
              case "datetime": {
                vm.prepared = vm.prepared.filter((dataPoint) => {
                  return (
                    !dataPoint[key] ||
                    vm.filters[key].indexOf(dataPoint[key]) !== -1
                  );
                });
                break;
              }
            }
          }
        }
      }

      if (vm.prepared.length == 0 && (vm.encodings.xVar || vm.encodings.yVar)) {
        // no data to render => show message and return
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "no-data-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.noDataMessage);
      }

      // draw encoded plot type
      switch (vm.encodings.plotType) {
        case "Bar Chart": {
          vm.drawBarPlot();
          break;
        }
        case "Dot Plot": {
          vm.drawDotPlot();
          break;
        }
        case "Line Chart": {
          vm.drawLinePlot();
          break;
        }
        case "Scatter Plot": {
          vm.drawScatterPlot();
          break;
        }
        case "Strip Plot": {
          vm.drawStripPlot();
          break;
        }
        default: {
          break;
        }
      }

      // update store
      vm.$root.$data.attributes = vm.attributes;
      vm.$root.$data.encodings = vm.encodings;
      vm.$root.$data.filters = vm.activeFilterAttributes.map((attr) => {
        return { [attr]: vm.filters[attr] };
      });
    },

    drawBarPlot() {
      let vm = this;

      // Create buckets, scales and axes based on xy data types
      let buckets = []; // list of label-value pairs: [[label, value], ...]
      let horizontal = false;
      let xAxisTitle = "";
      let yAxisTitle = "";
      let aggTitle = vm.encodings["axisAggType"]
        ? vm.encodings["axisAggType"].toUpperCase()
        : "COUNT";

      if (!vm.encodings["yVar"]) {
        // yVar is NA => Vertical histogram
        vm.xScale = d3.scaleBand().range([0, vm.plotWidth]).padding(0.1);
        vm.xAxis = d3.axisBottom(vm.xScale);
        if (vm.xVarIs("number")) {
          // [Q x NA] => Vertical binned histogram of count
          const bins = d3.bin().value((d) => d["__xVar__"])(vm.prepared);
          buckets = bins.map((bin) => {
            const lb = plotUtils.formatLargeNum(+bin.x0); // lowerbound
            const ub = plotUtils.formatLargeNum(+bin.x1); // upperbound
            const val = plotUtils.aggregate(bin, "Count", "__xVar__");
            return [`[${lb}, ${ub})`, val, bin];
          });
          vm.xAxis.tickFormat((_, i) => buckets[i][0]);
          xAxisTitle = vm.encodings["xVar"];
          yAxisTitle = `COUNT(${vm.encodings["xVar"]})`;
        } else if (vm.encodings["xVar"]) {
          // [N/O/T x NA] => Vertical histogram of count
          buckets = d3
            .rollups(
              vm.prepared,
              (v) => v.length,
              (d) => d["__xVar__"]
            )
            .sort(function (x, y) {
              return d3.ascending(x[0], y[0]); // sort buckets
            });
          buckets.forEach((d) =>
            d.push(vm.prepared.filter((obj) => obj["__xVar__"] == d[0]))
          );
          vm.xAxis.tickFormat((_, i) => `${buckets[i][0]}`);
          xAxisTitle = vm.encodings["xVar"];
          yAxisTitle = `COUNT(${vm.encodings["xVar"]})`;
        } else {
          // [NA x NA] => display getting started message
          vm.legendGroup.style("display", "none");
          vm.marksGroup
            .append("text")
            .attr("class", "nothing-selected-text")
            .attr(
              "transform",
              `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
            )
            .attr("text-anchor", "middle")
            .html(vm.nothingSelectedMessage);
        }
        vm.xScale.domain(d3.range(buckets.length));
        vm.yScale = d3.scaleLinear().range([vm.plotHeight, 0]);
        vm.yScale.domain([0, d3.max(buckets, (d) => d[1])]).nice();
        vm.yAxis = d3
          .axisLeft(vm.yScale)
          .tickFormat((d) => plotUtils.formatLargeNum(+d));
      } else if (!vm.encodings["xVar"]) {
        // xVar is NA => Horizontal histogram
        horizontal = true;
        vm.yScale = d3.scaleBand().range([0, vm.plotHeight]).padding(0.1);
        vm.yAxis = d3.axisLeft(vm.yScale);
        if (vm.yVarIs("number")) {
          // [NA x Q] => Horizontal binned histogram of count
          const bins = d3.bin().value((d) => d["__yVar__"])(vm.prepared);
          buckets = bins
            .map((bin) => {
              const lb = plotUtils.formatLargeNum(+bin.x0); // lowerbound
              const ub = plotUtils.formatLargeNum(+bin.x1); // upperbound
              const val = plotUtils.aggregate(bin, "Count", "__yVar__");
              return [`[${lb}, ${ub})`, val, bin];
            })
            .reverse(); // sort buckets reverse vertically
          vm.yAxis.tickFormat((_, i) => buckets[i][0]);
          yAxisTitle = vm.encodings["yVar"];
          xAxisTitle = `COUNT(${vm.encodings["yVar"]})`;
        } else if (vm.encodings["yVar"]) {
          // [NA x N/O/T] => Horizontal histogram of count
          buckets = d3
            .rollups(
              vm.prepared,
              (v) => v.length,
              (d) => d["__yVar__"]
            )
            .sort(function (x, y) {
              return d3.ascending(y[0], x[0]); // sort buckets reverse vertically
            });
          buckets.forEach((d) =>
            d.push(vm.prepared.filter((obj) => obj["__yVar__"] == d[0]))
          );
          vm.yAxis.tickFormat((_, i) => `${buckets[i][0]}`);
          yAxisTitle = vm.encodings["yVar"];
          xAxisTitle = `COUNT(${vm.encodings["yVar"]})`;
        } else {
          // [NA x NA] => display getting started message
          vm.legendGroup.style("display", "none");
          vm.marksGroup
            .append("text")
            .attr("class", "nothing-selected-text")
            .attr(
              "transform",
              `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
            )
            .attr("text-anchor", "middle")
            .html(vm.nothingSelectedMessage);
        }
        vm.yScale.domain(d3.range(buckets.length));
        vm.xScale = d3.scaleLinear().range([0, vm.plotWidth]);
        vm.xScale.domain([0, d3.max(buckets, (d) => d[1])]).nice();
        vm.xAxis = d3
          .axisBottom(vm.xScale)
          .tickFormat((d) => plotUtils.formatLargeNum(+d));
      } else {
        // both xVar and yVar are defined
        if (vm.yVarIs("number")) {
          // yVar is Q => vertical bar plot
          vm.xScale = d3.scaleBand().range([0, vm.plotWidth]).padding(0.1);
          vm.xAxis = d3.axisBottom(vm.xScale);
          xAxisTitle = vm.encodings["xVar"];
          yAxisTitle = `${aggTitle}(${vm.encodings["yVar"]})`;
          if (vm.xVarIs("number")) {
            // [Q x Q] => bin x, rollup, aggregate y
            const bins = d3.bin().value((d) => d["__xVar__"])(vm.prepared);
            buckets = bins.map((bin) => {
              const lb = plotUtils.formatLargeNum(+bin.x0); // lowerbound
              const ub = plotUtils.formatLargeNum(+bin.x1); // upperbound
              const val = plotUtils.aggregate(
                bin,
                vm.encodings["axisAggType"],
                "__yVar__"
              );
              return [`[${lb}, ${ub})`, val, bin];
            });
            vm.xAxis.tickFormat((_, i) => buckets[i][0]);
          } else {
            // [N/O/T x Q] => rollup, aggregate
            buckets = d3
              .rollups(
                vm.prepared,
                (v) =>
                  plotUtils.aggregate(
                    v,
                    vm.encodings["axisAggType"],
                    "__yVar__"
                  ),
                (d) => d["__xVar__"]
              )
              .sort(function (x, y) {
                return d3.ascending(x[0], y[0]); // sort buckets
              });
            buckets.forEach((d) =>
              d.push(vm.prepared.filter((obj) => obj["__xVar__"] == d[0]))
            );
            vm.xAxis.tickFormat((i) => `${buckets[i][0]}`);
          }
          vm.xScale.domain(d3.range(buckets.length));
          vm.yScale = d3.scaleLinear().range([vm.plotHeight, 0]);
          vm.yScale.domain([0, d3.max(buckets, (d) => d[1])]).nice();
          vm.yAxis = d3
            .axisLeft(vm.yScale)
            .tickFormat((d) => plotUtils.formatLargeNum(+d));
        } else {
          // yVar is N/O/T => horizontal bar plot
          horizontal = true;
          vm.yScale = d3.scaleBand().range([0, vm.plotHeight]).padding(0.1);
          vm.yAxis = d3.axisLeft(vm.yScale);
          if (vm.xVarIs("number")) {
            // [Q x N/O/T] => rollup, aggregate => horizontal bar plot
            buckets = d3
              .rollups(
                vm.prepared,
                (v) =>
                  plotUtils.aggregate(
                    v,
                    vm.encodings["axisAggType"],
                    "__xVar__"
                  ),
                (d) => d["__yVar__"]
              )
              .sort(function (x, y) {
                return d3.ascending(y[0], x[0]); // sort buckets reverse vertically
              });
            buckets.forEach((d) =>
              d.push(vm.prepared.filter((obj) => obj["__yVar__"] == d[0]))
            );
            vm.yAxis.tickFormat((i) => `${buckets[i][0]}`);
            yAxisTitle = vm.encodings["yVar"];
            xAxisTitle = `${aggTitle}(${vm.encodings["xVar"]})`;
          } else {
            // [N/O/T x N/O/T] => unsupported
            vm.legendGroup.style("display", "none");
            vm.marksGroup
              .append("text")
              .attr("class", "unsupported-text")
              .attr(
                "transform",
                `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
              )
              .attr("text-anchor", "middle")
              .html(vm.unsupportedMessage);
          }
          vm.yScale.domain(d3.range(buckets.length));
          vm.xScale = d3.scaleLinear().range([0, vm.plotWidth]);
          vm.xScale.domain([0, d3.max(buckets, (d) => d[1])]).nice();
          vm.xAxis = d3
            .axisBottom(vm.xScale)
            .tickFormat((d) => plotUtils.formatLargeNum(+d));
        }
      }

      // draw axes
      vm.xAxisGroup.call(vm.xAxis);
      vm.yAxisGroup.call(vm.yAxis);

      // add xAxis title
      vm.xAxisGroup.select(".x.axis.title").remove();
      vm.xAxisGroup
        .append("g")
        .classed("x axis title", true)
        .attr("opacity", 1)
        .attr("transform", `translate(${vm.plotWidth / 2}, 45)`)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .attr("y", "9")
        .text(xAxisTitle);

      // add yAxis title
      vm.yAxisGroup.select(".y.axis.title").remove();
      vm.yAxisGroup
        .append("g")
        .classed("y axis title", true)
        .attr("opacity", 1)
        .attr("transform", `translate(-30, ${vm.plotHeight / 2})`)
        .append("text")
        .attr("fill", "currentColor")
        .attr("y", "9")
        .text(yAxisTitle);

      // prepare data labels for yAxis
      vm.yAxisGroup
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", "1.0em")
        .attr("dy", "-1.0em")
        .attr("transform", "rotate(-90)");

      // stagger every other tick label
      vm.xAxisGroup
        .selectAll(".tick line")
        .attr("y2", (_, i) => (i % 2 == 1 ? 16 : 4));
      vm.xAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "1.75em" : "0.5em"));
      vm.yAxisGroup
        .selectAll(".tick line")
        .attr("x2", (_, i) => (i % 2 == 1 ? -16 : -4));
      vm.yAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "-2.0em" : "-0.75em"));

      // REMOVE all data marks first!
      vm.marksGroup.selectAll(".post").remove();

      // JOIN data selection using bucket label as key
      let dataBound = vm.marksGroup
        .selectAll(".post")
        .data(buckets, (d) => `${d[0]}`);

      // ENTER new group for each bar and text label
      let enterSelection = dataBound.enter().append("g").classed("post", true);

      // ENTER text for all bars
      const offset = 5;
      enterSelection
        .append("text")
        .attr("transform", (d, i) => {
          const x = horizontal
            ? vm.xScale(0) + vm.xScale(d[1]) + offset
            : vm.xScale(i) + vm.xScale.bandwidth() / 2;
          const y = horizontal
            ? vm.yScale(i) + vm.yScale.bandwidth() / 2 + 4
            : vm.yScale(d[1]) - offset;
          return `translate(${x},${y})`;
        })
        .attr("display", "none")
        .style("text-anchor", () => (horizontal ? "start" : "middle"))
        .text((d) => plotUtils.formatLargeNum(+d[1]));

      // ENTER all bars
      enterSelection
        .append("rect")
        .attr("transform", (d, i) => {
          let x, y;
          if (horizontal) {
            x = vm.xScale(0);
            y = vm.yScale(i);
          } else {
            x = vm.xScale(i);
            y = vm.yScale(d[1]);
          }
          return `translate(${x}, ${y})`;
        })
        .attr("height", (d) =>
          horizontal ? vm.yScale.bandwidth() : vm.yScale(0) - vm.yScale(d[1])
        )
        .attr("width", (d) =>
          horizontal ? vm.xScale(d[1]) - vm.xScale(0) : vm.xScale.bandwidth()
        )
        .style("cursor", "pointer")
        .style("fill-opacity", 0.8)
        .style("fill", (d) => {
          // bar charts can only be colored with aggregated number attributes!
          if (vm.encodings["colorVar"]) {
            const binData = d[2];
            const v = plotUtils.aggregate(
              binData,
              vm.encodings["colorAggType"],
              vm.encodings["colorVar"]
            );
            const vMin = vm.attributes[vm.encodings["colorVar"]].range[0];
            const vMax = vm.attributes[vm.encodings["colorVar"]].range[1];
            const norm = (v - vMin) / (vMax - vMin); // [0, 1]
            return d3.interpolateViridis(norm);
          } else {
            return "white";
          }
        })
        .style("stroke", (d) => {
          const binData = d[2];
          const selected = binData.reduce(
            (a, b) => a || vm.selectedDataPoints.indexOf(b["__id__"]) !== -1,
            false
          );
          return selected ? "#1976d2" : "black";
        })
        .style("stroke-width", (d) => {
          const binData = d[2];
          const selected = binData.reduce(
            (a, b) => a || vm.selectedDataPoints.indexOf(b["__id__"]) !== -1,
            false
          );
          return selected ? "3px" : "1px";
        })
        .style("stroke-dasharray", (d) => {
          const binData = d[2];
          const countSelected = binData.filter(
            (o) => vm.selectedDataPoints.indexOf(o["__id__"]) !== -1
          ).length;
          return countSelected < binData.length && countSelected > 0
            ? "3"
            : "none";
        })
        .on("click", function (_, d) {
          const binData = d[2];
          const countSelected = binData.filter(
            (o) => vm.selectedDataPoints.indexOf(o["__id__"]) !== -1
          ).length;
          if (countSelected < binData.length) {
            // group is not fully selected => add all points
            binData.forEach((p) => {
              const index = vm.selectedDataPoints.indexOf(p["__id__"]);
              if (index == -1) {
                vm.selectedDataPoints.push(p["__id__"]);
              }
            });
            d3.select(this)
              .style("stroke", "#1976d2")
              .style("stroke-width", "3px")
              .style("stroke-dasharray", "none");
          } else {
            // group is fully selected => remove all points
            binData.forEach((p) => {
              const index = vm.selectedDataPoints.indexOf(p["__id__"]);
              if (index !== -1) {
                vm.selectedDataPoints.splice(index, 1);
              }
            });
            d3.select(this)
              .style("stroke", "black")
              .style("stroke-width", "1px")
              .style("stroke-dasharray", "none");
          }
          vm.$emit("updateSelectedDataPoints", vm.selectedDataPoints);
        })
        .on("mouseover", function (_, d) {
          const binData = d[2];
          binData.forEach((p) => {
            const index = vm.hoveredDataPoints.indexOf(p["__id__"]);
            if (index == -1) {
              vm.hoveredDataPoints.push(p["__id__"]);
            }
          });
          d3.select(this).style("fill", "#1976d2");
          vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
        })
        .on("mouseout", function (_, d) {
          const binData = d[2];
          binData.forEach((p) => {
            const index = vm.hoveredDataPoints.indexOf(p["__id__"]);
            if (index !== -1) {
              vm.hoveredDataPoints.splice(index, 1);
            }
          });
          if (vm.encodings["colorVar"]) {
            const v = plotUtils.aggregate(
              binData,
              vm.encodings["colorAggType"],
              vm.encodings["colorVar"]
            );
            const vMin = vm.attributes[vm.encodings["colorVar"]].range[0];
            const vMax = vm.attributes[vm.encodings["colorVar"]].range[1];
            const norm = (v - vMin) / (vMax - vMin); // [0, 1]
            d3.select(this).style("fill", d3.interpolateViridis(norm));
          } else {
            d3.select(this).style("fill", "white");
          }
          vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
        });
    },

    drawDotPlot() {
      let vm = this;

      // Create scales and axes based on vis matrix
      let buckets = [];
      let binLabelDelim = " x "; // delimiter for getting axis titles from bin Label

      // initialize x and y scales
      vm.xScale = d3.scaleBand().rangeRound([0, vm.plotWidth]).padding(0.1);
      vm.yScale = d3.scaleBand().rangeRound([vm.plotHeight, 0]).padding(0.1);

      if (vm.xVarIs("NA") && vm.yVarIs("NA")) {
        // [NA x NA] => show help message
        buckets = []; // ensures no points are drawn
        vm.xAxisGroup.selectAll("*").remove();
        vm.yAxisGroup.selectAll("*").remove();
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "nothing-selected-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.nothingSelectedMessage);
      } else if (vm.xVarIs("number") || vm.yVarIs("number")) {
        // [Q x any] OR [any x Q] => unsupported
        buckets = []; // ensures no points are drawn
        vm.xAxisGroup.selectAll("*").remove();
        vm.yAxisGroup.selectAll("*").remove();
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "unsupported-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.unsupportedMessage);
      } else {
        // [N/O/T/NA x N/O/T/NA] => supported
        if (!vm.xVarIs("NA")) {
          // x is N/O/T => horizontal dots
          if (vm.yVarIs("NA")) {
            // [N/O/T x NA] => bucket by x only
            buckets = d3.groups(
              vm.prepared,
              (d) => `${d["__xVar__"]}${binLabelDelim}NA`
            );
          } else {
            // [N/O/T x N/O/T] => bucket by x and y
            buckets = d3.groups(
              vm.prepared,
              (d) => `${d["__xVar__"]}${binLabelDelim}${d["__yVar__"]}`
            );
          }
          vm.xScale.domain(
            vm.attributes[vm.encodings["xVar"]].range.sort(function (x, y) {
              return d3.ascending(x, y); // sort domain
            })
          );
          // add xAxis
          vm.xAxis = d3.axisBottom(vm.xScale);
          vm.xAxisGroup.call(vm.xAxis);
          vm.xAxisGroup.select(".x.axis.title").remove();
          vm.xAxisGroup
            .append("g")
            .classed("x axis title", true)
            .attr("opacity", 1)
            .attr("transform", `translate(${vm.plotWidth / 2}, 45)`)
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .attr("y", "9")
            .text(vm.encodings["xVar"]);
        } else {
          // x is NA => remove x axis (if present)
          vm.xAxisGroup.selectAll("*").remove();
        }
        if (!vm.yVarIs("NA")) {
          // y is N/O/T => vertical dots
          if (vm.xVarIs("NA")) {
            // [NA x N/O/T] => bucket y only
            buckets = d3.groups(
              vm.prepared,
              (d) => `NA${binLabelDelim}${d["__yVar__"]}`
            );
          }
          vm.yScale.domain(
            vm.attributes[vm.encodings["yVar"]].range.sort(function (x, y) {
              return d3.ascending(x, y); // sort domain
            })
          );
          // add yAxis
          vm.yAxis = d3.axisLeft(vm.yScale);
          vm.yAxisGroup.call(vm.yAxis);
          vm.yAxisGroup.select(".y.axis.title").remove();
          vm.yAxisGroup
            .append("g")
            .classed("y axis title", true)
            .attr("opacity", 1)
            .attr("transform", `translate(-30, ${vm.plotHeight / 2})`)
            .append("text")
            .attr("fill", "currentColor")
            .attr("y", "9")
            .text(vm.encodings["yVar"]);
          // prepare data labels for yAxis
          vm.yAxisGroup
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("dx", "1.0em")
            .attr("dy", "-1.0em")
            .attr("transform", "rotate(-90)");
        } else {
          // y is NA => remove y axis (if present)
          vm.yAxisGroup.selectAll("*").remove();
        }
      }

      // stagger every other tick label
      vm.xAxisGroup
        .selectAll(".tick line")
        .attr("y2", (_, i) => (i % 2 == 1 ? 16 : 4));
      vm.xAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "1.75em" : "0.5em"));
      vm.yAxisGroup
        .selectAll(".tick line")
        .attr("x2", (_, i) => (i % 2 == 1 ? -16 : -4));
      vm.yAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "-2.0em" : "-0.75em"));

      // JOIN data selection using bucket label as key
      let dataBound = vm.marksGroup
        .selectAll(".post")
        .data(buckets, (d) => d[0]);

      // DELETE extra dots (fade them out)
      dataBound.exit().remove();

      // ENTER new dots (starting invisible, later fade them in)
      let enterSelection = dataBound.enter().append("g").classed("post", true);

      // UPDATE all existing dots
      enterSelection.append("circle");
      enterSelection
        .merge(dataBound)
        .select("circle")
        .attr("transform", (d) => {
          const x =
            !vm.xVarIs("number") && !vm.xVarIs("NA")
              ? vm.xScale(d[0].split(binLabelDelim)[0]) +
                vm.xScale.bandwidth() / 2 // dist horizontal
              : 0.5 * vm.yScale.bandwidth(); // align left
          const y =
            !vm.yVarIs("number") && !vm.yVarIs("NA")
              ? vm.yScale(d[0].split(binLabelDelim)[1]) +
                vm.yScale.bandwidth() / 2 // dist vertical
              : vm.plotHeight - 0.5 * vm.xScale.bandwidth(); // align bottom
          return `translate(${x}, ${y})`;
        })
        .attr("r", () => {
          // fit the dots within the smallest bandwidth on either axis
          return `
            ${0.25 * Math.min(vm.xScale.bandwidth(), vm.yScale.bandwidth())}px
          `;
        })
        .style("cursor", "pointer")
        .style("fill-opacity", 0.8)
        .style("fill", (d) => {
          // dot plots can only be colored with aggregated number attributes!
          if (vm.encodings["colorVar"]) {
            const binData = d[1];
            const v = plotUtils.aggregate(
              binData,
              vm.encodings["colorAggType"],
              vm.encodings["colorVar"]
            );
            const vMin = vm.attributes[vm.encodings["colorVar"]].range[0];
            const vMax = vm.attributes[vm.encodings["colorVar"]].range[1];
            const norm = (v - vMin) / (vMax - vMin); // [0, 1]
            return d3.interpolateViridis(norm);
          } else {
            return "white";
          }
        })
        .style("stroke", (d) => {
          const binData = d[1];
          const selected = binData.reduce(
            (a, b) => a || vm.selectedDataPoints.indexOf(b["__id__"]) !== -1,
            false
          );
          return selected ? "#1976d2" : "black";
        })
        .style("stroke-width", (d) => {
          const binData = d[1];
          const selected = binData.reduce(
            (a, b) => a || vm.selectedDataPoints.indexOf(b["__id__"]) !== -1,
            false
          );
          return selected ? "3px" : "1px";
        })
        .style("stroke-dasharray", (d) => {
          const binData = d[1];
          const countSelected = binData.filter(
            (o) => vm.selectedDataPoints.indexOf(o["__id__"]) !== -1
          ).length;
          return countSelected < binData.length && countSelected > 0
            ? "3"
            : "none";
        })
        .on("click", function (_, d) {
          const binData = d[1];
          const countSelected = binData.filter(
            (o) => vm.selectedDataPoints.indexOf(o["__id__"]) !== -1
          ).length;
          if (countSelected < binData.length) {
            // group is not fully selected => add all points
            binData.forEach((p) => {
              const index = vm.selectedDataPoints.indexOf(p["__id__"]);
              if (index == -1) {
                vm.selectedDataPoints.push(p["__id__"]);
              }
            });
            d3.select(this)
              .style("stroke", "#1976d2")
              .style("stroke-width", "3px")
              .style("stroke-dasharray", "none");
          } else {
            // group is fully selected => remove all points
            binData.forEach((p) => {
              const index = vm.selectedDataPoints.indexOf(p["__id__"]);
              if (index !== -1) {
                vm.selectedDataPoints.splice(index, 1);
              }
            });
            d3.select(this)
              .style("stroke", "black")
              .style("stroke-width", "1px")
              .style("stroke-dasharray", "none");
          }
          vm.$emit("updateSelectedDataPoints", vm.selectedDataPoints);
        })
        .on("mouseover", function (_, d) {
          const binData = d[1];
          binData.forEach((p) => {
            const index = vm.hoveredDataPoints.indexOf(p["__id__"]);
            if (index == -1) {
              vm.hoveredDataPoints.push(p["__id__"]);
            }
          });
          d3.select(this).style("fill", "#1976d2");
          vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
        })
        .on("mouseout", function (_, d) {
          const binData = d[1];
          binData.forEach((p) => {
            const index = vm.hoveredDataPoints.indexOf(p["__id__"]);
            if (index !== -1) {
              vm.hoveredDataPoints.splice(index, 1);
            }
          });
          if (vm.encodings["colorVar"]) {
            const v = plotUtils.aggregate(
              binData,
              vm.encodings["colorAggType"],
              vm.encodings["colorVar"]
            );
            const vMin = vm.attributes[vm.encodings["colorVar"]].range[0];
            const vMax = vm.attributes[vm.encodings["colorVar"]].range[1];
            const norm = (v - vMin) / (vMax - vMin); // [0, 1]
            d3.select(this).style("fill", d3.interpolateViridis(norm));
          } else {
            d3.select(this).style("fill", "white");
          }
          vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
        });
    },

    drawLinePlot() {
      let vm = this;

      // Create scales and axes if combination is TxQ
      let buckets = [];
      let xAxisTitle = "";
      let yAxisTitle = "";
      let aggTitle = vm.encodings["axisAggType"]
        ? vm.encodings["axisAggType"].toUpperCase()
        : "COUNT";

      if (!vm.encodings["xVar"] && !vm.encodings["yVar"]) {
        // [NA x NA] => display getting started message
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "nothing-selected-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.nothingSelectedMessage);
      } else if (
        vm.xVarIs("datetime") &&
        vm.yVarIs("number") &&
        vm.encodings["axisAggType"]
      ) {
        // [T x Q] => aggregate yVar grouped by xVar
        buckets = d3
          .rollups(
            vm.prepared,
            (v) =>
              plotUtils.aggregate(v, vm.encodings["axisAggType"], "__yVar__"),
            (d) => d["__xVar__"]
          )
          .sort(function (x, y) {
            return d3.ascending(x[0], y[0]); // sort dates
          });
        buckets.forEach((d) =>
          d.push(vm.prepared.filter((obj) => obj["__xVar__"] == d[0]))
        );
        xAxisTitle = vm.encodings["xVar"];
        yAxisTitle = `${aggTitle}(${vm.encodings["yVar"]})`;
      } else if (vm.xVarIs("datetime") && !vm.encodings["yVar"]) {
        // [T x NA] => count values in each xVar as aggregate
        buckets = d3
          .rollups(
            vm.prepared,
            (v) => v.length,
            (d) => d["__xVar__"]
          )
          .sort(function (x, y) {
            return d3.ascending(x[0], y[0]); // sort dates
          });
        buckets.forEach((d) =>
          d.push(vm.prepared.filter((obj) => obj["__xVar__"] == d[0]))
        );
        xAxisTitle = vm.encodings["xVar"];
        yAxisTitle = `COUNT(${vm.encodings["xVar"]})`;
      } else {
        // [N/O/Q x N/O/Q/T] OR [T x N/O/T] => unsupported
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "unsupported-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.unsupportedMessage);
      }

      // set x scale and axis
      vm.xScale = d3
        .scaleBand()
        .domain(buckets.map((d) => d[0]))
        .range([0, vm.plotWidth])
        .padding(0.1);
      vm.xAxis = d3.axisBottom(vm.xScale);

      // Set y scale and axis
      vm.yScale = d3
        .scaleLinear()
        .domain([0, d3.max(buckets, (d) => d[1])])
        .range([vm.plotHeight, 0])
        .nice();
      vm.yAxis = d3
        .axisLeft(vm.yScale)
        .tickFormat((d) => plotUtils.formatLargeNum(+d));

      // draw axes
      vm.xAxisGroup.call(vm.xAxis);
      vm.yAxisGroup.call(vm.yAxis);

      // add xAxis title
      vm.xAxisGroup.select(".x.axis.title").remove();
      vm.xAxisGroup
        .append("g")
        .classed("x axis title", true)
        .attr("opacity", 1)
        .attr("transform", `translate(${vm.plotWidth / 2}, 45)`)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .attr("y", "9")
        .text(xAxisTitle);

      // add yAxis title
      vm.yAxisGroup.select(".y.axis.title").remove();
      vm.yAxisGroup
        .append("g")
        .classed("y axis title", true)
        .attr("opacity", 1)
        .attr("transform", `translate(-30, ${vm.plotHeight / 2})`)
        .append("text")
        .attr("fill", "currentColor")
        .attr("y", "9")
        .text(yAxisTitle);

      // prepare data labels for yAxis
      vm.yAxisGroup
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", "1.0em")
        .attr("dy", "-1.0em")
        .attr("transform", "rotate(-90)");

      // stagger every other tick label
      vm.xAxisGroup
        .selectAll(".tick line")
        .attr("y2", (_, i) => (i % 2 == 1 ? 16 : 4));
      vm.xAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "1.75em" : "0.5em"));
      vm.yAxisGroup
        .selectAll(".tick line")
        .attr("x2", (_, i) => (i % 2 == 1 ? -16 : -4));
      vm.yAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "-2.0em" : "-0.75em"));

      // define line creation function
      let line = d3
        .line()
        .curve(d3.curveCardinal)
        .defined((d) => !isNaN(d[1]))
        .x((d) => vm.xScale(d[0]) + vm.xScale.bandwidth() / 2)
        .y((d) => vm.yScale(d[1]));

      // (re-)draw static path connecting line chart points
      vm.marksGroup.select(".connect-line").datum(buckets).attr("d", line);

      // JOIN data selection using bucket label as key
      let dataBound = vm.marksGroup
        .selectAll(".post")
        .data(buckets, (d) => d[0]);

      // DELETE extra points
      dataBound.exit().remove();

      // ENTER new points
      let enterSelection = dataBound.enter().append("g").classed("post", true);

      // UPDATE all existing points
      enterSelection.append("circle");
      enterSelection
        .merge(dataBound)
        .select("circle")
        .attr("transform", (d) => {
          const x = vm.xScale;
          const y = vm.yScale;
          d["x"] = x(d[0]) + x.bandwidth() / 2;
          d["y"] = y(d[1]);
          return `translate(${d["x"]}, ${d["y"]})`;
        })
        .attr("r", () => {
          // make the radius a function of the bandwidth for all data, to ensure filter does not change radius
          let fullBandwidth =
            vm.plotWidth / vm.attributes[vm.encodings["xVar"]].range.length;
          return `${4 + fullBandwidth / 8}px`;
        })
        .style("cursor", "pointer")
        .style("fill-opacity", 0.8)
        .style("fill", (d) => {
          // line charts can only be colored with aggregated number attributes!
          if (vm.encodings["colorVar"]) {
            const binData = d[2];
            const v = plotUtils.aggregate(
              binData,
              vm.encodings["colorAggType"],
              vm.encodings["colorVar"]
            );
            const vMin = vm.attributes[vm.encodings["colorVar"]].range[0];
            const vMax = vm.attributes[vm.encodings["colorVar"]].range[1];
            const norm = (v - vMin) / (vMax - vMin); // [0, 1]
            return d3.interpolateViridis(norm);
          } else {
            return "white";
          }
        })
        .style("stroke", (d) => {
          const binData = d[2];
          const selected = binData.reduce(
            (a, b) => a || vm.selectedDataPoints.indexOf(b["__id__"]) !== -1,
            false
          );
          return selected ? "#1976d2" : "black";
        })
        .style("stroke-width", (d) => {
          const binData = d[2];
          const selected = binData.reduce(
            (a, b) => a || vm.selectedDataPoints.indexOf(b["__id__"]) !== -1,
            false
          );
          return selected ? "3px" : "1px";
        })
        .style("stroke-dasharray", (d) => {
          const binData = d[2];
          const countSelected = binData.filter(
            (o) => vm.selectedDataPoints.indexOf(o["__id__"]) !== -1
          ).length;
          return countSelected < binData.length && countSelected > 0
            ? "3"
            : "none";
        })
        .on("click", function (_, d) {
          const binData = d[2];
          const countSelected = binData.filter(
            (o) => vm.selectedDataPoints.indexOf(o["__id__"]) !== -1
          ).length;
          if (countSelected < binData.length) {
            // group is not fully selected => add all points
            binData.forEach((p) => {
              const index = vm.selectedDataPoints.indexOf(p["__id__"]);
              if (index == -1) {
                vm.selectedDataPoints.push(p["__id__"]);
              }
            });
            d3.select(this)
              .style("stroke", "#1976d2")
              .style("stroke-width", "3px")
              .style("stroke-dasharray", "none");
          } else {
            // group is fully selected => remove all points
            binData.forEach((p) => {
              const index = vm.selectedDataPoints.indexOf(p["__id__"]);
              if (index !== -1) {
                vm.selectedDataPoints.splice(index, 1);
              }
            });
            d3.select(this)
              .style("stroke", "black")
              .style("stroke-width", "1px")
              .style("stroke-dasharray", "none");
          }
          vm.$emit("updateSelectedDataPoints", vm.selectedDataPoints);
        })
        .on("mouseover", function (_, d) {
          const binData = d[2];
          binData.forEach((p) => {
            const index = vm.hoveredDataPoints.indexOf(p["__id__"]);
            if (index == -1) {
              vm.hoveredDataPoints.push(p["__id__"]);
            }
          });
          d3.select(this).style("fill", "#1976d2");
          vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
        })
        .on("mouseout", function (_, d) {
          const binData = d[2];
          binData.forEach((p) => {
            const index = vm.hoveredDataPoints.indexOf(p["__id__"]);
            if (index !== -1) {
              vm.hoveredDataPoints.splice(index, 1);
            }
          });
          if (vm.encodings["colorVar"]) {
            const v = plotUtils.aggregate(
              binData,
              vm.encodings["colorAggType"],
              vm.encodings["colorVar"]
            );
            const vMin = vm.attributes[vm.encodings["colorVar"]].range[0];
            const vMax = vm.attributes[vm.encodings["colorVar"]].range[1];
            const norm = (v - vMin) / (vMax - vMin); // [0, 1]
            d3.select(this).style("fill", d3.interpolateViridis(norm));
          } else {
            d3.select(this).style("fill", "white");
          }
          vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
        });

      // add event listeners to the line group based on modified buckets
      const marksGroupNode = vm.marksGroup.node();
      const offset = marksGroupNode.getBoundingClientRect().left;
      const pointsX = buckets.map((d) => d["x"]); // values are always sorted asc
      vm.marksGroup
        .on("mouseenter", (event) => {
          // only show the intersect line if there's data to display
          if (buckets.length) {
            const x = plotUtils.snapToX(pointsX, event.clientX - offset);
            d3.select(".intersect-line")
              .attr("transform", `translate(${x},0)`)
              .style("display", "block");
          }
        })
        .on("mousemove", (event) => {
          // only move the intersect line if there's data to display
          if (buckets.length) {
            const x = plotUtils.snapToX(pointsX, event.clientX - offset);
            d3.select(".intersect-line").attr("transform", `translate(${x},0)`);
          }
        })
        .on("mouseleave", () => {
          d3.select(".intersect-line").style("display", "none");
        });
    },

    drawScatterPlot() {
      let vm = this;

      // Create scales and axes based on vis matrix
      let xAxisTitle = "";
      let yAxisTitle = "";

      if (vm.xVarIs("NA") && vm.yVarIs("NA")) {
        // [NA x NA] => display help message
        vm.prepared = [];
        vm.xScale = d3.scaleLinear().domain([]).range([0, vm.plotWidth]);
        vm.yScale = d3.scaleLinear().domain([]).range([vm.plotHeight, 0]);
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "nothing-selected-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.nothingSelectedMessage);
      } else if (
        (!vm.xVarIs("number") && !vm.yVarIs("number")) ||
        vm.xVarIs("NA") ||
        vm.yVarIs("NA")
      ) {
        // [N/O/T x N/O/T] OR [N/O/T/Q x NA] OR [NA x N/O/T/Q] => unsupported
        vm.prepared = [];
        vm.xScale = d3.scaleLinear().domain([]).range([0, vm.plotWidth]);
        vm.yScale = d3.scaleLinear().domain([]).range([vm.plotHeight, 0]);
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "unsupported-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.unsupportedMessage);
      } else {
        // both x and y are defined => set axis titles and display legend
        xAxisTitle = vm.encodings["xVar"];
        yAxisTitle = vm.encodings["yVar"];
        if (vm.xVarIs("number")) {
          // x is Q => scale linear
          vm.xScale = d3
            .scaleLinear()
            .domain(vm.attributes[vm.encodings["xVar"]].range.slice(0, 2))
            .range([0, vm.plotWidth]);
        } else {
          // x is N/O/T => scale ordinal
          vm.xScale = d3
            .scaleBand()
            .domain(
              vm.attributes[vm.encodings["xVar"]].range.sort(function (x, y) {
                return d3.ascending(x, y); // sort domain
              })
            )
            .rangeRound([0, vm.plotWidth])
            .padding(0.1);
        }
        if (vm.yVarIs("number")) {
          // y is Q => scale linear
          vm.yScale = d3
            .scaleLinear()
            .domain(vm.attributes[vm.encodings["yVar"]].range.slice(0, 2))
            .range([vm.plotHeight, 0]);
        } else {
          // y is N/O/T => scale ordinal
          vm.yScale = d3
            .scaleBand()
            .domain(
              vm.attributes[vm.encodings["yVar"]].range.sort(function (x, y) {
                return d3.ascending(x, y); // sort domain
              })
            )
            .rangeRound([vm.plotHeight, 0])
            .padding(0.1);
        }
      }

      // set x axis
      vm.xAxis = d3
        .axisBottom(vm.xScale)
        .tickFormat((d) =>
          d
            ? vm.xVarIs("number")
              ? plotUtils.formatLargeNum(+d)
              : d
            : "(unknown)"
        );

      // set y axis
      vm.yAxis = d3
        .axisLeft(vm.yScale)
        .tickFormat((d) =>
          d
            ? vm.yVarIs("number")
              ? plotUtils.formatLargeNum(+d)
              : d
            : "(unknown)"
        );

      // draw axes
      vm.xAxisGroup.call(vm.xAxis);
      vm.yAxisGroup.call(vm.yAxis);

      // add xAxis title
      vm.xAxisGroup.select(".x.axis.title").remove();
      vm.xAxisGroup
        .append("g")
        .classed("x axis title", true)
        .attr("opacity", 1)
        .attr("transform", `translate(${vm.plotWidth / 2}, 45)`)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .attr("y", "9")
        .text(xAxisTitle);

      // add yAxis title
      vm.yAxisGroup.select(".y.axis.title").remove();
      vm.yAxisGroup
        .append("g")
        .classed("y axis title", true)
        .attr("opacity", 1)
        .attr("transform", `translate(-30, ${vm.plotHeight / 2})`)
        .append("text")
        .attr("fill", "currentColor")
        .attr("y", "9")
        .text(yAxisTitle);

      // prepare data labels for yAxis
      vm.yAxisGroup
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", "1.0em")
        .attr("dy", "-1.0em")
        .attr("transform", "rotate(-90)");

      // stagger every other tick label
      vm.xAxisGroup
        .selectAll(".tick line")
        .attr("y2", (_, i) => (i % 2 == 1 ? 16 : 4));
      vm.xAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "1.75em" : "0.5em"));
      vm.yAxisGroup
        .selectAll(".tick line")
        .attr("x2", (_, i) => (i % 2 == 1 ? -16 : -4));
      vm.yAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "-2.0em" : "-0.75em"));

      // JOIN data selection using Primary Key label
      let dataBound = vm.marksGroup.selectAll(".post").data(vm.prepared);

      // DELETE extra points
      dataBound.exit().remove();

      // ENTER new points (starting invisible, later fade them in)
      let enterSelection = dataBound.enter().append("g").classed("post", true);

      // UPDATE all existing points
      enterSelection.append("circle");
      enterSelection
        .merge(dataBound)
        .select("circle")
        .attr("transform", (d) =>
          plotUtils.translatePoints(
            false, // don't jitter
            d["__id__"],
            d["__xVar__"],
            d["__yVar__"],
            vm.xVarIs("number"),
            vm.yVarIs("number"),
            vm.xScale,
            vm.yScale,
            vm.plotWidth,
            vm.plotHeight
          )
        )
        .attr("r", 6)
        .style("cursor", "pointer")
        .style("fill-opacity", 0.8)
        .style("fill", (d) => {
          // scatter plots can be colored by any attribute!
          if (vm.encodings["colorVar"]) {
            const v = d[vm.encodings["colorVar"]];
            const range = vm.attributes[vm.encodings["colorVar"]].range;
            if (vm.attributes[vm.encodings["colorVar"]].dataType == "number") {
              // numerical attribute => sequential scale
              const vMin = range[0];
              const vMax = range[1];
              const norm = (v - vMin) / (vMax - vMin); // [0, 1]
              return d3.interpolateViridis(norm); // rbg hex string
            } else {
              // categorical attribute => ordinal scale
              const norm = range.indexOf(v) / range.length;
              const h = (norm + 0.618033988749895) % 1; // convert index to [0..1]
              return plotUtils.hsv_to_rgb(h, 0.5, 0.85); // rbg hex string
            }
          } else {
            return "white";
          }
        })
        .style("stroke-width", (d) => {
          const selected = vm.selectedDataPoints.indexOf(d["__id__"]) !== -1;
          return selected ? "3px" : "1px";
        })
        .style("stroke", (d) => {
          const selected = vm.selectedDataPoints.indexOf(d["__id__"]) !== -1;
          return selected ? "#2196f3" : "black";
        })
        .on("click", function (_, d) {
          const index = vm.selectedDataPoints.indexOf(d["__id__"]);
          if (index == -1) {
            vm.selectedDataPoints.push(d["__id__"]);
            d3.select(this)
              .style("stroke", "#2196f3")
              .style("stroke-width", "3px");
          } else {
            vm.selectedDataPoints.splice(index, 1);
            d3.select(this)
              .style("stroke", "black")
              .style("stroke-width", "1px");
          }
          vm.$emit("updateSelectedDataPoints", vm.selectedDataPoints);
        })
        .on("mouseover", function (_, d) {
          d3.select(this).style("fill", "#1976d2");
          const index = vm.hoveredDataPoints.indexOf(d["__id__"]);
          if (index == -1) {
            vm.hoveredDataPoints.push(d["__id__"]);
            vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
          }
        })
        .on("mouseout", function (_, d) {
          if (vm.encodings["colorVar"]) {
            const v = d[vm.encodings["colorVar"]];
            const range = vm.attributes[vm.encodings["colorVar"]].range;
            if (vm.attributes[vm.encodings["colorVar"]].dataType == "number") {
              // numerical attribute => sequential scale
              const vMin = range[0];
              const vMax = range[1];
              const norm = (v - vMin) / (vMax - vMin); // [0, 1]
              d3.select(this).style("fill", d3.interpolateViridis(norm));
            } else {
              // categorical attribute => ordinal scale
              const norm = range.indexOf(v) / range.length;
              const h = (norm + 0.618033988749895) % 1; // convert index to [0..1]
              d3.select(this).style("fill", plotUtils.hsv_to_rgb(h, 0.5, 0.85));
            }
          } else {
            d3.select(this).style("fill", "white");
          }
          const index = vm.hoveredDataPoints.indexOf(d["__id__"]);
          if (index !== -1) {
            vm.hoveredDataPoints.splice(index, 1);
            vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
          }
        });
    },

    drawStripPlot() {
      let vm = this;

      // Create scales and axes based on vis matrix
      let yAxisMajor = false;
      let xAxisCategorical = false;
      let yAxisCategorical = false;

      if (vm.xVarIs("NA") && vm.yVarIs("NA")) {
        // [NA x NA] => display help message
        vm.prepared = []; // ensures no points are drawn
        vm.xAxisGroup.selectAll("*").remove();
        vm.yAxisGroup.selectAll("*").remove();
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "nothing-selected-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.nothingSelectedMessage);
      } else if (vm.xVarIs("number") && vm.yVarIs("number")) {
        // [Q x Q] => unsupported, remove x axis as well
        vm.prepared = []; // ensures no points are drawn
        vm.xAxisGroup.selectAll("*").remove();
        vm.yAxisGroup.selectAll("*").remove();
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "unsupported-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.unsupportedMessage);
      } else if (vm.xVarIs("number")) {
        // x is Q => vertical strips
        vm.yAxisGroup.selectAll("*").remove();
        vm.xScale = d3.scaleLinear().range([0, vm.plotWidth]);
        if (!vm.yVarIs("number") && vm.encodings["yVar"]) {
          // [Q x N/O/T] => vertical strips with categorical y axis
          yAxisCategorical = true;
          vm.yScale = d3
            .scaleBand()
            .domain(
              vm.attributes[vm.encodings["yVar"]].range.sort(function (x, y) {
                return d3.ascending(x, y); // sort domain
              })
            )
            .rangeRound([vm.plotHeight, 0])
            .padding(0.1);
          // add yAxis
          vm.yAxis = d3.axisLeft(vm.yScale);
          vm.yAxisGroup.call(vm.yAxis);
          vm.yAxisGroup.select(".y.axis.title").remove();
          vm.yAxisGroup
            .append("g")
            .classed("y axis title", true)
            .attr("opacity", 1)
            .attr("transform", `translate(-30, ${vm.plotHeight / 2})`)
            .append("text")
            .attr("fill", "currentColor")
            .attr("y", "9")
            .text(vm.encodings["yVar"]);
          vm.yAxisGroup
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("dx", "1.0em")
            .attr("dy", "-1.0em")
            .attr("transform", "rotate(-90)");
        }
        vm.xScale.domain(vm.attributes[vm.encodings["xVar"]].range.slice(0, 2));
        // add xAxis
        vm.xAxis = d3
          .axisBottom(vm.xScale)
          .tickFormat((d) => plotUtils.formatLargeNum(+d));
        vm.xAxisGroup.call(vm.xAxis);
        vm.xAxisGroup.select(".x.axis.title").remove();
        vm.xAxisGroup
          .append("g")
          .classed("x axis title", true)
          .attr("opacity", 1)
          .attr("transform", `translate(${vm.plotWidth / 2}, 45)`)
          .append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "currentColor")
          .attr("y", "9")
          .text(vm.encodings["xVar"]);
      } else if (vm.yVarIs("number")) {
        // y is Q => horizontal strips
        yAxisMajor = true;
        vm.xAxisGroup.selectAll("*").remove();
        vm.yScale = d3.scaleLinear().range([vm.plotHeight, 0]);
        if (!vm.xVarIs("number") && vm.encodings["xVar"]) {
          // [N/O/T x Q] => horizontal strips with categorical x axis
          xAxisCategorical = true;
          vm.xScale = d3
            .scaleBand()
            .domain(
              vm.attributes[vm.encodings["xVar"]].range.sort(function (x, y) {
                return d3.ascending(x, y); // sort domain
              })
            )
            .rangeRound([0, vm.plotWidth])
            .padding(0.1);
          vm.xAxis = d3.axisBottom(vm.xScale);
          vm.xAxisGroup.call(vm.xAxis);
          vm.xAxisGroup.select(".x.axis.title").remove();
          vm.xAxisGroup
            .append("g")
            .classed("x axis title", true)
            .attr("opacity", 1)
            .attr("transform", `translate(${vm.plotWidth / 2}, 45)`)
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .attr("y", "9")
            .text(vm.encodings["xVar"]);
        }
        vm.yScale.domain(vm.attributes[vm.encodings["yVar"]].range.slice(0, 2));
        // add yAxis
        vm.yAxis = d3
          .axisLeft(vm.yScale)
          .tickFormat((d) => plotUtils.formatLargeNum(+d));
        vm.yAxisGroup.call(vm.yAxis);
        vm.yAxisGroup.select(".y.axis.title").remove();
        vm.yAxisGroup
          .append("g")
          .classed("y axis title", true)
          .attr("opacity", 1)
          .attr("transform", `translate(-30, ${vm.plotHeight / 2})`)
          .append("text")
          .attr("fill", "currentColor")
          .attr("y", "9")
          .text(vm.encodings["yVar"]);
        vm.yAxisGroup
          .selectAll("text")
          .style("text-anchor", "middle")
          .attr("dx", "1.0em")
          .attr("dy", "-1.0em")
          .attr("transform", "rotate(-90)");
      } else {
        // [N/T/O x NA] OR [NA x N/T/O] OR [N/T/O/Q x N/T/O/Q] => unsupported
        vm.prepared = []; // ensures no points are drawn
        vm.xAxisGroup.selectAll("*").remove();
        vm.yAxisGroup.selectAll("*").remove();
        vm.legendGroup.style("display", "none");
        vm.marksGroup
          .append("text")
          .attr("class", "unsupported-text")
          .attr(
            "transform",
            `translate(${vm.plotWidth / 2},${vm.plotHeight / 2})`
          )
          .attr("text-anchor", "middle")
          .html(vm.unsupportedMessage);
      }

      // draw gridlines along the major axis
      if (yAxisMajor && vm.prepared.length) {
        // y axis gridlines => remove existing and re-draw
        vm.yAxisGroup.selectAll(".gridline").remove();
        let linesBound = vm.yAxisGroup
          .selectAll(".gridline")
          .data(vm.yScale.ticks());
        let enterLines = linesBound
          .enter()
          .append("g")
          .classed("gridline", true)
          .attr("opacity", 0.15)
          .attr("transform", (d) => `translate(0,${vm.yScale(d)})`);
        enterLines.append("line");
        enterLines
          .merge(linesBound)
          .select("line")
          .attr("x2", () =>
            xAxisCategorical ? vm.plotWidth : 0.1 * vm.plotWidth
          )
          .attr("stroke", "currentColor");
      } else if (vm.prepared.length) {
        // x axis gridlines => remove existing and re-draw
        vm.xAxisGroup.selectAll(".gridline").remove();
        let linesBound = vm.xAxisGroup
          .selectAll(".gridline")
          .data(vm.xScale.ticks());
        let enterLines = linesBound
          .enter()
          .append("g")
          .classed("gridline", true)
          .attr("opacity", 0.15)
          .attr("transform", (d) => `translate(${vm.xScale(d)},0)`);
        enterLines.append("line");
        enterLines
          .merge(linesBound)
          .select("line")
          .attr("y2", () =>
            yAxisCategorical ? -vm.plotHeight : -0.1 * vm.plotHeight
          )
          .attr("stroke", "currentColor");
      }

      // stagger every other tick label
      vm.xAxisGroup
        .selectAll(".tick line")
        .attr("y2", (_, i) => (i % 2 == 1 ? 16 : 4));
      vm.xAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "1.75em" : "0.5em"));
      vm.yAxisGroup
        .selectAll(".tick line")
        .attr("x2", (_, i) => (i % 2 == 1 ? -16 : -4));
      vm.yAxisGroup
        .selectAll(".tick text")
        .attr("dy", (_, i) => (i % 2 == 1 ? "-2.0em" : "-0.75em"));

      // JOIN data selection using Primary Key label
      let dataBound = vm.marksGroup.selectAll(".post").data(vm.prepared);

      // DELETE extra strips (fade them out)
      dataBound.exit().remove();

      // ENTER new strips (starting invisible, later fade them in)
      let enterSelection = dataBound.enter().append("g").classed("post", true);

      // UPDATE all existing strips
      enterSelection.append("line");
      enterSelection
        .merge(dataBound)
        .select("line")
        .attr("x1", (d) => {
          const x = vm.xScale;
          return yAxisMajor
            ? xAxisCategorical
              ? x(d["__xVar__"]) + x.bandwidth() / 2 - 0.025 * vm.plotWidth
              : 0.025 * vm.plotWidth // 25% of gridline
            : x(d["__xVar__"]);
        })
        .attr("x2", (d) => {
          const x = vm.xScale;
          return yAxisMajor
            ? xAxisCategorical
              ? x(d["__xVar__"]) + x.bandwidth() / 2 + 0.025 * vm.plotWidth
              : 0.075 * vm.plotWidth // 75% of gridline
            : x(d["__xVar__"]);
        })
        .attr("y1", (d) => {
          const y = vm.yScale;
          return !yAxisMajor
            ? yAxisCategorical
              ? y(d["__yVar__"]) + y.bandwidth() / 2 - 0.025 * vm.plotHeight
              : 0.925 * vm.plotHeight // 25% of gridline
            : y(d["__yVar__"]);
        })
        .attr("y2", (d) => {
          const y = vm.yScale;
          return !yAxisMajor
            ? yAxisCategorical
              ? y(d["__yVar__"]) + y.bandwidth() / 2 + 0.025 * vm.plotHeight
              : 0.975 * vm.plotHeight // 75% of gridline
            : y(d["__yVar__"]);
        })
        .style("cursor", "pointer")
        .style("stroke-width", (d) => {
          const selected = vm.selectedDataPoints.indexOf(d["__id__"]) !== -1;
          return selected ? "2px" : "1px";
        })
        .style("stroke", (d) => {
          const selected = vm.selectedDataPoints.indexOf(d["__id__"]) !== -1;
          if (selected) {
            return "#2196f3";
          } else {
            // strip plots can be colored by any attribute!
            if (vm.encodings["colorVar"]) {
              const v = d[vm.encodings["colorVar"]];
              const range = vm.attributes[vm.encodings["colorVar"]].range;
              if (
                vm.attributes[vm.encodings["colorVar"]].dataType == "number"
              ) {
                // numerical attribute => sequential scale
                const vMin = range[0];
                const vMax = range[1];
                const norm = (v - vMin) / (vMax - vMin); // [0, 1]
                return d3.interpolateViridis(norm); // rbg hex string
              } else {
                // categorical attribute => ordinal scale
                const norm = range.indexOf(v) / range.length;
                const h = (norm + 0.618033988749895) % 1; // convert index to [0..1]
                return plotUtils.hsv_to_rgb(h, 0.5, 0.85); // rbg hex string
              }
            } else {
              return "black";
            }
          }
        })
        .on("click", function (_, d) {
          const index = vm.selectedDataPoints.indexOf(d["__id__"]);
          if (index == -1) {
            vm.selectedDataPoints.push(d["__id__"]);
            d3.select(this)
              .style("stroke", "#2196f3")
              .style("stroke-width", "2px");
          } else {
            vm.selectedDataPoints.splice(index, 1);
            if (vm.encodings["colorVar"]) {
              const v = d[vm.encodings["colorVar"]];
              const range = vm.attributes[vm.encodings["colorVar"]].range;
              if (
                vm.attributes[vm.encodings["colorVar"]].dataType == "number"
              ) {
                // numerical attribute => sequential scale
                const vMin = range[0];
                const vMax = range[1];
                const norm = (v - vMin) / (vMax - vMin); // [0, 1]
                d3.select(this)
                  .style("stroke", d3.interpolateViridis(norm))
                  .style("stroke-width", "1px");
              } else {
                // categorical attribute => ordinal scale
                const norm = range.indexOf(v) / range.length;
                const h = (norm + 0.618033988749895) % 1; // convert index to [0..1]
                d3.select(this)
                  .style("stroke", plotUtils.hsv_to_rgb(h, 0.5, 0.85))
                  .style("stroke-width", "1px");
              }
            } else {
              d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "1px");
            }
          }
          vm.$emit("updateSelectedDataPoints", vm.selectedDataPoints);
        })
        .on("mouseover", function (_, d) {
          d3.select(this).style("stroke", "#1976d2");
          const index = vm.hoveredDataPoints.indexOf(d["__id__"]);
          if (index == -1) {
            vm.hoveredDataPoints.push(d["__id__"]);
            vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
          }
        })
        .on("mouseout", function (_, d) {
          const selected = vm.selectedDataPoints.indexOf(d["__id__"]) !== -1;
          if (selected) {
            d3.select(this)
              .style("stroke", "#2196f3")
              .style("stroke-width", "2px");
          } else {
            if (vm.encodings["colorVar"]) {
              const v = d[vm.encodings["colorVar"]];
              const range = vm.attributes[vm.encodings["colorVar"]].range;
              if (
                vm.attributes[vm.encodings["colorVar"]].dataType == "number"
              ) {
                // numerical attribute => sequential scale
                const vMin = range[0];
                const vMax = range[1];
                const norm = (v - vMin) / (vMax - vMin); // [0, 1]
                d3.select(this)
                  .style("stroke", d3.interpolateViridis(norm))
                  .style("stroke-width", "1px");
              } else {
                // categorical attribute => ordinal scale
                const norm = range.indexOf(v) / range.length;
                const h = (norm + 0.618033988749895) % 1; // convert index to [0..1]
                d3.select(this)
                  .style("stroke", plotUtils.hsv_to_rgb(h, 0.5, 0.85))
                  .style("stroke-width", "1px");
              }
            } else {
              d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "1px");
            }
          }
          const index = vm.hoveredDataPoints.indexOf(d["__id__"]);
          if (index !== -1) {
            vm.hoveredDataPoints.splice(index, 1);
            vm.$emit("updateHoveredDataPoints", vm.hoveredDataPoints);
          }
        });
    },
  },
};
</script>

<style>
.x.axis .tick text,
.y.axis .tick text {
  font-size: 10px;
}

.x.axis.title text,
.y.axis.title text {
  font-size: 18px;
  font-weight: 800 !important;
}

.legend.swatch text {
  font-size: 10px;
}

.legend.subtitle text {
  font-size: 14px;
  font-weight: 800 !important;
}
</style>
