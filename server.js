var express = require('express');
var app = express();
var request = require('request');
var redis = require('redis');
var client = redis.createClient();
var crypto = require('crypto');
var config = require('./config.js')
// Add headers



app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', '*');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'token');

    next();
});



app.get('/', function (req, res) {
  res.send('Hello World!');
});


app.get('/getToken', function (req, res) {

  var options = { method: 'POST',
  url: 'https://github.com/login/oauth/access_token',
  headers:
   {
     'content-type': 'application/x-www-form-urlencoded',
     'accept' : 'application/json' },
  form:
   { client_id: '81e6dc85d40f05e4c2f7',
     client_secret: config.client_secret,
     code: req.query.code } };

  request(options, function (error, response, body) {

    if (error) throw new Error(error);
    var access_token=JSON.parse(body).access_token;
    console.log('adas');


    var options2 = { method: 'GET',
    url: 'https://api.github.com/user?access_token='+access_token,
    headers:
     {
       'content-type': 'application/x-www-form-urlencoded',
       'accept' : 'application/json',
       'user-agent':'Github Login'
      },
     };
    request(options2, function (error, response, body) {
      console.log(body);
        if (!error && response.statusCode == 200) {
          console.log('asdasdasdas');
          var token = crypto.randomBytes(64).toString('hex');
          client.set(token,JSON.parse(body).login,function(err,data){
            client.set(JSON.parse(body).login, access_token,function(err,data){
                res.send(token);
            });
          })
        }
      });
    });
});





app.get('/activity', function (req, res) {
  console.log(req.headers.token);
  token=req.headers.token;
  var access_token='';
  var user='';
  if(req.headers.token)
  {
    client.get(token,function(err,data){
      user=data;
      client.get(data,function(err,token){
          access_token=token;
          try {
            var options2 = { method: 'GET',
            url: 'https://api.github.com/users/'+user+'/events?access_token='+access_token+'&page='+req.query.page,
            headers:
             {

               'accept' : 'application/json',
               'user-agent':'Github Login'
              },
             };
            request(options2, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  res.send(body);
                }
              });


          } catch (e) {
            console.log(e);
          res.send('Error Processing data');
          }
      });
    })

  }

});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
