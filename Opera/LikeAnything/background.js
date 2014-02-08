
chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var tab = tabs[0];
        chrome.windows.create({
            url: 'https://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(tab.url) + '&width=150&layout=box_count&action=like&show_faces=true&share=true&height=65&appId=1378789829056094',
            left: screen.width - 150,
            top: 100,
            height: 150,
            width: 100,
            type: 'popup'
        });
    });
});

