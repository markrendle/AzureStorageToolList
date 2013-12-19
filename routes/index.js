var fs = require('fs'),
    async = require('async'),
    seedRandom = require('seed-random'),
    uuid = require('uuid');
/*
 * GET home page.
 */

exports.index = function(req, res){
  var seed = req.cookies.seed;
  if (!seed) {
    seed = uuid.v4();
    res.cookie('seed', seed, {expires: 0});
  }
  all('tools', function(err, data) {
    if (err) {
      console.log(err);
      res.render('index', { title: 'Azure Storage Tools', tools: [], error: err });
    } else {
      shuffle(data, seed);
      res.render('index', { title: 'Azure Storage Tools', tools: data });
    }
  });
};

// Data functions

function shuffle(array, seed) {
  var random = seedRandom(seed);
  array.sort(function() { return 0.5 - random();});
  array.sort(function() { return 0.5 - random();});
}

function isJson(file) {
  return (/\.json$/).test(file);
}

function loadRecord(file, callback) {
  fs.readFile(file, 'utf8', function(err, text) {
    var item;
    if (!err) {
      item = JSON.parse(text);
    }
    callback(err, item);
  });
}

function all(type, callback) {
  var dir = __dirname + '/../data/' + type;
  fs.readdir(dir, function (err, files) {
    if (err) {
      callback(err);
      return;
    }
    files = files.filter(isJson).map(function(file) {return dir + '/' + file;});
    if (files.length === 0) {
      callback(null, []);
      return;
    }
    async.map(files, loadRecord, function(err, data){
      callback(err, data);
    });
  });
}