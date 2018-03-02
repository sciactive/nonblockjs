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
  const styling = document.createElement('style');
  styling.setAttribute('type', 'text/css');
  const css = `
  .nonblock{transition:opacity .3s ease;}
  .nonblock:hover{opacity:.1 !important;}
  .nonblock-hide{display:none !important;}
  .nonblock-cursor-auto{cursor:auto !important;}
  .nonblock-cursor-default{cursor:default !important;}
  .nonblock-cursor-none{cursor:none !important;}
  .nonblock-cursor-context-menu{cursor:context-menu !important;}
  .nonblock-cursor-help{cursor:help !important;}
  .nonblock-cursor-pointer{cursor:pointer !important;}
  .nonblock-cursor-progress{cursor:progress !important;}
  .nonblock-cursor-wait{cursor:wait !important;}
  .nonblock-cursor-cell{cursor:cell !important;}
  .nonblock-cursor-crosshair{cursor:crosshair !important;}
  .nonblock-cursor-text{cursor:text !important;}
  .nonblock-cursor-vertical-text{cursor:vertical-text !important;}
  .nonblock-cursor-alias{cursor:alias !important;}
  .nonblock-cursor-copy{cursor:copy !important;}
  .nonblock-cursor-move{cursor:move !important;}
  .nonblock-cursor-no-drop{cursor:no-drop !important;}
  .nonblock-cursor-not-allowed{cursor:not-allowed !important;}
  .nonblock-cursor-all-scroll{cursor:all-scroll !important;}
  .nonblock-cursor-col-resize{cursor:col-resize !important;}
  .nonblock-cursor-row-resize{cursor:row-resize !important;}
  .nonblock-cursor-n-resize{cursor:n-resize !important;}
  .nonblock-cursor-e-resize{cursor:e-resize !important;}
  .nonblock-cursor-s-resize{cursor:s-resize !important;}
  .nonblock-cursor-w-resize{cursor:w-resize !important;}
  .nonblock-cursor-ne-resize{cursor:ne-resize !important;}
  .nonblock-cursor-nw-resize{cursor:nw-resize !important;}
  .nonblock-cursor-se-resize{cursor:se-resize !important;}
  .nonblock-cursor-sw-resize{cursor:sw-resize !important;}
  .nonblock-cursor-ew-resize{cursor:ew-resize !important;}
  .nonblock-cursor-ns-resize{cursor:ns-resize !important;}
  .nonblock-cursor-nesw-resize{cursor:nesw-resize !important;}
  .nonblock-cursor-nwse-resize{cursor:nwse-resize !important;}
  .nonblock-cursor-zoom-in{cursor:zoom-in !important;}
  .nonblock-cursor-zoom-out{cursor:zoom-out !important;}
  .nonblock-cursor-grab{cursor:grab !important;}
  .nonblock-cursor-grabbing{cursor:grabbing !important;}
  `;
  if (styling.styleSheet) {
    styling.styleSheet.cssText = css; // IE
  } else {
    styling.appendChild(document.createTextNode(css));
  }
  document.getElementsByTagName('head')[0].appendChild(styling);

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

  function getNonBlocking(el) {
    let nonblock = el;
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
    const style = window.getComputedStyle(el);
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
    [...el.classList.values()].forEach((className) => {
      if (className.indexOf('nonblock-cursor-') === 0) {
        el.classList.remove(className);
      }
    });
  }

  document.body.addEventListener('mouseenter', (ev) => {
    let nonblock;
    if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
      nonBlockLastElem = nonblock;
      if (isNotPropagating(nonblock)) {
        ev.stopPropagation();
      }
    }
  }, true);
  document.body.addEventListener('mouseleave', (ev) => {
    let nonblock;
    if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
      remCursor(nonblock);
      nonBlockLastElem = null;
      isSelectingText = false;
      if (isNotPropagating(nonblock)) {
        ev.stopPropagation();
      }
    }
  }, true);
  document.body.addEventListener('mouseover', (ev) => {
    let nonblock;
    if (ev.isTrusted && (nonblock = getNonBlocking(ev.target)) && isNotPropagating(nonblock)) {
      ev.stopPropagation();
    }
  }, true);
  document.body.addEventListener('mouseout', (ev) => {
    let nonblock;
    if (ev.isTrusted && (nonblock = getNonBlocking(ev.target)) && isNotPropagating(nonblock)) {
      ev.stopPropagation();
    }
  }, true);
  document.body.addEventListener('mousemove', (ev) => {
   let nonblock;
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
  document.body.addEventListener('mousedown', (ev) => {
    let nonblock;
    if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
      nonblockPass(nonblock, ev, 'onmousedown');
      isSelectingText = null;
      if (isNotPropagating(nonblock) || isActionNotPropagating(nonblock)) {
        ev.stopPropagation();
      }
    }
  }, true);
  document.body.addEventListener('mouseup', (ev) => {
    let nonblock;
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
  document.body.addEventListener('click', (ev) => {
    let nonblock;
    if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
      nonblockPass(nonblock, ev, 'onclick');
      if (isNotPropagating(nonblock) || isActionNotPropagating(nonblock)) {
        ev.stopPropagation();
      }
    }
  }, true);
  document.body.addEventListener('dblclick', (ev) => {
    let nonblock;
    if (ev.isTrusted && (nonblock = getNonBlocking(ev.target))) {
      nonblockPass(nonblock, ev, 'ondblclick');
      if (isNotPropagating(nonblock) || isActionNotPropagating(nonblock)) {
        ev.stopPropagation();
      }
    }
  }, true);

  // Fire a DOM event.
  let useEventConstructors = true;
  try {
    const e = new MouseEvent('click');
  } catch (e) {
    useEventConstructors = false;
  }
  const domEvent = (elem, event, origEvent, bubbles) => {
    let eventObject;
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
    let cursorStyle = getCursor(elBelow);
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

    setCursor(elem, cursorStyle !== 'auto' ? cursorStyle : 'default');
    // If the element changed, call mouseenter, mouseleave, etc.
    if (!nonBlockLastElem || nonBlockLastElem !== elBelow) {
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
    }
    domEvent(elBelow, eventName, event);
    // Remember the latest element the mouse was over.
    nonBlockLastElem = elBelow;
  };
});
