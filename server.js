var port = 4444

  , start = function(app){
      app.listen(port);
      console.log("Started listening to " + port);
    };

exports.start = start;