
window.addEventListener('load', function (){
    opera.extension.onmessage = function (event) {
        opera.extension.postMessage(window.getSelection().toString());
    }
}, false);

