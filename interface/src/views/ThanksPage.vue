<template>
  <v-container fluid class="pa-6 view-container">
    <!-- CONTENT -->
    <v-row>
      <v-col cols="12">
        <p>Thank you for doing our study!</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  mounted: function () {
    this.$root.$data.session["thanks"].record.complete();
    this.download(
      JSON.stringify(this.$root.$data.session),
      `session_log_${this.$root.$data.session.pid}.json`,
      "text/plain"
    );
  },

  methods: {
    download(strData, strFileName, strMimeType) {
      var D = document,
        A = arguments,
        a = D.createElement("a"),
        n = A[1];

      //build download link:
      a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);

      if ("download" in a) {
        //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function () {
          var e = D.createEvent("MouseEvents");
          e.initMouseEvent(
            "click",
            true,
            false,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
          );
          a.dispatchEvent(e);
          D.body.removeChild(a);
        }, 66);
        return true;
      } /* end if('download' in a) */

      //do iframe dataURL download: (older W3)
      var f = D.createElement("iframe");
      D.body.appendChild(f);
      f.src =
        "data:" +
        (A[2] ? A[2] : "application/octet-stream") +
        (window.btoa ? ";base64" : "") +
        "," +
        (window.btoa ? window.btoa : escape)(strData);
      setTimeout(function () {
        D.body.removeChild(f);
      }, 333);
      return true;
    },
  },
};
</script>

<style></style>
