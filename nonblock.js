/**
 * NonBlock.js.
 *
 * Code style: http://standardjs.com/
 *
 * Copyright (c) 2017 Hunter Perrin
 *
 * @author Hunter Perrin <hperrin@gmail.com>
 */
'use strict'

document.addEventListener('DOMContentLoaded', function () {
  // This keeps track of the last element the mouse was over, so
  // mouseleave, mouseenter, etc can be called.
  let nonblockLastElBelow
  // Some useful regexes.
  const re_on = /^on/
  const re_mouse_events = /^(dbl)?click$|^mouse(move|down|up|over|out|enter|leave)$|^contextmenu$/
  const re_ui_events = /^(focus|blur|select|change|reset)$|^key(press|down|up)$/
  const re_html_events = /^(scroll|resize|(un)?load|abort|error)$/

  function isNonBlocking (el) {
    return el.classList.contains('nonblock-enabled')
  }

  function getCursor (el) {
    const style = window.getComputedStyle(el)
    return style.getPropertyValue('cursor')
  }

  function setCursor (el, value) {
    remCursor(el)
    el.classList.add('nonblock-cursor-' + value)
  }

  function remCursor (el) {
    ;[...el.classList.values()].forEach((className) => {
      if (className.indexOf('nonblock-cursor-') === 0) {
        el.classList.remove(className)
      }
    })
  }

  document.body.addEventListener('mouseenter', (ev) => {
    if (isNonBlocking(ev.target)) {
      nonblock_elem = ev.target
    }
  }, true)
  document.body.addEventListener('mouseleave', (ev) => {
    if (isNonBlocking(ev.target)) {
      remCursor(ev.target)
      nonblockLastElBelow = null
    }
  }, true)
  document.body.addEventListener('mouseover', (ev) => {
  }, true)
  document.body.addEventListener('mouseout', (ev) => {
  }, true)
  document.body.addEventListener('mousemove', (ev) => {
   if (isNonBlocking(ev.target)) {
     nonblockPass(ev.target, ev, 'onmousemove')
   }
  }, true)
  document.body.addEventListener('mousedown', (ev) => {
    if (isNonBlocking(ev.target)) {
      ev.preventDefault()
      nonblockPass(ev.target, ev, 'onmousedown')
    }
  }, true)
  document.body.addEventListener('mouseup', (ev) => {
    if (isNonBlocking(ev.target)) {
      ev.preventDefault()
      nonblockPass(ev.target, ev, 'onmouseup')
    }
  }, true)
  document.body.addEventListener('click', (ev) => {
    if (isNonBlocking(ev.target)) {
      nonblockPass(ev.target, ev, 'onclick')
    }
  }, true)
  document.body.addEventListener('dblclick', (ev) => {
    if (isNonBlocking(ev.target)) {
      nonblockPass(ev.target, ev, 'ondblclick')
    }
  }, true)

  // Fire a DOM event.
  const domEvent = (el, evName, ev) => {
    let eventObject
    evName = evName.toLowerCase()
    if (document.createEvent && el.dispatchEvent) {
      // FireFox, Opera, Safari, Chrome
      evName = evName.replace(re_on, '')
      if (evName.match(re_mouse_events)) {
        // This allows the click event to fire on the el. There is
        // probably a much better way to do it.
        el.getBoundingClientRect()
        eventObject = document.createEvent('MouseEvents')
        eventObject.initMouseEvent(evName, ev.bubbles, ev.cancelable,
            ev.view, ev.detail, ev.screenX, ev.screenY, ev.clientX,
            ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey,
            ev.button, ev.relatedTarget)
      } else if (evName.match(re_ui_events)) {
        eventObject = document.createEvent('UIEvents')
        eventObject.initUIEvent(evName, ev.bubbles, ev.cancelable,
            ev.view, ev.detail)
      } else if (evName.match(re_html_events)) {
        eventObject = document.createEvent('HTMLEvents')
        eventObject.initEvent(evName, ev.bubbles, ev.cancelable)
      }
      if (!eventObject) return
      el.dispatchEvent(eventObject)
    } else {
      // Internet Explorer
      if (!evName.match(re_on)) evName = 'on' + evName
      eventObject = document.createEventObject(ev)
      el.fireEvent(evName, eventObject)
    }
  }

  // This is used to pass events through the el if it is non-blocking.
  const nonblockPass = (el, ev, evName) => {
    el.classList.add('nonblock-hide')
    const elBelow = document.elementFromPoint(ev.clientX, ev.clientY)
    let range, textNode, offset
    if (document.caretPositionFromPoint) {
      range = document.caretPositionFromPoint(ev.clientX, ev.clientY)
      textNode = range.offsetNode
      offset = range.offset
    } else if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(ev.clientX, ev.clientY)
      textNode = range.startContainer
      offset = range.startOffset
    }
    console.log('range:', range)
    console.log('textNode:', textNode)
    console.log('offset:', offset)
    el.classList.remove('nonblock-hide')
    let cursorStyle = getCursor(elBelow)
    if (cursorStyle === 'auto' && elBelow.tagName === 'A') {
      cursorStyle = 'pointer'
    }
    setCursor(el, cursorStyle !== 'auto' ? cursorStyle : 'default')
    // If the element changed, call mouseenter, mouseleave, etc.
    if (!nonblockLastElBelow || nonblockLastElBelow !== elBelow) {
      if (nonblockLastElBelow) {
        domEvent(nonblockLastElBelow, 'mouseleave', ev)
        domEvent(nonblockLastElBelow, 'mouseout', ev)
      }
      domEvent(elBelow, 'mouseenter', ev)
      domEvent(elBelow, 'mouseover', ev)
    }
    domEvent(elBelow, evName, ev)
    // Remember the latest element the mouse was over.
    nonblockLastElBelow = elBelow
  }
  /*
  const els = document.getElementsByClassName('nonblock-enabled')
  Array.prototype.forEach.call(els, (el) => {
    el.addEventListener('mouseenter', (ev) => {
      ev.target.style.opacity = '.2'
    }, true)
    el.addEventListener('mouseleave', (ev) => {
      ev.target.style.opacity = '1'
    }, true)
  })
  const doTheThing = () => {
    const els = document.getElementsByClassName('nonblock-enabled')
    Array.prototype.forEach.call(els, (el) => {
      el.style.display = 'none'
    })
    window.requestAnimationFrame(() => {
      Array.prototype.forEach.call(els, (el) => {
        el.style.display = 'block'
      })
      setTimeout(doTheThing, 0)
    })
  }
  setTimeout(doTheThing, 0)
  */
})
