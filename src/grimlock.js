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
        patch(document.body, doc.body);
        if (skipState) {
          document.title = title;
        } else {
          window.top.history.pushState({title: title, path: xhr.responseURL}, title, path);
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

  patch = function(elA, elB) {
    var
      moved = {},
      listA = [],
      listB = [],
      i, j, a, b, match,
      records, record, el, sibling;

    for (i = 0; i < elA.children.length; i++) {
      a = elA.children[i];
      if (a.nodeName == 'IFRAME') {
        break;
      }
      match = false;
      for (j = 0; j < elB.children.length; j++) {
        if (moved[j] == undefined) {
          b = elB.children[j];
          if (a.isEqualNode(b)) {
            match = true;
            moved[j] = i;
            listA.push({index: i, el: a});
            break;
          }
        }
      }
      if (!match) {
        listA.push({index: 'a' + i, el: a});
      }
    }

    for (j = 0; j < elB.children.length; j++) {
      b = elB.children[j];
      i = moved[j];
      if (i == undefined) {
        listB.push({index: 'b' + j, el: b});
      } else {
        listB.push({index: i, el: elA.children[i]});
      }
    }

    records = ListDiff(listA, listB, 'index');

    for (i = 0; i < records.length; i++) {
      record = records[i];
      el = record.item.el;
      if (record.type == 'remove') {
        elA.removeChild(el);
      } else {
        sibling = record.afterNode ? record.afterNode.el.nextSibling : elA.firstChild;
        sibling ? elA.insertBefore(el, sibling) : elA.appendChild(el);
      }
    }
  },

  ListDiff = (
    function() {
      var b={INSERT:"insert",MOVE:"move",REMOVE:"remove"},e=function(f){return typeof f==="object"&&f!==null},a=function(g,f){if(e(g)){return f?g[f]:void 0}return g},d=function(j,h,g){for(var f=0;f<j.length;++f){if(a(j[f],g)===a(h,g)){return f}}return -1},c=function(k,i,h){var m=0,j=null,f=[],l,g;i.forEach(function(n){l=d(k,n,h);if(l===-1){f.push({item:n,type:b.INSERT,afterNode:j})}else{if(l<m){f.push({item:n,type:b.MOVE,afterNode:j})}m=Math.max(l,m)}j=n});k.forEach(function(o,n){g=d(i,o,h);if(g===-1){f.push({item:o,type:b.REMOVE})}});return f};c.patch=function(h,m,o){var g=h.length,k,n,p,l,f,j;for(j=0;j<g;j++){k=h[j];n=k.type;if(n===b.INSERT){l=d(m,k.afterNode,o);m.splice(l+1,0,k.item)}else{if(n===b.REMOVE){l=d(m,k.item,o);m.splice(l,1)}else{if(n===b.MOVE){f=d(m,k.item,o);p=m.splice(f,1)[0];l=d(m,k.afterNode,o);m.splice(l+1,0,p)}}}}return m};return c
    }()
  );

  ready(init);

  return {
    load: load
  };
}());
