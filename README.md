# Tiny Flap
An open-source clone of the famous Flappy Bird game.
Programmed in javascript and making use of HTML5 Canvas. A completely self contained implementation relying on a single javascript source file.

## Using the code
An example web page `flappy.html` is provided to do quick testing. To use it in any webpage place the code in the header or preferably at the end (for speed purposes).

```html
<canvas id="game" height="300" width="225"></canvas>
<script type="text/javascript" src="main.js"></script>
```

Adding `(new TinyFlap()).create('game')` to the document body's onLoad event.
Feel free to change the canvas size. Tiny Flap should adapt to it.

## Features
A very basic playable version of the game. With improvements to be added soon.

- Small size due to the game being self packaged.
- Images are stored in hardcoded SCLUT form (Shared Colour LookUp Table). Reducing the size.
- Images are drawn using Canvas and stored (therefore scalable)
- Implements the use of HTML5 Canvas
- Double buffering technique improve performance greatly
- Minified version at first upload was ~6KB!

## Known Issues / Improvements
- The bird doesn't collide well with pipes
- Pipes to be drawn from images (aesthetic improvement)
- Collision detection to occur using image pixels to provide 'realism'
- Background images to be added and drawn in game
- Improving the drawing process to reduce usage of methods that take up rendering time (e.g. `fillStyle` for the canvas drawing context)

## SCLUT (Shared Colour LookUp Table)
I created this acronym to best describe the way I was storing the images, I also hear Urban Dictionary has another nice definition.
Colours are defined in an object mapping with the index being a character and the value a CSS compatible colour.
I implemented a cheap compression system as well but could be improved. Works well for large patches of colour.

Examples of how the compression works:

- `0.6#` means repeat `0` for 6 places. So: `000000`
- `2.5#` means repeat `2` for 5 places. So: `22222`

This works well for sequences larger than 4 characters. Anything before and after this 4 character definition should just be considered as uncompressed and not altered in anyway.

## Contributing
I prefer to have 2 spaces instead of tab for indentation. Keeping the prototype style for Tiny Flap would be preferable as it is neat to work with and shouldn't clash with other JS files.

For the minified version I use [packer2.net](http://dean.edwards.name/download/#packer). Seems to provide the smallest code that works. When updating the version please use this or similar. Inform me if there's a better version.

## License
This project uses the GNU Affero GPL v3, see below for details:
```
Tiny Flap - An open-source clone of the famous Flappy Bird game.
Copyright (C) 2014  Luke Fisher <Verexa>

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
```