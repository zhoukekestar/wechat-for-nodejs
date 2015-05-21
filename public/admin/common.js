var common = {
  getFormJSON: function(ele) {
    if (ele.jquery === undefined)
      ele = $(ele);
    var arr = ele.serializeArray();
    var res = {};
    arr.forEach(function(t){
      res[t.name] = t.value;
    });
    return JSON.stringify(res);
  },
  postJSON: function(url, data, success, error) {

    if (typeof data === 'function') {
      error   = success;
      success = data;
      data    = '';
    }
    $.ajax({
      type: 'POST',
      contentType: "application/json",
      url: url,
      data: data,
      success: success,
      error: error
    });
  }

}
