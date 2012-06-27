var express = require('express');

var app = express.createServer(express.logger());
var uuid = require('node-uuid');

app.use(express.bodyParser());

var pushTask = function(req, res){
  var id = req.param("id", uuid.v1());
  console.info({ type: "request", identifier: id, query: req.query, body: req.body});

  var taskReq = require('request'),
   username = "username",
   password = "password",
   auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
   url = "http://checkvist.com/checklists/checklist_id/tasks.json";

  req.param("message").split("\n").forEach(function(taskContent) {
    taskReq.post(
      {
    	  headers : { 'Authorization': auth },
        url: url,
        body: "task[content]=" + taskContent
      },
      function(error, response, body) {  
        if (error) {
          // This indicates a transport error rather than an error response from checkvist
          console.error({ type: "response", identifier: id, error: error});
          res.send("", 500);
        } else {
          // Always send an empty response, since we don't want to pay for a return message
          console.info({ type: "response", identifier: id, body: body});
          // Pass checkvist response code back to the caller, so they can retry if necessary
          res.send("", response.statusCode);
        }
      }
    );
  });
};

app.get('/tasks/', pushTask);
app.post('/tasks/', pushTask);

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});