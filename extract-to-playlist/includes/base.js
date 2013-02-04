
opera.extension.onmessage = function(event) {
    if (event.data === 'enable') {
        var fr = new FileReader();
        fr.onload = function() {
            var script = document.createElement('script');
            script.textContent = fr.result;
            document.body.appendChild(script);

            var callback = document.createElement('script');
            callback.textContent = '(' + init.toString() + ')();';
            document.body.appendChild(callback);
        }
        fr.readAsText(opera.extension.getFile('/jquery.min.js'));
    }
};


function init() {
    function extract(target) {
        console.log($(target).find('a[href*="youtube"]').length);
    }

    function toggleBackground(event) {
        var $this = $(this);

        if (event.type === 'click') {
            $this.css('background-color', $this.data('bgcolor'));
            $('body').off('click mouseover mouseout', toggleBackground);
            extract(event.target);
        } else if (event.type === 'mouseover') {
            $this.data('bgcolor', $this.css('background-color'));
            $this.css('background-color','rgba(255, 100, 0, .2)');
        } else {
            $this.css('background-color', $this.data('bgcolor'));
        }

        return false;
    }

    $('body').on('click mouseover mouseout', '*', toggleBackground);
}

