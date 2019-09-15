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
  },

  intercept = function(event) {
    var a = !modified(event) && anchor(event);
    if (a && a.host == window.location.host) {
      event.preventDefault ? event.preventDefault() : event.returnValue = false;
      load(a.href);
    }
  },

  load = function(path) {
    var
      url = path + (path.match(/\?/) ? '&' : '?') + '_=' + new Date().getTime(),
      iframe = document.createElement('iframe'),
      onload = function() {
        var doc = iframe.contentWindow.document;
        if (doc.readyState == 'complete') {
          iframe.onload = null;
          blend(doc, function() {
            var title = doc.title;
            // window.top.history.pushState({title: title, path: doc.URL}, title, path);
          });
        }
      };

    iframe.style.cssText = `
  width: 0;
  height: 0;
  position: absolute;
  border: 0;
`;

    document.body.appendChild(iframe);
    iframe.onload = onload;
    iframe.contentWindow.location = url;
  },

  blend = function(doc, fn) {
    var diffs = diff(document.body, doc.body);
    fn();
  },

  // utility functions

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

  diff = function(el, other) {
    var
      added = [],
      removed = [],
      replaced = [],
      moved = {},
      matched = {},
      inverted = {},
      offset = 0,
      listA = [],
      listB = [],
      i, j, a, b, match, index, diff, child;

    for (i = 0; i < el.children.length; i++) {
      a = el.children[i];
      if (a.nodeName == 'IFRAME') {
        break;
      }
      match = false;
      for (j = 0; j < other.children.length; j++) {
        if (!matched[j]) {
          b = other.children[j];
          if (a.isEqualNode(b)) {
            match = true;
            matched[j] = true;
            if (i != j) {
              moved[i] = j;
            }
            break;
          }
        }
      }
      if (!match) {
        removed.push(i);
      }
    }

    for (i = 0; i < other.children.length; i++) {
      if (!matched[i]) {
        added.push(i);
      }
    }

    for (i = 0; i < added.length; i++) {
      index = added[i];
      j = removed.indexOf(index);
      if (j != -1) {
        replaced.push(index);
        added.splice(i, 1);
        removed.splice(j, 1);
      }
    }

    for (i in moved) {
      inverted[moved[i]] = parseInt(i, 10);
    }

    for (i in moved) {
      i = parseInt(i, 10);
      if (added.indexOf(i) != -1) {
        offset++;
      }
      if (removed.indexOf(i - 1) != -1) { // ?????
        offset--;
      }
      index = i + offset;
      listA.push({
        index: moved[i],
        text: el.children[i].innerText
      });
      listB.push({
        index: index,
        el: el.children[inverted[index]],
        text: (el.children[inverted[index]] && el.children[inverted[index]].innerText) || index
      });
    }

    console.log('inverted', inverted);
    console.log('moved', moved);
    console.log('listA', listA);
    console.log('listB', listB);

    moved =
      ListDiff(
        listA,
        listB,
        'index'
      ).map(function(diff) {
        if (diff.type != 'move') {
          console.warn('[Grimlock] Encountered unexpected diff type: "' + diff.type + '"');
        }
        return diff;
      });

    window.ListDiff = ListDiff;
    console.log('replaced', replaced);
    console.log('removed', removed);
    console.log('added', added);
    console.log('moved', moved);

    for (i = 0; i < replaced.length; i++) {
      index = replaced[i];
      el.replaceChild(other.children[index].cloneNode(true));
    }

    for (i = removed.length - 1; i >= 0; i--) {
      index = removed[i];
      el.removeChild(el.children[index]);
    }

    for (i = added.length - 1; i >= 0; i--) {
      index = added[i];
      child = other.children[index].cloneNode(true);
      if (index == el.children.length) {
        el.appendChild(child);
      } else {
        el.insertBefore(child, el.children[index]);
      }
    }

    for (i = 0; i < moved.length; i++) {
      diff = moved[i];
      console.log(diff);
      el.insertBefore(diff.item.el, diff.afterNode.el);
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
