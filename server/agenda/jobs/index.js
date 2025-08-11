// This file imports and registers all jobs
module.exports = function (agenda) {
    require("./emailJob")(agenda);
    require("./cleanupJob")(agenda);
    require("./reportJob")(agenda);
  };
  