var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 2222));

app.use(express.static(__dirname + '/public'));

app.get('*', function(request, response) {
  response.sendfile('index.html');
});

app.listen(app.get('port'), function() {
  console.log('Running on port:', app.get('port'));
});
