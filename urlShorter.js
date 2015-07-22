(function(window, undefined){
var document = window.document;
var jsonpCallbackName = 'jsonpCallback2835823284732';
var scope = {};

var pop = new Popup();
pop.setStatus('loading');
pop.show();

var longUrl = prompt('Enter URL for shorter:', window.location.href);
if (longUrl === null) {
  pop.hide();
  return;
}

getShortURL(longUrl, function(shortUrl) {
  pop.setInputText(shortUrl);
  pop.setStatus('loaded');
});

window[jsonpCallbackName] = function(responseObj) {
  try {
    var html = responseObj.results[0];
    scope.successFunc(html);
  } catch(e) {
    scope.errFunc(e);
  }
}

function Popup() {
  if (Popup._self) { return Popup._self } else { Popup._self = this; }

  var self = this;
  var popupId = 'urlShorterPopup_984832881897218553';

  var popupHtmlTemplate = [
    '<div>',
      '<input id="urlShorterInput" type="text" value="">',
      '<span id="urlShorterPopupCloseButton">&times;</span>',
      '<span id="urlShorterPreloder">Loading...</span>',
    '</div>'
  ];

  var popupCssTemplate = [
    '#' + popupId + ' {',
      'position: fixed;',
      'top: 50px;',
      'bottom: 50px;',
      'left: 50px;',
      'right: 50px;',
      'border: 3px solid black;',
      'border-radius: 20px;',
      'background-color: #FFF;',
      'z-index: 10000;',
    '}',
    '#' + popupId + ' #urlShorterInput {',
      'width: 400px;',
      'height: 50px;',
      'font-size: 40px;',
      'position: absolute;',
      'top: 50%;',
      'left: 50%;',
      'margin: -25px 0 0 -200px;',
    '}',
    '#' + popupId + ' #urlShorterPopupCloseButton {',
      'font-size: 40px;',
      'position: absolute;',
      'right: 20px;',
      'top: 10px;',
    '}',
    '#' + popupId + ' #urlShorterPopupCloseButton:hover {',
      'cursor: pointer;',
    '}',
    '#' + popupId + ' #urlShorterPreloder {',
      'width: 170px;',
      'height: 50px;',
      'font-size: 40px;',
      'position: absolute;',
      'top: 50%;',
      'left: 50%;',
      'margin: -25px 0 0 -85px;',
    '}'
  ];
  
  var popupEl = getPopupElement();
  document.body.appendChild(popupEl);
  popupEl.style.display = 'none';

  var input = popupEl.querySelector('#urlShorterInput');
  var preloader = popupEl.querySelector('#urlShorterPreloder');

  popupEl.querySelector('#urlShorterPopupCloseButton').onclick = function() {
    self.hide();
  };

  var popupStatus = 'loading';

  var statusesHandlers = {
    'loading': loadingHandler,
    'loaded': loadedHandler,
    'error': 3
  };

  statusesHandlers[popupStatus]();

  function loadingHandler() {
    input.style.display = 'none';
    preloader.style.display = '';
    return self;
  }

  function loadedHandler() {
    input.style.display = '';
    input.select();
    input.focus();
    preloader.style.display = 'none';
    return self;
  }

  self.setStatus = function(newStatus) {
    if ( statusesHandlers[newStatus] === undefined ) {
      throw new Error('invalid status');
    }
    popupStatus = newStatus;
    statusesHandlers[newStatus]();
    return self;
  }

  self.setInputText = function(newText) {
    popupEl.querySelector('#urlShorterInput').value = newText;
    return self;
  }

  self.show = function() {
    popupEl.style.display = '';
    return self;
  }

  self.hide = function() {
    popupEl.style.display = 'none';
    return self;
  }

  self.toggle = function() {
    if ( popupEl.style.display === 'none' ) {
      popupEl.style.display = '';
    } else {
      popupEl.style.display = 'none';
    }
    return self;
  }

  function getPopupElement() {
    var existPopupEl = document.getElementById(popupId);
    if ( existPopupEl ) {
      return existPopupEl;
    } else {
      return createPopupElement();
    }
  }

  function createPopupElement() {
    var stylesCss = getTemplateFromArr( popupCssTemplate );
    addStyles(stylesCss);

    var container = document.createElement('div');
    var htmlTemplate = getTemplateFromArr( popupHtmlTemplate );
    container.innerHTML = htmlTemplate;
    var popupEl = container.querySelector('div');
    popupEl.id = popupId;

    return popupEl;
  }

  function getTemplateFromArr(templateArr) {
    return templateArr.join('');
  }

  function trim(str) {
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    return str.replace(rtrim, '');
  }

  function addStyles(cssCode) {
    var styleEl = document.createElement('style');
    styleEl.innerHTML = cssCode;
    document.head.appendChild(styleEl);
    return self;
  }

}

function getShortURL(longUrl, successCallback, errCallback) {
  var shorterURL = 'https://clck.ru/--?url=' + longUrl;
  var jsonpReq = new JsonpRequest({
    url: getQueryYQLUrl(shorterURL),
    success: function(html) {
      var shortURL = html.replace('<html><head/><body>', '');
      shortURL = shortURL.replace('</body></html>', '');
      successCallback(shortURL);
    },
    error: errCallback
  });
  scope.successFunc = jsonpReq.successFunc;
  scope.errFunc = jsonpReq.errFunc;
  jsonpReq.send();
}

function JsonpRequest(configObj) {
  var self = this;

  self.successFunc = configObj.success || function(res){};
  self.errFunc = configObj.error || function(e){ throw e; };
  var url = configObj.url || '';

  var id = 'jsonpScript' + (Math.random()+'').split('.')[1];

  self.send = function() {
    deleteScript(id);
    var script = document.createElement('script');
    script.src = url;
    script.id = id;
    document.body.appendChild(script);
  }

  function deleteScript(id) {
    var scriptEl = document.getElementById(id);
    if (scriptEl) document.body.removeChild(scriptEl);
    return self;
  }
}

function getQueryYQLUrl(url) {
  var YQL = 'http://query.yahooapis.com/v1/public/yql?';
  var query = 'select * from html where url="{URL}" and xpath="*"';
  var queryParams = {
    'callback': jsonpCallbackName,
    'q': query.replace('{URL}', url),
    'format': 'xml'
  };

  var paramsArr = [];
  for(var paramName in queryParams) { 
    paramsArr.push( paramName + '=' + encodeURIComponent(queryParams[paramName]) );
  }
  var queryUrl = YQL + paramsArr.join('&');
  
  return queryUrl;
}

})(window);
