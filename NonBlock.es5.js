;

(function () {
  /**
   * NonBlock.js
   *
   * Copyright (c) 2017-2018 Hunter Perrin
   *
   * @author Hunter Perrin <hperrin@gmail.com>
   */
  'use strict';

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  (function (init) {
    if (document.body) {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init);
    }
  })(function () {
    // This keeps track of the last element the mouse was over, so
    // mouseleave, mouseenter, etc can be called.
    var nonBlockLastElem = void 0;
    // These is used for selecting text under a nonblock element.
    var isOverTextNode = false;
    var isSelectingText = false;
    // Some useful regexes.
    var regexOn = /^on/,
        regexMouseEvents = /^(dbl)?click$|^mouse(move|down|up|over|out|enter|leave)$|^contextmenu$/,
        regexUiEvents = /^(focus|blur|select|change|reset)$|^key(press|down|up)$/,
        regexHtmlEvents = /^(scroll|resize|(un)?load|abort|error)$/;

    function isNonBlocking(el) {
      return el.classList.contains('nonblock');
    }

    function getCursor(el) {
      var style = window.getComputedStyle(el);
      return style.getPropertyValue('cursor');
    }

    function setCursor(el, value) {
      remCursor(el);
      el.classList.add('nonblock-cursor-' + value);
    }

    function remCursor(el) {
      [].concat(_toConsumableArray(el.classList.values())).forEach(function (className) {
        if (className.indexOf('nonblock-cursor-') === 0) {
          el.classList.remove(className);
        }
      });
    }

    document.body.addEventListener('mouseenter', function (ev) {
      if (isNonBlocking(ev.target)) {
        nonBlockLastElem = ev.target;
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('mouseleave', function (ev) {
      if (isNonBlocking(ev.target)) {
        remCursor(ev.target);
        nonBlockLastElem = null;
        isSelectingText = false;
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('mousemove', function (ev) {
      if (isNonBlocking(ev.target)) {
        nonblockPass(ev.target, ev, 'onmousemove');
        // If the user just clicks somewhere, we don't want to select text, so this
        // detects that the user moved their mouse.
        if (isSelectingText === null) {
          window.getSelection().removeAllRanges();
          isSelectingText = true;
        }
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('mousedown', function (ev) {
      if (isNonBlocking(ev.target)) {
        ev.preventDefault();
        nonblockPass(ev.target, ev, 'onmousedown');
        isSelectingText = null;
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('mouseup', function (ev) {
      if (isNonBlocking(ev.target)) {
        ev.preventDefault();
        nonblockPass(ev.target, ev, 'onmouseup');
        if (isSelectingText === null) {
          window.getSelection().removeAllRanges();
        }
        isSelectingText = false;
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('click', function (ev) {
      if (isNonBlocking(ev.target)) {
        nonblockPass(ev.target, ev, 'onclick');
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('dblclick', function (ev) {
      if (isNonBlocking(ev.target)) {
        nonblockPass(ev.target, ev, 'ondblclick');
        ev.stopPropagation();
      }
    }, true);

    // Fire a DOM event.
    var domEvent = function domEvent(elem, event, origEvent) {
      var eventObject = void 0;
      event = event.toLowerCase();
      if (document.createEvent && elem.dispatchEvent) {
        // FireFox, Opera, Safari, Chrome
        event = event.replace(regexOn, '');
        if (event.match(regexMouseEvents)) {
          // This allows the click event to fire on the notice. There is
          // probably a much better way to do it.
          elem.getBoundingClientRect();
          eventObject = document.createEvent("MouseEvents");
          eventObject.initMouseEvent(event, origEvent.bubbles, origEvent.cancelable, origEvent.view, origEvent.detail, origEvent.screenX, origEvent.screenY, origEvent.clientX, origEvent.clientY, origEvent.ctrlKey, origEvent.altKey, origEvent.shiftKey, origEvent.metaKey, origEvent.button, origEvent.relatedTarget);
        } else if (event.match(regexUiEvents)) {
          eventObject = document.createEvent("UIEvents");
          eventObject.initUIEvent(event, origEvent.bubbles, origEvent.cancelable, origEvent.view, origEvent.detail);
        } else if (event.match(regexHtmlEvents)) {
          eventObject = document.createEvent("HTMLEvents");
          eventObject.initEvent(event, origEvent.bubbles, origEvent.cancelable);
        }
        if (!eventObject) {
          return;
        };
        elem.dispatchEvent(eventObject);
      } else {
        // Internet Explorer
        if (!event.match(regexOn)) {
          event = "on" + event;
        };
        eventObject = document.createEventObject(origEvent);
        elem.fireEvent(event, eventObject);
      }
    };

    // This is used to pass events through the el if it is non-blocking.
    var nonblockPass = function nonblockPass(elem, event, eventName) {
      elem.classList.add('nonblock-hide');
      var elBelow = document.elementFromPoint(event.clientX, event.clientY);
      var range = void 0,
          textNode = void 0,
          whitespaceBefore = void 0,
          text = void 0,
          offset = void 0;
      if (document.caretPositionFromPoint) {
        range = document.caretPositionFromPoint(event.clientX, event.clientY);
        textNode = range.offsetNode;
        offset = range.offset;
      } else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
        textNode = range.startContainer;
        offset = range.startOffset;
      }
      if (range) {
        whitespaceBefore = range.startContainer.textContent.match(/^[\s\n]*/)[0];
        text = range.startContainer.textContent.replace(/[\s\n]+$/g, '');
      }

      elem.classList.remove('nonblock-hide');
      var cursorStyle = getCursor(elBelow);
      isOverTextNode = false;
      if (cursorStyle === 'auto' && elBelow.tagName === 'A') {
        cursorStyle = 'pointer';
      } else if ((!whitespaceBefore.length || offset > whitespaceBefore.length) && offset < text.length) {
        if (cursorStyle === 'auto') {
          cursorStyle = 'text';
        }
        isOverTextNode = true;
      }

      if (range && isSelectingText && offset > 0) {
        var selection = window.getSelection();
        var selectionRange = void 0,
            addRange = false;
        if (selection.rangeCount === 0 || !selection.getRangeAt(0)) {
          selectionRange = document.createRange();
          selectionRange.setStart(range.startContainer, offset - 1);
          addRange = true;
        } else {
          selectionRange = selection.getRangeAt(0);
        }

        selectionRange.setEnd(range.endContainer, offset);
        if (addRange) {
          window.getSelection().addRange(selectionRange);
        }
      }

      setCursor(elem, cursorStyle !== 'auto' ? cursorStyle : 'default');
      // If the element changed, call mouseenter, mouseleave, etc.
      if (!nonBlockLastElem || nonBlockLastElem !== elBelow) {
        if (nonBlockLastElem) {
          var lastElem = nonBlockLastElem;
          domEvent(lastElem, 'mouseleave', event);
          domEvent(lastElem, 'mouseout', event);
        }
        domEvent(elBelow, 'mouseenter', event);
        domEvent(elBelow, 'mouseover', event);
      }
      domEvent(elBelow, eventName, event);
      // Remember the latest element the mouse was over.
      nonBlockLastElem = elBelow;
    };
  });
})();
