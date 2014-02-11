
function openTwitter(url_append) {
    var url = 'https://twitter.com/';
    if (typeof url_append !== 'undefined') {
        url += url_append;
    }
    chrome.tabs.create({
        url: url
    });
}


var double_click = false;

// inject script when icon is clicked
chrome.browserAction.onClicked.addListener(function() {
    if (double_click) {
        double_click = window.clearTimeout(double_click);
        return openTwitter();
    }

    // set up double click tracking (let's consider 250 ms a treshold)
    double_click = window.setTimeout(function () {
        double_click = window.clearTimeout(double_click);

        // execute single click action (i.e. double click timed out)
        chrome.tabs.executeScript(null, {
            // script sends current selection text back
            code: 'chrome.runtime.sendMessage({ text: window.getSelection().toString() });'
        }, function (result) {
            // code wasn't executed or result would be [list of results], or even [null]
            if (typeof result === 'undefined') {
                openTwitter();
            }
        });
    }, 250);
});

// listen for messages from injected script
chrome.runtime.onMessage.addListener(function (request, sender) {
    // find currently selected tab
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var tab = tabs[0];

        // open new tab with twitter intent pre-filled
        openTwitter(
            'share?url=' + encodeURIComponent(tab.url) +
            '&text=' + encodeURIComponent(request.text ? request.text : tab.title)
        );
    });
});


// setup badge appearance
chrome.browserAction.setBadgeBackgroundColor({ color: '#000' });


// utility function to display large numbers in suffix format
function format(n) {
    var units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

    for (var i = units.length; i >= 0; i--) {
        var unit = Math.pow(1000, i + 1);

        if (n >= unit) {
            var result = (n / unit).toPrecision(2);
            if (result.toString().length > 3) {
                result = Math.floor(result);
            }

            return result + units[i];
        }
    }

    return n;
}

// utility function to udpate badge text
function setBadgeText(number) {
    chrome.browserAction.setBadgeText({ text: format(number).toString() });
    chrome.browserAction.setTitle({ title: number.toString() });
}

function clearBadgeText() {
    chrome.browserAction.setBadgeText({ text: '' });
    chrome.browserAction.setTitle({ title: '' });
}


// utility function to retrieve the tweet count of given url (either from cache or making a request)
function getTweetCount(url) {
    var cache_key = 'tweetcount-' + url,
        cached = window.localStorage[cache_key],
        expires = window.localStorage[cache_key + '-expires'];

    // if cache is present and not expired, display it
    if (typeof cached !== 'undefined' && (new Date()).getTime() <= expires) {
        setBadgeText(cached);
        return;
    }

    // otherwise, make a request to twitter api
    var req = new XMLHttpRequest();
    // let's hope this URL works for long time
    req.open('GET', 'http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(url), true);
    req.onreadystatechange = function (data) {
        // the usual xhr response handling
        if (req.readyState !== 4 || req.status !== 200) {
            return;
        }

        var data = JSON.parse(req.responseText);
        if (typeof data.count !== 'undefined') {
            // update cache
            window.localStorage[cache_key] = data.count;
            // expiration time now + 1 hour
            window.localStorage[cache_key + '-expires'] = (new Date()).getTime() + 60 * 60 * 1000;

            // display count on icon
            setBadgeText(data.count);
        }
    }

    req.send();
}


// listen for tab changes (user switching a tab)
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (tab.status !== 'complete' || tab.url.indexOf('http') === -1) {
            return clearBadgeText();
        }

        // check tab.url for tweet count
        getTweetCount(tab.url);
    });
});

// listen for tab loads (browser loading a page)
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // when tab has loaded a page
    if (changeInfo.status !== 'complete' || tab.url.indexOf('http') === -1) {
        return clearBadgeText();
    }

    // check tab.url for tweet count
    getTweetCount(tab.url);
});

