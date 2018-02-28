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
    function addCSS(css) {
      var styling = document.createElement('style');
      styling.setAttribute('type', 'text/css');
      if (styling.styleSheet) {
        styling.styleSheet.cssText = css; // IE
      } else {
        styling.appendChild(document.createTextNode(css));
      }
      document.getElementsByTagName('head')[0].appendChild(styling);
      return styling;
    }

    addCSS('\n  .nonblock{transition:opacity .3s ease;}\n  .nonblock:hover{opacity:.1 !important;}\n  .nonblock-hide{display:none !important;}\n  .nonblock-cursor-auto{cursor:auto;}\n  .nonblock-cursor-default{cursor:default;}\n  .nonblock-cursor-none{cursor:none;}\n  .nonblock-cursor-context-menu{cursor:context-menu;}\n  .nonblock-cursor-help{cursor:help;}\n  .nonblock-cursor-pointer{cursor:pointer;}\n  .nonblock-cursor-progress{cursor:progress;}\n  .nonblock-cursor-wait{cursor:wait;}\n  .nonblock-cursor-cell{cursor:cell;}\n  .nonblock-cursor-crosshair{cursor:crosshair;}\n  .nonblock-cursor-text{cursor:text;}\n  .nonblock-cursor-vertical-text{cursor:vertical-text;}\n  .nonblock-cursor-alias{cursor:alias;}\n  .nonblock-cursor-copy{cursor:copy;}\n  .nonblock-cursor-move{cursor:move;}\n  .nonblock-cursor-no-drop{cursor:no-drop;}\n  .nonblock-cursor-not-allowed{cursor:not-allowed;}\n  .nonblock-cursor-all-scroll{cursor:all-scroll;}\n  .nonblock-cursor-col-resize{cursor:col-resize;}\n  .nonblock-cursor-row-resize{cursor:row-resize;}\n  .nonblock-cursor-n-resize{cursor:n-resize;}\n  .nonblock-cursor-e-resize{cursor:e-resize;}\n  .nonblock-cursor-s-resize{cursor:s-resize;}\n  .nonblock-cursor-w-resize{cursor:w-resize;}\n  .nonblock-cursor-ne-resize{cursor:ne-resize;}\n  .nonblock-cursor-nw-resize{cursor:nw-resize;}\n  .nonblock-cursor-se-resize{cursor:se-resize;}\n  .nonblock-cursor-sw-resize{cursor:sw-resize;}\n  .nonblock-cursor-ew-resize{cursor:ew-resize;}\n  .nonblock-cursor-ns-resize{cursor:ns-resize;}\n  .nonblock-cursor-nesw-resize{cursor:nesw-resize;}\n  .nonblock-cursor-nwse-resize{cursor:nwse-resize;}\n  .nonblock-cursor-zoom-in{cursor:zoom-in;}\n  .nonblock-cursor-zoom-out{cursor:zoom-out;}\n  .nonblock-cursor-grab{cursor:grab;}\n  .nonblock-cursor-grabbing{cursor:grabbing;}\n  ');

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

    function isNotPropagating(el) {
      return el.classList.contains('nonblock-stoppropagation');
    }

    function getStyle(el) {
      return window.getComputedStyle(el);
      // return style.getPropertyValue('cursor');
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
        if (isNotPropagating(ev.target)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('mouseleave', function (ev) {
      if (isNonBlocking(ev.target)) {
        remCursor(ev.target);
        nonBlockLastElem = null;
        isSelectingText = false;
        if (isNotPropagating(ev.target)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('mouseover', function (ev) {
      if (isNonBlocking(ev.target) && isNotPropagating(ev.target)) {
        ev.stopPropagation();
      }
    }, true);
    document.body.addEventListener('mouseout', function (ev) {
      if (isNonBlocking(ev.target) && isNotPropagating(ev.target)) {
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
        if (isNotPropagating(ev.target)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('mousedown', function (ev) {
      if (isNonBlocking(ev.target)) {
        ev.preventDefault();
        nonblockPass(ev.target, ev, 'onmousedown');
        isSelectingText = null;
        if (isNotPropagating(ev.target)) {
          ev.stopPropagation();
        }
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
        if (isNotPropagating(ev.target)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('click', function (ev) {
      if (isNonBlocking(ev.target)) {
        nonblockPass(ev.target, ev, 'onclick');
        if (isNotPropagating(ev.target)) {
          ev.stopPropagation();
        }
      }
    }, true);
    document.body.addEventListener('dblclick', function (ev) {
      if (isNonBlocking(ev.target)) {
        nonblockPass(ev.target, ev, 'ondblclick');
        if (isNotPropagating(ev.target)) {
          ev.stopPropagation();
        }
      }
    }, true);

    // Fire a DOM event.
    var domEvent = function domEvent(elem, event, origEvent, bubbles) {
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

      // Check if the element changed.
      if (!nonBlockLastElem || nonBlockLastElem !== elBelow) {

        // = Calculate styles

        var hoverStyle = window.getComputedStyle(elBelow, 'hover');
        var hoverStyleMap = {};
        for (var i = 0; i < hoverStyle.length; i++) {
          var style = hoverStyle[i];
          hoverStyleMap[style] = {
            value: hoverStyle.getPropertyValue(style),
            priority: hoverStyle.getPropertyPriority(style)
          };
        }
        // if (elBelow.tagName === 'BUTTON')
        //   debugger;
        elem.classList.remove('nonblock-hide');

        var noHoverStyle = getStyle(elBelow);

        // Calculate styles that were applied while the element was hovered.
        var hoverStyles = [];
        for (var _i = 0; _i < hoverStyle.length; _i++) {
          var _style = hoverStyle[_i];
          var hoverValue = hoverStyleMap[_style]['value'];
          var hoverPriority = hoverStyleMap[_style]['priority'];
          var noHoverValue = noHoverStyle.getPropertyValue(_style);
          var noHoverPriority = noHoverStyle.getPropertyPriority(_style);
          if (hoverValue !== noHoverValue || hoverPriority !== noHoverPriority) {
            hoverStyles.push(_style + ': ' + hoverValue + (hoverPriority ? ' !' + hoverPriority : '') + ';');
          }
        }
        console.log(hoverStyles);

        // Calculate cursor.
        var cursorStyle = noHoverStyle.getPropertyValue('cursor');
        isOverTextNode = false;
        if (cursorStyle === 'auto' && elBelow.tagName === 'A') {
          cursorStyle = 'pointer';
        } else if ((!whitespaceBefore.length || offset > whitespaceBefore.length) && offset < text.length) {
          if (cursorStyle === 'auto') {
            cursorStyle = 'text';
          }
          isOverTextNode = true;
        }

        // = Handle text selection

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

        // = Apply styles

        setCursor(elem, cursorStyle !== 'auto' ? cursorStyle : 'default');
        if (elBelow.nonBlockStyleElem) {
          elBelow.nonBlockStyleElem.parentNode.removeChild(elBelow.nonBlockStyleElem);
          elBelow.classList.remove(elBelow.nonBlockStyleClassName);
          delete elBelow.nonBlockStyleClassName;
          delete elBelow.nonBlockStyleElem;
        }
        if (hoverStyles.length) {
          elBelow.nonBlockStyleClassName = 'nonblock-hover-' + Math.floor(Math.random() * 9007199254740991);
          elBelow.nonBlockStyleElem = addCSS('.' + elBelow.nonBlockStyleClassName + '{\n' + hoverStyles.join('\n') + '\n}');
          elBelow.classList.add(elBelow.nonBlockStyleClassName);
        }

        // = Simulate mouse events

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
      } else {
        elem.classList.remove('nonblock-hide');
      }

      // Forward the event.
      domEvent(elBelow, eventName, event);

      // Remember the latest element the mouse was over.
      nonBlockLastElem = elBelow;
    };
  });
})();
