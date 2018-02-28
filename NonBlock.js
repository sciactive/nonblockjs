/**
 * NonBlock.js
 *
 * Copyright (c) 2017-2018 Hunter Perrin
 *
 * @author Hunter Perrin <hperrin@gmail.com>
 */
'use strict';

((init) => {
  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})(() => {
  function addCSS(css) {
    const styling = document.createElement('style');
    styling.setAttribute('type', 'text/css');
    if (styling.styleSheet) {
      styling.styleSheet.cssText = css; // IE
    } else {
      styling.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(styling);
    return styling;
  }

  addCSS(`
  .nonblock{transition:opacity .3s ease;}
  .nonblock:hover{opacity:.1 !important;}
  .nonblock-hide{display:none !important;}
  .nonblock-cursor-auto{cursor:auto;}
  .nonblock-cursor-default{cursor:default;}
  .nonblock-cursor-none{cursor:none;}
  .nonblock-cursor-context-menu{cursor:context-menu;}
  .nonblock-cursor-help{cursor:help;}
  .nonblock-cursor-pointer{cursor:pointer;}
  .nonblock-cursor-progress{cursor:progress;}
  .nonblock-cursor-wait{cursor:wait;}
  .nonblock-cursor-cell{cursor:cell;}
  .nonblock-cursor-crosshair{cursor:crosshair;}
  .nonblock-cursor-text{cursor:text;}
  .nonblock-cursor-vertical-text{cursor:vertical-text;}
  .nonblock-cursor-alias{cursor:alias;}
  .nonblock-cursor-copy{cursor:copy;}
  .nonblock-cursor-move{cursor:move;}
  .nonblock-cursor-no-drop{cursor:no-drop;}
  .nonblock-cursor-not-allowed{cursor:not-allowed;}
  .nonblock-cursor-all-scroll{cursor:all-scroll;}
  .nonblock-cursor-col-resize{cursor:col-resize;}
  .nonblock-cursor-row-resize{cursor:row-resize;}
  .nonblock-cursor-n-resize{cursor:n-resize;}
  .nonblock-cursor-e-resize{cursor:e-resize;}
  .nonblock-cursor-s-resize{cursor:s-resize;}
  .nonblock-cursor-w-resize{cursor:w-resize;}
  .nonblock-cursor-ne-resize{cursor:ne-resize;}
  .nonblock-cursor-nw-resize{cursor:nw-resize;}
  .nonblock-cursor-se-resize{cursor:se-resize;}
  .nonblock-cursor-sw-resize{cursor:sw-resize;}
  .nonblock-cursor-ew-resize{cursor:ew-resize;}
  .nonblock-cursor-ns-resize{cursor:ns-resize;}
  .nonblock-cursor-nesw-resize{cursor:nesw-resize;}
  .nonblock-cursor-nwse-resize{cursor:nwse-resize;}
  .nonblock-cursor-zoom-in{cursor:zoom-in;}
  .nonblock-cursor-zoom-out{cursor:zoom-out;}
  .nonblock-cursor-grab{cursor:grab;}
  .nonblock-cursor-grabbing{cursor:grabbing;}
  `);

  // This keeps track of the last element the mouse was over, so
  // mouseleave, mouseenter, etc can be called.
  let nonBlockLastElem;
  // These is used for selecting text under a nonblock element.
  let isOverTextNode = false;
  let isSelectingText = false;
  // Some useful regexes.
  const regexOn = /^on/,
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
    [...el.classList.values()].forEach((className) => {
      if (className.indexOf('nonblock-cursor-') === 0) {
        el.classList.remove(className);
      }
    });
  }

  document.body.addEventListener('mouseenter', (ev) => {
    if (isNonBlocking(ev.target)) {
      nonBlockLastElem = ev.target;
      if (isNotPropagating(ev.target)) {
        ev.stopPropagation();
      }
    }
  }, true);
  document.body.addEventListener('mouseleave', (ev) => {
    if (isNonBlocking(ev.target)) {
      remCursor(ev.target);
      nonBlockLastElem = null;
      isSelectingText = false;
      if (isNotPropagating(ev.target)) {
        ev.stopPropagation();
      }
    }
  }, true);
  document.body.addEventListener('mouseover', (ev) => {
    if (isNonBlocking(ev.target) && isNotPropagating(ev.target)) {
      ev.stopPropagation();
    }
  }, true);
  document.body.addEventListener('mouseout', (ev) => {
    if (isNonBlocking(ev.target) && isNotPropagating(ev.target)) {
      ev.stopPropagation();
    }
  }, true);
  document.body.addEventListener('mousemove', (ev) => {
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
  document.body.addEventListener('mousedown', (ev) => {
    if (isNonBlocking(ev.target)) {
      ev.preventDefault();
      nonblockPass(ev.target, ev, 'onmousedown');
      isSelectingText = null;
      if (isNotPropagating(ev.target)) {
        ev.stopPropagation();
      }
    }
  }, true);
  document.body.addEventListener('mouseup', (ev) => {
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
  document.body.addEventListener('click', (ev) => {
    if (isNonBlocking(ev.target)) {
      nonblockPass(ev.target, ev, 'onclick');
      if (isNotPropagating(ev.target)) {
        ev.stopPropagation();
      }
    }
  }, true);
  document.body.addEventListener('dblclick', (ev) => {
    if (isNonBlocking(ev.target)) {
      nonblockPass(ev.target, ev, 'ondblclick');
      if (isNotPropagating(ev.target)) {
        ev.stopPropagation();
      }
    }
  }, true);

  // Fire a DOM event.
  const domEvent = (elem, event, origEvent, bubbles) => {
    let eventObject;
    event = event.toLowerCase();
    if (document.createEvent && elem.dispatchEvent) {
      // FireFox, Opera, Safari, Chrome
      event = event.replace(regexOn, '');
      if (event.match(regexMouseEvents)) {
        // This allows the click event to fire on the notice. There is
        // probably a much better way to do it.
        elem.getBoundingClientRect();
        eventObject = document.createEvent("MouseEvents");
        eventObject.initMouseEvent(
          event,
          bubbles === undefined ? origEvent.bubbles : bubbles,
          origEvent.cancelable,
          origEvent.view,
          origEvent.detail,
          origEvent.screenX,
          origEvent.screenY,
          origEvent.clientX,
          origEvent.clientY,
          origEvent.ctrlKey,
          origEvent.altKey,
          origEvent.shiftKey,
          origEvent.metaKey,
          origEvent.button,
          origEvent.relatedTarget
        );
      } else if (event.match(regexUiEvents)) {
        eventObject = document.createEvent("UIEvents");
        eventObject.initUIEvent(event, bubbles === undefined ? origEvent.bubbles : bubbles, origEvent.cancelable, origEvent.view, origEvent.detail);
      } else if (event.match(regexHtmlEvents)) {
        eventObject = document.createEvent("HTMLEvents");
        eventObject.initEvent(event, bubbles === undefined ? origEvent.bubbles : bubbles, origEvent.cancelable);
      }
      if (!eventObject) {
        return
      };
      elem.dispatchEvent(eventObject);
    } else {
      // Internet Explorer
      if (!event.match(regexOn)) {
        event = "on"+event
      };
      eventObject = document.createEventObject(origEvent);
      elem.fireEvent(event, eventObject);
    }
  };

  // This is used to pass events through the el if it is nonblocking.
  const nonblockPass = (elem, event, eventName) => {
    elem.classList.add('nonblock-hide');
    const elBelow = document.elementFromPoint(event.clientX, event.clientY);
    let range, textNode, whitespaceBefore, text, offset;
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

      setTimeout(() => {
        // = Calculate styles

        let hoverStyle = getStyle(elBelow);
        let hoverStyleMap = {};
        for (let i = 0; i < hoverStyle.length; i++) {
          const style = hoverStyle[i];
          hoverStyleMap[style] = {
            value: hoverStyle.getPropertyValue(style),
            priority: hoverStyle.getPropertyPriority(style)
          };
        }
        // if (elBelow.tagName === 'BUTTON')
        //   debugger;
        elem.classList.remove('nonblock-hide');

        setTimeout(() => {
          let noHoverStyle = getStyle(elBelow);

          // Calculate styles that were applied while the element was hovered.
          let hoverStyles = [];
          for (let i = 0; i < hoverStyle.length; i++) {
            const style = hoverStyle[i];
            const hoverValue = hoverStyleMap[style]['value'];
            const hoverPriority = hoverStyleMap[style]['priority'];
            const noHoverValue = noHoverStyle.getPropertyValue(style);
            const noHoverPriority = noHoverStyle.getPropertyPriority(style);
            if (hoverValue !== noHoverValue || hoverPriority !== noHoverPriority) {
              hoverStyles.push(style+': '+hoverValue+(hoverPriority ? ' !'+hoverPriority : '')+';');
            }
          }
          console.log(hoverStyles);

          // Calculate cursor.
          let cursorStyle = noHoverStyle.getPropertyValue('cursor');
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
            const selection = window.getSelection();
            let selectionRange, addRange = false;
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
            elBelow.nonBlockStyleClassName = 'nonblock-hover-'+Math.floor(Math.random() * 9007199254740991);
            elBelow.nonBlockStyleElem = addCSS('.'+elBelow.nonBlockStyleClassName+'{\n'+hoverStyles.join('\n')+'\n}');
            elBelow.classList.add(elBelow.nonBlockStyleClassName);
          }
        }, 100);
      }, 100);

      // = Simulate mouse events

      if (nonBlockLastElem) {
        const lastElem = nonBlockLastElem;
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
