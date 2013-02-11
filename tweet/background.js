
function xhr(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function (data) {
        if (req.readyState == 4 && req.status == 200) {
            callback(JSON.parse(req.responseText));
        }
    }
    req.send();
}

window.addEventListener('load', function() {
    var button = opera.contexts.toolbar.createItem({
        disabled: false, // The button is enabled.
        title: 'Twitter',
        icon: 'twitter.png',
        popup: {
            href: 'http://twitter.com/share',
            width: 550,
            height: 305
        },
        onclick: function () {
            opera.extension.tabs.getFocused().postMessage('');
        },
        badge: {
            backgroundColor: '#006',
            color: '#ff6',
            display: 'block'
        }
    });
    opera.contexts.toolbar.addItem(button);

    opera.extension.onmessage = function (event) {
        var tab = opera.extension.tabs.getFocused(),
            title = event.data.length ? event.data : tab.title;

        button.popup.href = 'http://twitter.com/share?url=' + encodeURIComponent(tab.url) + '&text=' + encodeURIComponent(title);
    };

    function toggleButton(enabled, text) {
        if (typeof text !== 'undefined') {
            button.badge.textContent = text;
        }

        button.badge.display = enabled ? 'block' : 'none';
        button.disabled = !enabled;
    }

    var cache = {};

    opera.extension.onconnect = opera.extension.tabs.onfocus = function update() {
        var tab = opera.extension.tabs.getFocused();
        if (tab) {
            var url = 'http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(tab.url),
                cached = window.localStorage['tweetcount-' + tab.url + '-timestamp'];

            opera.postError(cached);

            if (typeof cached !== 'undefined' && (new Date()).getTime() - cached < 30 * 60 * 1000) {
                toggleButton(true, window.localStorage['tweetcount-' + tab.url + '-count']);
                return;
            }

            xhr(url, function (data) {
                window.localStorage['tweetcount-' + tab.url + '-timestamp'] = (new Date()).getTime();
                window.localStorage['tweetcount-' + tab.url + '-count'] = data.count;
                toggleButton(true, data.count);
            });
        } else {
            toggleButton(false);
        }
    };
    //opera.extension.tabs.onblur = update;

}, false);

