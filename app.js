var express    = require('express')
  , app        = express()
  , server     = require('./server')
  , reqHandle  = require('./request')
  , fakeData   = require('./fakeData')

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res){
	console.log("Service!");
	reqHandle.start(req,res);
});

app.get('/data',function(req,res){
	console.log('running');
	var data = JSON.stringify(fakeData.generate(25,25));
	res.send(data);
})

server.start(app);