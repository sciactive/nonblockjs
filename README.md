# NonBlock.js

Unobtrusive (click through) UI elements in JavaScript.

NonBlock.js lets you provide unobstrusive UI elements. They will fade when a user hovers over them, and let the user select and interact with elements under them.

## Installation

### Install via NPM with:

```sh
npm install --save nonblockjs
```

```html
<script src="node_modules/nonblockjs/NonBlock.es5.js" type="text/javascript"></script>
```

### Or use jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/nonblockjs@1/NonBlock.es5.js" type="text/javascript"></script>
```

## Usage

Add the class `nonblock` to any element you want to make nonblocking.

By default, NonBlock.js will propagate mouse events that are unrelated to clicking the mouse.

Add the class `nonblock-stop-propagation` if you want NonBlock.js to stop event propagation for all mouse events, effectively disguising it from its ancestors.

Add the class `nonblock-allow-action-propagation` if you want NonBlock.js to allow event propagation for action events (related to clicking the mouse). This may cause components that are designed to open on mouse clicks (like dropdown menus) to detect the click on the nonblocking element and mistakenly assume the user has clicked elsewhere and make the component inaccessible (close the menu).

## Demos

https://sciactive.github.io/nonblockjs/

## Author

NonBlock.js was written by Hunter Perrin as part of [PNotify](https://github.com/sciactive/pnotify).
