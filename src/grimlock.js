var

// *
// * grimlock.js {version} (Uncompressed)
// * No bullshit page transitions.
// *
// * (c) {year} Paul Engel
// * grimlock.js is licensed under MIT license
// *
// * $Date: {date} $
// *

Grimlock = (function() {
  'use strict';

  var

  init = function() {
    bind(document, 'click', intercept);
    bind(window, 'popstate', reload);
  },

  intercept = function(event) {
    var a = !modified(event) && anchor(event);
    if (a && a.host == window.location.host) {
      event.preventDefault ? event.preventDefault() : event.returnValue = false;
      load(a.href);
    }
  },

  reload = function(event) {
    load(event.state.path, true);
  },

  load = function(path, skipState) {
    var
      xhr = new XMLHttpRequest(),
      parser, doc, title;

    xhr.onload = function () {
    	if (xhr.status >= 200 && xhr.status < 300) {
        parser = new DOMParser();
        doc = parser.parseFromString(xhr.responseText, 'text/html');
        title = doc.title;
        morph(document.body, doc.body);
        if (skipState) {
          document.title = title;
        } else {
          window.history.pushState({title: title, path: xhr.responseURL}, title, path);
        }
    	}
    };

    xhr.open('GET', path);
    xhr.send();
  },

  ready = function(fn) {
    if (document.attachEvent)
      document.attachEvent('onreadystatechange', function() {
        (document.readyState == 'complete') && fn();
      });
    else
      document.addEventListener('DOMContentLoaded', fn);
  },

  bind = function(element, type, fn) {
    if (element.attachEvent)
      element.attachEvent('on' + type, fn);
    else
      element.addEventListener(type, fn, false);
  },

  modified = function(event) {
    return event.metaKey || event.shiftKey || event.ctrlKey || event.altKey;
  },

  anchor = function(object) {
    if (object) {
      var element = object.nodeName ? object : target(object);
      return (element.nodeName == 'A') ? element : anchor(element.parentNode);
    }
  },

  target = function(event) {
    return event.target || event.srcElement || window.event.target || window.event.srcElement;
  },

  morph = function(elA, elB) {
    MorphDom(elA, elB, {
      onNodeAdded: function(node) {
        if (node.nodeType != 3) {
          node.style.background = 'green';
        }
      },
      onBeforeElUpdated: function(fromEl, toEl) {
        return !fromEl.isEqualNode(toEl);
      },
      onElUpdated: function(el) {
        el.style.background = 'yellow';
      }
    });
  },

  MorphDom = (
    function() {
      var e,t="http://www.w3.org/1999/xhtml",n="undefined"==typeof document?void 0:document,r=!!n&&"content"in n.createElement("template"),i=!!n&&n.createRange&&"createContextualFragment"in n.createRange();function a(t){return t=t.trim(),r?function(e){var t=n.createElement("template");return t.innerHTML=e,t.content.childNodes[0]}(t):i?function(t){return e||(e=n.createRange()).selectNode(n.body),e.createContextualFragment(t).childNodes[0]}(t):function(e){var t=n.createElement("body");return t.innerHTML=e,t.childNodes[0]}(t)}function o(e,t){var n=e.nodeName,r=t.nodeName;return n===r||!!(t.actualize&&n.charCodeAt(0)<91&&r.charCodeAt(0)>90)&&n===r.toUpperCase()}function d(e,t,n){e[n]!==t[n]&&(e[n]=t[n],e[n]?e.setAttribute(n,""):e.removeAttribute(n))}var l={OPTION:function(e,t){var n=e.parentNode;if(n){var r=n.nodeName.toUpperCase();"OPTGROUP"===r&&(r=(n=n.parentNode)&&n.nodeName.toUpperCase()),"SELECT"!==r||n.hasAttribute("multiple")||(e.hasAttribute("selected")&&!t.selected&&(e.setAttribute("selected","selected"),e.removeAttribute("selected")),n.selectedIndex=-1)}d(e,t,"selected")},INPUT:function(e,t){d(e,t,"checked"),d(e,t,"disabled"),e.value!==t.value&&(e.value=t.value),t.hasAttribute("value")||e.removeAttribute("value")},TEXTAREA:function(e,t){var n=t.value;e.value!==n&&(e.value=n);var r=e.firstChild;if(r){var i=r.nodeValue;if(i==n||!n&&i==e.placeholder)return;r.nodeValue=n}},SELECT:function(e,t){if(!t.hasAttribute("multiple")){for(var n,r,i=-1,a=0,o=e.firstChild;o;)if("OPTGROUP"===(r=o.nodeName&&o.nodeName.toUpperCase()))o=(n=o).firstChild;else{if("OPTION"===r){if(o.hasAttribute("selected")){i=a;break}a++}!(o=o.nextSibling)&&n&&(o=n.nextSibling,n=null)}e.selectedIndex=i}}},u=1,c=11,f=3,s=8;function v(){}function m(e){return e.id}return function(e){return function(r,i,d){if(d||(d={}),"string"==typeof i)if("#document"===r.nodeName||"HTML"===r.nodeName){var p=i;(i=n.createElement("html")).innerHTML=p}else i=a(i);var h,N=d.getNodeKey||m,b=d.onBeforeNodeAdded||v,A=d.onNodeAdded||v,C=d.onBeforeElUpdated||v,T=d.onElUpdated||v,g=d.onBeforeNodeDiscarded||v,S=d.onNodeDiscarded||v,E=d.onBeforeElChildrenUpdated||v,x=!0===d.childrenOnly,y={};function U(e){h?h.push(e):h=[e]}function R(e,t,n){!1!==g(e)&&(t&&t.removeChild(e),S(e),function e(t,n){if(t.nodeType===u)for(var r=t.firstChild;r;){var i=void 0;n&&(i=N(r))?U(i):(S(r),r.firstChild&&e(r,n)),r=r.nextSibling}}(e,n))}function V(e){A(e);for(var t=e.firstChild;t;){var n=t.nextSibling,r=N(t);if(r){var i=y[r];i&&o(t,i)&&(t.parentNode.replaceChild(i,t),O(i,t))}V(t),t=n}}function O(t,a,d){var c=N(a);if(c&&delete y[c],!i.isSameNode||!i.isSameNode(r)){if(!d){if(!1===C(t,a))return;if(e(t,a),T(t),!1===E(t,a))return}"TEXTAREA"!==t.nodeName?function(e,t){var r,i,a,d,c,v=t.firstChild,m=e.firstChild;e:for(;v;){for(d=v.nextSibling,r=N(v);m;){if(a=m.nextSibling,v.isSameNode&&v.isSameNode(m)){v=d,m=a;continue e}i=N(m);var p=m.nodeType,h=void 0;if(p===v.nodeType&&(p===u?(r?r!==i&&((c=y[r])?a===c?h=!1:(e.insertBefore(c,m),i?U(i):R(m,e,!0),m=c):h=!1):i&&(h=!1),(h=!1!==h&&o(m,v))&&O(m,v)):p!==f&&p!=s||(h=!0,m.nodeValue!==v.nodeValue&&(m.nodeValue=v.nodeValue))),h){v=d,m=a;continue e}i?U(i):R(m,e,!0),m=a}if(r&&(c=y[r])&&o(c,v))e.appendChild(c),O(c,v);else{var A=b(v);!1!==A&&(A&&(v=A),v.actualize&&(v=v.actualize(e.ownerDocument||n)),e.appendChild(v),V(v))}v=d,m=a}!function(e,t,n){for(;t;){var r=t.nextSibling;(n=N(t))?U(n):R(t,e,!0),t=r}}(e,m,i);var C=l[e.nodeName];C&&C(e,t)}(t,a):l.TEXTAREA(t,a)}}!function e(t){if(t.nodeType===u||t.nodeType===c)for(var n=t.firstChild;n;){var r=N(n);r&&(y[r]=n),e(n),n=n.nextSibling}}(r);var I,P,w=r,L=w.nodeType,z=i.nodeType;if(!x)if(L===u)z===u?o(r,i)||(S(r),w=function(e,t){for(var n=e.firstChild;n;){var r=n.nextSibling;t.appendChild(n),n=r}return t}(r,(I=i.nodeName,(P=i.namespaceURI)&&P!==t?n.createElementNS(P,I):n.createElement(I)))):w=i;else if(L===f||L===s){if(z===L)return w.nodeValue!==i.nodeValue&&(w.nodeValue=i.nodeValue),w;w=i}if(w===i)S(r);else if(O(w,i,x),h)for(var B=0,D=h.length;B<D;B++){var H=y[h[B]];H&&R(H,H.parentNode,!1)}return!x&&w!==r&&r.parentNode&&(w.actualize&&(w=w.actualize(r.ownerDocument||n)),r.parentNode.replaceChild(w,r)),w}}(function(e,t){var n,r,i,a,o,d=t.attributes;for(n=d.length-1;n>=0;--n)i=(r=d[n]).name,a=r.namespaceURI,o=r.value,a?(i=r.localName||i,e.getAttributeNS(a,i)!==o&&e.setAttributeNS(a,i,o)):e.getAttribute(i)!==o&&e.setAttribute(i,o);for(n=(d=e.attributes).length-1;n>=0;--n)!1!==(r=d[n]).specified&&(i=r.name,(a=r.namespaceURI)?(i=r.localName||i,t.hasAttributeNS(a,i)||e.removeAttributeNS(a,i)):t.hasAttribute(i)||e.removeAttribute(i))})
    }()
  );

  ready(init);

  return {
    load: load
  };
}());
