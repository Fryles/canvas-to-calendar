function storeKey(canvas_key) {
    var key='canvas_key', pair = {'canvas_key': canvas_key};
        chrome.storage.sync.set({'canvas_key': pair}, function() {console.log('saved', key, pair);});
}

function getKey() {
    chrome.storage.sync.get('canvas_key', function (obj) {
        console.log('canvas_key', obj);
    });
}