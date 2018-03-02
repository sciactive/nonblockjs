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
    var styling = document.createElement('style');
    styling.setAttribute('type', 'text/css');
    var css = '\n  .nonblock{transition:opacity .3s ease;}\n  .nonblock:hover{opacity:.1 !important;}\n  .nonblock-hide{display:none !important;}\n  .nonblock-cursor-auto{cursor:auto !important;}\n  .nonblock-cursor-default{cursor:default !important;}\n  .nonblock-cursor-none{cursor:none !important;}\n  .nonblock-cursor-context-menu{cursor:context-menu !important;}\n  .nonblock-cursor-help{cursor:help !important;}\n  .nonblock-cursor-pointer{cursor:pointer !important;}\n  .nonblock-cursor-progress{cursor:progress !important;}\n  .nonblock-cursor-wait{cursor:wait !important;}\n  .nonblock-cursor-cell{cursor:cell !important;}\n  .nonblock-cursor-crosshair{cursor:crosshair !important;}\n  .nonblock-cursor-text{cursor:text !important;}\n  .nonblock-cursor-vertical-text{cursor:vertical-text !important;}\n  .nonblock-cursor-alias{cursor:alias !important;}\n  .nonblock-cursor-copy{cursor:copy !important;}\n  .nonblock-cursor-move{cursor:move !important;}\n  .nonblock-cursor-no-drop{cursor:no-drop !important;}\n  .nonblock-cursor-not-allowed{cursor:not-allowed !important;}\n  .nonblock-cursor-all-scroll{cursor:all-scroll !important;}\n  .nonblock-cursor-col-resize{cursor:col-resize !important;}\n  .nonblock-cursor-row-resize{cursor:row-resize !important;}\n  .nonblock-cursor-n-resize{cursor:n-resize !important;}\n  .nonblock-cursor-e-resize{cursor:e-resize !important;}\n  .nonblock-cursor-s-resize{cursor:s-resize !important;}\n  .nonblock-cursor-w-resize{cursor:w-resize !important;}\n  .nonblock-cursor-ne-resize{cursor:ne-resize !important;}\n  .nonblock-cursor-nw-resize{cursor:nw-resize !important;}\n  .nonblock-cursor-se-resize{cursor:se-resize !important;}\n  .nonblock-cursor-sw-resize{cursor:sw-resize !important;}\n  .nonblock-cursor-ew-resize{cursor:ew-resize !important;}\n  .nonblock-cursor-ns-resize{cursor:ns-resize !important;}\n  .nonblock-cursor-nesw-resize{cursor:nesw-resize !important;}\n  .nonblock-cursor-nwse-resize{cursor:nwse-resize !important;}\n  .nonblock-cursor-zoom-in{cursor:zoom-in !important;}\n  .nonblock-cursor-zoom-out{cursor:zoom-out !important;}\n  .nonblock-cursor-grab{cursor:grab !important;}\n  .nonblock-cursor-grabbing{cursor:grabbing !important;}\n  ';
    if (styling.styleSheet) {
      styling.styleSheet.cssText = css; // IE
    } else {
      styling.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(styling);

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

    function getNonBlocking(el) {
      var nonblock = el;
      while (nonblock) {
        if (nonblock.classList && nonblock.classList.contains('nonblock')) {
          return nonblock;
        }
        nonblock = nonblock.parentNode;
      }
      return false;
    }

    function isNotPropagating(el) {
      return el.classList.contains('nonblock-stop-propagation');
    }

    function isActionNotPropagating(el) {
      return !el.classList.contains('nonblock-allow-action-propagation');
    }

    function getCursor(el) {
      var style = window.getComputedStyle(el);
      return style.getPropertyValue('cursor');
    }

    function setCursor(el, value) {
      if (el.classList.contains('nonblock-cursor-' + value)) {
        return;
      }
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
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
        nonBlockLastElem = nonblock;
        if (isNotPropagating(nonblock)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('mouseleave', function (ev) {
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
        remCursor(nonblock);
        nonBlockLastElem = null;
        isSelectingText = false;
        if (isNotPropagating(nonblock)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('mouseover', function (ev) {
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target)) && isNotPropagating(nonblock)) {
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('mouseout', function (ev) {
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target)) && isNotPropagating(nonblock)) {
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('mousemove', function (ev) {
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
        nonblockPass(nonblock, ev, 'onmousemove');
        // If the user just clicks somewhere, we don't want to select text, so this
        // detects that the user moved their mouse.
        if (isSelectingText === null) {
          window.getSelection().removeAllRanges();
          isSelectingText = true;
        }
        if (isNotPropagating(nonblock)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('mousedown', function (ev) {
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
        nonblockPass(nonblock, ev, 'onmousedown');
        isSelectingText = null;
        if (isNotPropagating(nonblock) || isActionNotPropagating(nonblock)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('mouseup', function (ev) {
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
        nonblockPass(nonblock, ev, 'onmouseup');
        if (isSelectingText === null) {
          window.getSelection().removeAllRanges();
        }
        isSelectingText = false;
        if (isNotPropagating(nonblock) || isActionNotPropagating(nonblock)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('click', function (ev) {
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
        nonblockPass(nonblock, ev, 'onclick');
        if (isNotPropagating(nonblock) || isActionNotPropagating(nonblock)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('dblclick', function (ev) {
      var nonblock = void 0;
      if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
        nonblockPass(nonblock, ev, 'ondblclick');
        if (isNotPropagating(nonblock) || isActionNotPropagating(nonblock)) {
          ev.stopPropagation();
        }
      }
    }, true);

    // Fire a DOM event.
    var useEventConstructors = true;
    try {
      var e = new MouseEvent('click');
    } catch (e) {
      useEventConstructors = false;
    }
    var domEvent = function domEvent(elem, event, origEvent, bubbles) {
      var eventObject = void 0;
      event = event.toLowerCase();
      if (useEventConstructors) {
        // New browsers
        event = event.replace(regexOn, '');
        if (event.match(regexMouseEvents)) {
          eventObject = new MouseEvent(event, {
            screenX: origEvent.screenX,
            screenY: origEvent.screenY,
            clientX: origEvent.clientX,
            clientY: origEvent.clientY,
            ctrlKey: origEvent.ctrlKey,
            shiftKey: origEvent.shiftKey,
            altKey: origEvent.altKey,
            metaKey: origEvent.metaKey,
            button: origEvent.button,
            buttons: origEvent.buttons,
            relatedTarget: origEvent.relatedTarget,
            region: origEvent.region,

            detail: origEvent.detail,
            view: origEvent.view,

            bubbles: bubbles === undefined ? origEvent.bubbles : bubbles,
            cancelable: origEvent.cancelable,
            composed: origEvent.composed
          });
        } else if (event.match(regexUiEvents)) {
          eventObject = new UIEvent(event, {
            detail: origEvent.detail,
            view: origEvent.view,

            bubbles: bubbles === undefined ? origEvent.bubbles : bubbles,
            cancelable: origEvent.cancelable,
            composed: origEvent.composed
          });
        } else if (event.match(regexHtmlEvents)) {
          eventObject = new Event(event, {
            bubbles: bubbles === undefined ? origEvent.bubbles : bubbles,
            cancelable: origEvent.cancelable,
            composed: origEvent.composed
          });
        }
        if (!eventObject) {
          return;
        }
        elem.dispatchEvent(eventObject);
      } else if (document.createEvent && elem.dispatchEvent) {
        // Old method for FireFox, Opera, Safari, Chrome
        event = event.replace(regexOn, '');
        if (event.match(regexMouseEvents)) {
          // This allows the click event to fire on the notice. There is
          // probably a much better way to do it.
          elem.getBoundingClientRect();
          eventObject = document.createEvent("MouseEvents");
          eventObject.initMouseEvent(event, bubbles === undefined ? origEvent.bubbles : bubbles, origEvent.cancelable, origEvent.view, origEvent.detail, origEvent.screenX, origEvent.screenY, origEvent.clientX, origEvent.clientY, origEvent.ctrlKey, origEvent.altKey, origEvent.shiftKey, origEvent.metaKey, origEvent.button, origEvent.relatedTarget);
        } else if (event.match(regexUiEvents)) {
          eventObject = document.createEvent("UIEvents");
          eventObject.initUIEvent(event, bubbles === undefined ? origEvent.bubbles : bubbles, origEvent.cancelable, origEvent.view, origEvent.detail);
        } else if (event.match(regexHtmlEvents)) {
          eventObject = document.createEvent("HTMLEvents");
          eventObject.initEvent(event, bubbles === undefined ? origEvent.bubbles : bubbles, origEvent.cancelable);
        }
        if (!eventObject) {
          return;
        }
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

    // This is used to pass events through the el if it is nonblocking.
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
        textNode = range ? range.offsetNode : null;
        offset = range ? range.offset : null;
      } else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
        textNode = range ? range.startContainer : null;
        offset = range ? range.startOffset : null;
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
      } else if (range && (!whitespaceBefore.length || offset > whitespaceBefore.length) && offset < text.length) {
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
          if (!lastElem.contains(elBelow)) {
            domEvent(lastElem, 'mouseleave', event, false);
          }
          domEvent(lastElem, 'mouseout', event, true);
          if (!elBelow.contains(lastElem)) {
            domEvent(elBelow, 'mouseenter', event, false);
          }
        } else if (!elBelow.contains(elem)) {
          domEvent(elBelow, 'mouseenter', event, false);
        }
        domEvent(elBelow, 'mouseover', event, true);
      }
      domEvent(elBelow, eventName, event);
      // Remember the latest element the mouse was over.
      nonBlockLastElem = elBelow;
    };
  });
})();
