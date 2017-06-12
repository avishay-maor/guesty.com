/**
 * Created by avishaymaor on 12/06/2017.
 */
var twit = require('twit');
var config = require('./config.js');
var fs = require('fs');
var json2csv = require('json2csv');


var Twitter = new twit(config);

function getTweets(params, stop, last24, offsetId, dataset, callback) {
    dataset = dataset || []
    params.max_id = offsetId;
    if (stop) {
        return callback(null, dataset)
    }
    return Twitter.get('search/tweets', params, function (error, data) {
        if (error) {
            return callback(error);
        } else {
            var output = [];
            for (var i in data.statuses) {
                if (new Date(data.statuses[i].created_at).getTime() > last24) {
                    output.push(data.statuses[i]);
                } else {
                    stop = true;
                }
            }
            dataset = dataset.concat(output);
            offsetId = dataset[dataset.length - 1].id
            return getTweets(params, stop, last24, offsetId, dataset, callback)
        }
    });
}
var params = {
    q: '@airbnb #airbnb',  // REQUIRED
    result_type: 'recent',
    lang: 'en',
    count: 100
}

var date = new Date();
var last24 = date.setDate(date.getDate() - 1);

getTweets(params, false, last24, null, null, function (error, data) {
    var fields = ['id', 'text', 'created_at', 'retweet_count', 'lang'];
    var result = json2csv({data: data, fields: fields});
    fs.writeFile('./airbnbTweets_.csv', result, 'utf8', function (err) {
        if (err) {
            console.log('Not Saved!');
        } else {
            console.log('Saved!');
        }
    });
})