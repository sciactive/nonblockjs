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

Add the class `nonblock-stoppropagation` if you want NonBlock.js to stop event propagation for mouse events, effectively disguising it from its ancestors.

## Demos

https://sciactive.github.io/nonblockjs/

## Author

NonBlock.js was written by Hunter Perrin as part of [PNotify](https://github.com/sciactive/pnotify).
