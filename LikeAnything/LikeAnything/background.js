
var double_click = false;

chrome.browserAction.onClicked.addListener(function() {
    if (double_click) {
        double_click = window.clearTimeout(double_click);
        return chrome.tabs.create({
            url: 'https://facebook.com/'
        });
    }

    // set up double click tracking (let's consider 250 ms a treshold)
    double_click = window.setTimeout(function () {
        double_click = window.clearTimeout(double_click);

        // execute single click action (i.e. double click timed out)
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            var tab = tabs[0];
            chrome.windows.create({
                url: 'https://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(tab.url) + '&width=150&layout=box_count&action=like&show_faces=true&share=true&height=65&appId=1378789829056094',
                left: screen.width - 150,
                top: 100,
                height: 175,
                width: 100,
                type: 'popup'
            });
        });
    }, 250);
});

