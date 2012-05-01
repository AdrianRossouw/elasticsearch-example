var express = require('express'),
app = express.createServer(),
_ = require('underscore')._,
request = require('request');

app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.helpers({ _:_, summarize: summarize });
app.locals({ 
    siteName : 'elasticsearch example',
    author: 'Adrian Rossouw'
});

app.use(express.static(__dirname + '/assets'));

function summarize(str) {
    var ind = str.indexOf('<h3>');

    return str.substr(0, ~ind ? ind : 200);
}

function loadSearch(db) {
    return function(req, res, next) {
        var url = 'http://127.0.0.1:9200/'+db+'/'+db+'/_search?q='+req.query.q;

        req.searchResults = [];
        request({ uri: url, json: true }, function(err, resp, data) {
            if (err) return res.send(500);

            req.searchResults = _(data.hits.hits).map(function(hit) {
                return hit._source;
            });
            next();
        });

    };
}

app.get('/', loadSearch('febp_documents'), function(req, res, next) {
    res.render('search', { q: req.query.q, results: req.searchResults });
});

app.listen(9000);
