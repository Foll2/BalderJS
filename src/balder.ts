/**
* BalderJS
* version 14.0 (2025-08-13)
* Mattias Steinwall
* Baldergymnasiet, Skellefteå, Sweden
*/


const _canvas = document.createElement("div");
_canvas.id = "_canvas";

const _io = document.createElement("div");
_io.id = "_io";
_io.hidden = true;

const _console = document.createElement("div");
_console.id = "_console";

document.body.append(_canvas, _io, _console);

const _canvasLayers: Record<number, HTMLCanvasElement> = {};
const _ctxs: Record<number, CanvasRenderingContext2D> = {};
let _layer: number;

/**
 * BalderJS
 * 
 * The rendering context for the current canvas layer. 
 * For customized graphics.
 * @example
 * Draw a tilted filled yellow half-ellipse:
 * ```
 * ctx.ellipse(100, 100, 100, 50, radians(45), 0, radians(180))
 * ctx.fillStyle = "yellow"
 * ctx.fill()
 * ```
 */
let ctx: CanvasRenderingContext2D;

/**
 * BalderJS
 * 
 * Returns the width, in pixels, of the canvas. See also `H`.
 * @example 
 * Draw a circle in the middle of the canvas:
 * ```
 * circle(W / 2, H / 2, 100)
 * ```
 * @example 
 * Draw a line from the top left corner to the bottom right corner of the canvas.
 * ```
 * line(0, 0, W, H)
 * ```
 */
const W = parseInt(getComputedStyle(_canvas).width);

/**
 * BalderJS
 * 
 * Returns the height, in pixels, of the canvas. See also `W`.
 * @example 
 * Draw a circle in the middle of the canvas:
 * ```
 * circle(W / 2, H / 2, 100)
 * ```
 * @example 
 * Draw a line from the top left corner to the bottom right corner of the canvas.
 * ```
 * line(0, 0, W, H)
 * ```
*/
const H = parseInt(getComputedStyle(_canvas).height);

/**
 * BalderJS
 *
 * Draws an ellipse on the canvas with center in (`x`, `y`).
 */
function ellipse(
    x: number, y: number,
    radiusX: number,
    radiusY: number,
    color: string = "black",
    lineWidth?: number
) {
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI)

    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

/**
 * BalderJS
 *
 * Draws a circle on the canvas with center in (`x`, `y`).
 * @example 
 * Draw a filled circle with default color:
 * ```
 * circle(100, 50, 50)
 * ```
 * @example 
 * Draw a filled red circle:
 * ```
 * circle(100, 50, 50, "red")
 * ```
 * @example 
 * Draw a blue circle with a line width of 5 pixels:
 * ```
 * circle(100, 50, 50, "blue", 5)
 * ```
 */
function circle(
    x: number, y: number,
    radius: number,
    color?: string,
    lineWidth?: number
) {
    ellipse(x, y, radius, radius, color, lineWidth);
}

/**
 * BalderJS
 * 
 * Clears the canvas.
 * @example 
 * Clear the canvas:
 * ```
 * clear()
 * ```
 * @example 
 * Clear a rectangular part of the canvas with upper left corner in (`100`, `50`):
 * ```
 * clear(100, 50, 400, 300)
 * ```
 */
function clear(x = 0, y = 0, width = W, height = H) {
    ctx.clearRect(x, y, width, height);
}

/**
 * BalderJS
 * 
 * Fills the canvas with given color.
 * @example 
 * ```
 * fill("blue")
 * ``` 
*/
function fill(color = "black") {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
}

/**
 * BalderJS
 * 
 * Gets color information, as a 4-tuple, for a given pixel.
 * Values `r`(ed), `g`(reen), `b`(lue) and `a`(lpha) are all in the interval 0 to 255.
 * @example 
 * ```
 * circle(50, 100, 30, randomItem("red", "green", "blue"))
 * text(getPixel(50, 100))
 * ``` 
*/
function getPixel(x: number, y: number) {
    return Array.from(ctx.getImageData(x, y, 1, 1).data) as [r: number, g: number, b: number, a: number];
}

/**
 * BalderJS
 * 
 */
async function fetchImages(...paths: string[]) {
    return await Promise.all(paths.map(path =>
        new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", () => reject(new Error(`'${path}' can not be loaded`)));
            image.src = path;
        })
    ));
}

/**
 * BalderJS
 * 
 */
async function fetchImage(path: string) {
    return (await fetchImages(path))[0];
}

/**
 * BalderJS
 * 
 */
function imageFromDataURL(dataURL: string) {
    const image = new Image();
    image.src = dataURL;

    return image;
}

/**
 * BalderJS
 * 
 * Draws a polygon on the canvas with edges in the `points`-array.
 * @example 
 * Draw a red diamond shape:
 * ```
 * polygon([[100, 100], [140, 160], [100, 220], [60, 160]], "red")
 * ```
 */
function polygon(
    points: [x: number, y: number][],
    color = "black",
    lineWidth?: number
) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(...points[i])
    }
    ctx.closePath();

    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

/**
 * BalderJS
 * 
 * Draws a line on the canvas between (`x1`, `y1`) and (`x2`, `y2`).
 * @example 
 * Draw two thick blue lines across the canvas:
 * ```
 * line(0, 0, W, H, "blue", 20)
 * line(0, H, W, 0, "blue", 20)
 * ```
 */
function line(
    x1: number, y1: number,
    x2: number, y2: number,
    color = "black",
    lineWidth = 1
) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

/**
 * BalderJS
 * 
 * Draws a rectangle on the canvas with upper left corner in (`x`, `y`).
 */
function rectangle(
    x: number, y: number,
    width: number, height: number,
    color = "black",
    lineWidth?: number
) {
    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, width, height);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }
}

/**
 * BalderJS
 * 
 * Draws a square on the canvas with upper left corner in (`x`, `y`).
 */
function square(
    x: number, y: number,
    side: number,
    color?: string,
    lineWidth?: number
) {
    rectangle(x, y, side, side, color, lineWidth)
}

/**
 * BalderJS
 * 
 */
function str(value: unknown): string {
    if (Array.isArray(value)) {
        return "[" + value.map(item => str(item)).join(",") + "]"
    } else if (typeof value == "object" &&
        ((value != null && Object.getPrototypeOf(value) === Object.prototype && value.toString == Object.prototype.toString))) {
        return JSON.stringify(value);
    } else {
        return String(value);
    }
}

/**
 * BalderJS
 * 
 * Draws `value` as a string on the canvas. The baseline is set by `y`. 
 * @example
 * Draw 'Hello world!' with the lower left corner in (`100`, `50`):
 * ```
 * text("Hello world!", 100, 50, 36, "red")
 * ```
 * @example
 * Draw 'abcd' right-aligned to the right:
 * ```
 * text("abcd", [W, "right"])
 * ```
 * @example
 * Draw 'abcd' center-aligned to the middle:
 * ```
 * text("abcd", [W / 2, "center"])
 * ```
 */
function text(
    value: unknown,
    x: number | [number, "left" | "center" | "right"] = 0,
    y: number | [number, "top" | "center" | "bottom"] = 16,
    fontSize = 16,
    color = "black"
) {
    ctx.font = fontSize + "px consolas,monospace"
    const _text = str(value);

    if (typeof x != "number") {
        const w = ctx.measureText(_text).width;

        switch (x[1]) {
            case "left": x = x[0]; break;
            case "center": x = x[0] - w / 2; break;
            case "right": x = x[0] - w; break;
        }
    }

    if (typeof y != "number") {
        const h = ctx.measureText(_text).actualBoundingBoxAscent;

        switch (y[1]) {
            case "top": y = y[0] + h; break;
            case "center": y = y[0] + h / 2; break;
            case "bottom": y = y[0]; break;
        }
    }

    ctx.fillStyle = color;
    ctx.fillText(_text, x, y);
}

/**
 * BalderJS
 * 
 * Draws a triangle on the canvas with corners in (`x1`, `y1`), (`x2`, `y2`) and (`x3`, `y3`).
 * @example 
 * Draw a triangle with corners in (`100`, `50`), (`200`, `50`) and (`200`, `150`).
 * ```
 * triangle(100, 50, 200, 50, 200, 150)
 * ```
 * @example 
 * Draw a red triangle:
 * ```
 * triangle(100, 150, 200, 150, 200, 250, "red")
 * ```
 * @example 
 * Draw a blue triangle with linewidth 2:
 * ```
 * triangle(100, 250, 200, 250, 200, 350, "blue", 2)
 * ```
 */
function triangle(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    color = "black",
    lineWidth?: number
) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();

    if (lineWidth !== undefined) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

/**
 * BalderJS
 * 
 * An object for keyboard input.
 * 
 * @example
 * ```
 * update = () => {
 *     clear()
 *     if (keyboard.w) {
 *         text("key W")
 *     }
 * }
 * ``` 
 * @example
 * ```
 * update = () => {
 *     if (keyboard.keys["KeyR"]) {
 *         fill("red")
 *     }
 * }
 * ``` 
 */
const keyboard = {
    /**
     * Returns true if any key is pressed.
     * @example
     * update = () => {
     *     clear()
     *     if (keyboard.pressed) {
     *         text("Any key pressed!")
     *     }
     * }
    */
    get pressed() { return Object.keys(_keys).some(value => _keys[value] === true) },
    /**
     * Returns the latest key pressed. Not affected by the  keyboard layout.
      * @example
      * update = () => {
      *     clear()
      *     text(keyboard.keyName)
      * }
      */
    get keyName() { return _keyName },
    /**
     * Returns the state of all keys.
     */
    get keys() { return _keys },

    get space(): boolean { return !!_keys["Space"]; }, set space(value: false) { _keys["Space"] = value; },
    get tab(): boolean { return !!_keys["Tab"]; }, set tab(value: false) { _keys["Tab"] = value; },
    get enter(): boolean { return !!_keys["Enter"]; }, set enter(value: false) { _keys["Enter"] = value; },
    get escape(): boolean { return !!_keys["Escape"]; }, set escape(value: false) { _keys["Escape"] = value; },

    get left(): boolean { return !!_keys["ArrowLeft"]; }, set left(value: false) { _keys["ArrowLeft"] = value; },
    get up(): boolean { return !!_keys["ArrowUp"]; }, set up(value: false) { _keys["ArrowUp"] = value; },
    get right(): boolean { return !!_keys["ArrowRight"]; }, set right(value: false) { _keys["ArrowRight"] = value; },
    get down(): boolean { return !!_keys["ArrowDown"]; }, set down(value: false) { _keys["ArrowDown"] = value; },

    get a(): boolean { return !!_keys["KeyA"]; }, set a(value: false) { _keys["KeyA"] = value; },
    get b(): boolean { return !!_keys["KeyB"]; }, set b(value: false) { _keys["KeyB"] = value; },
    get c(): boolean { return !!_keys["KeyC"]; }, set c(value: false) { _keys["KeyC"] = value; },
    get d(): boolean { return !!_keys["KeyD"]; }, set d(value: false) { _keys["KeyD"] = value; },
    get e(): boolean { return !!_keys["KeyE"]; }, set e(value: false) { _keys["KeyE"] = value; },
    get f(): boolean { return !!_keys["KeyF"]; }, set f(value: false) { _keys["KeyF"] = value; },
    get g(): boolean { return !!_keys["KeyG"]; }, set g(value: false) { _keys["KeyG"] = value; },
    get h(): boolean { return !!_keys["KeyH"]; }, set h(value: false) { _keys["KeyH"] = value; },
    get i(): boolean { return !!_keys["KeyI"]; }, set i(value: false) { _keys["KeyI"] = value; },
    get j(): boolean { return !!_keys["KeyJ"]; }, set j(value: false) { _keys["KeyJ"] = value; },
    get k(): boolean { return !!_keys["KeyK"]; }, set k(value: false) { _keys["KeyK"] = value; },
    get l(): boolean { return !!_keys["KeyL"]; }, set l(value: false) { _keys["KeyL"] = value; },
    get m(): boolean { return !!_keys["KeyM"]; }, set m(value: false) { _keys["KeyM"] = value; },
    get n(): boolean { return !!_keys["KeyN"]; }, set n(value: false) { _keys["KeyN"] = value; },
    get o(): boolean { return !!_keys["KeyO"]; }, set o(value: false) { _keys["KeyO"] = value; },
    get p(): boolean { return !!_keys["KeyP"]; }, set p(value: false) { _keys["KeyP"] = value; },
    get q(): boolean { return !!_keys["KeyQ"]; }, set q(value: false) { _keys["KeyQ"] = value; },
    get r(): boolean { return !!_keys["KeyR"]; }, set r(value: false) { _keys["KeyR"] = value; },
    get s(): boolean { return !!_keys["KeyS"]; }, set s(value: false) { _keys["KeyS"] = value; },
    get t(): boolean { return !!_keys["KeyT"]; }, set t(value: false) { _keys["KeyT"] = value; },
    get u(): boolean { return !!_keys["KeyU"]; }, set u(value: false) { _keys["KeyU"] = value; },
    get v(): boolean { return !!_keys["KeyV"]; }, set v(value: false) { _keys["KeyV"] = value; },
    get w(): boolean { return !!_keys["KeyW"]; }, set w(value: false) { _keys["KeyW"] = value; },
    get x(): boolean { return !!_keys["KeyX"]; }, set x(value: false) { _keys["KeyX"] = value; },
    get y(): boolean { return !!_keys["KeyY"]; }, set y(value: false) { _keys["KeyY"] = value; },
    get z(): boolean { return !!_keys["KeyZ"]; }, set z(value: false) { _keys["KeyZ"] = value; },
};

let _keyName: string;
let _keys: Record<string, boolean | null> = {};

_canvas.addEventListener("keydown", event => {
    event.preventDefault();

    if (_keys[event.code] !== false) {
        _keys[event.code] = true;
        _keyName = event.code;
    }
});

_canvas.addEventListener("keyup", event => {
    _keys[event.code] = null;

    switch (event.code) {
        case "ShiftLeft": _keys["ShiftRight"] = null; break;
        case "ShiftRight": _keys["ShiftLeft"] = null; break;
        case "NumpadEnter": _keys["Enter"] = null; break;
        case "Enter": _keys["NumpadEnter"] = null; break;
    }
});

window.addEventListener("blur", () => {
    _keys = {};
});


/**
 * BalderJS
 * 
 * An object for input from mouse or other pointing device.
 */
const mouse = {
    get x() { return _mouseX },
    get y() { return _mouseY },
    get over() { return _mouseOver },

    get left(): boolean { return !!_buttons[0]; }, set left(value: false) { _buttons[0] = value; },
    get right(): boolean { return !!_buttons[2]; }, set right(value: false) { _buttons[2] = value; },
    /**
     * Returns the state of all buttons.
     */
    get buttons() { return _buttons; }
};

let _mouseX = -1;
let _mouseY = -1;
let _mouseOver: boolean;
let _buttons: (boolean | null)[] = []

_canvas.addEventListener("mousedown", event => {
    event.preventDefault();
    _canvas.focus();

    if (_buttons[event.button] !== false) {
        _buttons[event.button] = true;
    }
});

_canvas.addEventListener("mouseup", event => {
    _buttons[event.button] = null;
});

_canvas.addEventListener("mousemove", event => {
    const rect = _canvas.getBoundingClientRect();

    _mouseX = event.clientX - rect.left;
    _mouseY = event.clientY - rect.top;
    _mouseOver = true;
});

_canvas.addEventListener("mouseout", () => {
    _mouseOver = false;
    _buttons = [];
});

_canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
});

_canvas.addEventListener("wheel", event => {
    event.preventDefault();
});

/**
 * BalderJS
 * 
 * An object for input from touchscreen.
 */
const touchscreen = {
    get x() { return _touches.length > 0 ? _touches[0].x : -1 },
    get y() { return _touches.length > 0 ? _touches[0].y : -1 },

    get touches() {
        return _touches;
    },

    get touched(): boolean { return _touchable && _touches.length > 0 },
    set touched(value: false) { _touchable = value; }
};

let _touches: {
    readonly x: number;
    readonly y: number;
    readonly identifier: number;
}[] = [];
let _touchable = true;

function _touchHandler(event: TouchEvent) {
    event.preventDefault();
    _canvas.focus();

    const rect = _canvas.getBoundingClientRect();
    _touches = [];

    for (let i = 0; i < event.touches.length; i++) {
        _touches[i] = {
            x: event.touches[i].clientX - rect.left,
            y: event.touches[i].clientY - rect.top,
            identifier: event.touches[i].identifier
        };
    }

    if (_touches.length == 0) _touchable = true;
}

_canvas.addEventListener("touchstart", _touchHandler);
_canvas.addEventListener("touchend", _touchHandler);
_canvas.addEventListener("touchmove", _touchHandler);

/**
 * BalderJS
 * 
 */
class Cell {
    private _color: string | null = null;
    private _image: HTMLImageElement | null = null;
    private _text: string | null = null;
    private _custom: ((c: Cell) => void) | null = null;

    private fontSize: number;

    /**
     * Additional info about this cell.
     */
    tag: any;

    constructor(
        readonly row: number,
        readonly column: number,
        readonly x: number,
        readonly y: number,
        readonly width: number,
        readonly height: number,
        private textColor: string,
    ) {
        this.fontSize = Math.min(height, width);
    }

    get color() {
        return this._color;
    }

    set color(value: string | null) {
        this._color = value;
        this.draw();
    }

    get image() {
        return this._image;
    }

    set image(value: HTMLImageElement | null) {
        this._image = value;
        this.draw();
    }

    get text(): string | null {
        return this._text;
    }

    set text(value: string | [value: string, fontSize?: number, color?: string] | null) {
        if (value == null) {
            this._text = null;
        } else if (typeof value == "string") {
            this._text = value;
        } else {
            this._text = value[0];
            this.fontSize = value[1] ?? this.fontSize;
            this.textColor = value[2] ?? this.textColor;
        }

        this.draw();
    }

    get custom() {
        return this._custom;
    }

    set custom(value: ((cell: Cell) => void) | null) {
        this._custom = value;
        this.draw();
    }

    draw() {
        clear(this.x, this.y, this.width, this.height);

        if (this._color) {
            rectangle(this.x + 0.5, this.y + 0.5, this.width - 1, this.height - 1, this._color);
        }

        if (this._image) {
            ctx.drawImage(this._image, this.x, this.y, this.width, this.height);
        }

        if (this._text) {
            text(this._text, [this.x + this.width / 2, "center"], [this.y + this.height / 2, "center"], this.fontSize, this.textColor)
        }

        if (this._custom) {
            this._custom(this);
        }
    }

    toString() {
        return JSON.stringify(this)
    }
}

/**
 * BalderJS
 * 
 */
class Grid {
    private activatable = true;
    private _activeCell: Cell;
    private cells: Cell[][] = [];
    private cellWidth: number;
    private cellHeight: number;

    constructor(
        readonly rows: number,
        readonly columns: number,
        readonly x = 0,
        readonly y = 0,
        readonly width = W - x,
        readonly height = H - y,
        private color = "black"
    ) {
        this.cellWidth = (width - columns - 1) / columns;
        this.cellHeight = (height - rows - 1) / rows;

        for (let i = 0; i < rows; i++) {
            this.cells[i] = [];
            for (let j = 0; j < columns; j++) {
                this.cells[i][j] = new Cell(i, j,
                    x + j * (this.cellWidth + 1) + 1,
                    y + i * (this.cellHeight + 1) + 1,
                    this.cellWidth, this.cellHeight, color
                );
            }
        }

        this._activeCell = this.cells[0][0];
        this.draw();
    }

    /**
     * Returns cell at given position.
     */
    cell(row: number, column: number) {
        return this.cells[row][column];
    }

    /**
     * Applies the `callback`-function to each cell.
     */
    forEach(callback: (c: Cell) => void) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                callback(this.cells[i][j]);
            }
        }
    }

    /**
     * Returns `true` if a cell was either clicked or touched.
     */
    get activated(): boolean {
        if (touchscreen.touched || mouse.buttons.some(value => value)) {
            if (this.activatable) {
                this.activatable = false;
                const x = touchscreen.touched ? touchscreen.x : mouse.x;
                const y = touchscreen.touched ? touchscreen.y : mouse.y;

                const cell = this.cellFromPoint(x, y);
                if (cell) {
                    this._activeCell = cell;
                    return true;
                }
            }

            return false;
        }

        this.activatable = true;
        return false;
    }

    /**
     * Returns the active cell.
     */
    get activeCell() {
        return this._activeCell;
    }

    /**
     * Returns the cell, if any, containing (`x`, `y`).
     */
    cellFromPoint(x: number, y: number): Cell | undefined {
        const column = Math.floor((x - this.x) / (this.cellWidth + 1));
        const row = Math.floor((y - this.y) / (this.cellHeight + 1));

        return this.cells[row]?.[column];
    }

    /**
     * Draws this grid.
     */
    draw() {
        if (this.color) {
            rectangle(this.x, this.y, this.width, this.height, this.color)
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.cells[i][j].draw();
            }
        }
    }

    toString() {
        return JSON.stringify(this)
    }
}

/**
 * BalderJS
 * 
 */
class Hitbox {
    tag: any;

    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {
    }

    /**
     * Returns `true` if this hitbox intersects `other` hitbox.  
     */
    intersects(other: Hitbox): boolean {
        return (
            this.x + this.width > other.x &&
            this.x < other.x + other.width &&
            this.y + this.height > other.y &&
            this.y < other.y + other.height
        );
    }

    /**
     * Returns `true` if this hitbox contains (`x`, `y`).  
     */
    contains(x: number, y: number): boolean {
        return (
            this.x + this.width > x &&
            this.x <= x &&
            this.y + this.height > y &&
            this.y <= y
        );
    }

    drawOutline(color = "black") {
        rectangle(this.x, this.y, Math.max(this.width, 0), Math.max(this.height, 0), color, 1);
    }

    toString() {
        return JSON.stringify(this)
    }
}

/**
 * BalderJS
 * 
 */
class Button {
    private hb: Hitbox;
    private activatable = true;

    tag: any;

    constructor(
        readonly text: string,
        x = 0,
        y = 0,
        width?: number,
        height?: number,
        private color = "lightgrey",
        private fontSize = 16,
        private textColor = "black"
    ) {
        width = width ?? text.length * fontSize
        height = height ?? fontSize * 2
        this.hb = new Hitbox(x, y, width, height)
        this.draw()
    }

    get activated(): boolean {
        if (touchscreen.touched || mouse.buttons.some(value => value)) {
            if (this.activatable) {
                this.activatable = false;
                const x = touchscreen.touched ? touchscreen.x : mouse.x;
                const y = touchscreen.touched ? touchscreen.y : mouse.y;

                return this.hb.contains(x, y);
            }

            return false;
        }

        this.activatable = true;
        return false;
    }


    draw() {
        rectangle(this.hb.x, this.hb.y, this.hb.width, this.hb.height, this.color)
        text(this.text, [this.hb.x + this.hb.width / 2, "center"], [this.hb.y + this.hb.height / 2, "center"], this.fontSize, this.textColor)
    }
}

/**
 * BalderJS
 * 
 */
class Sprite extends Hitbox {
    private index = 0;
    private remainingTime!: number;
    private _frames: number[];
    private frameWidth: number;
    private frameHeight: number;
    private sxs: number[] = [];
    private sys: number[] = [];
    private _finished = false;
    private _framesPerSecond!: number

    /**
     * Set to `false` if sprite shouldn't loop.  
     */
    loop = true;

    constructor(
        private spritesheet: HTMLImageElement,
        private rows: number,
        private columns: number,
    ) {
        super(0, 0, 0, 0);

        this._frames = array(rows * columns, i => i!);
        this.framesPerSecond = 12
        this.width = this.frameWidth = this.spritesheet.width / this.columns;
        this.height = this.frameHeight = this.spritesheet.height / this.rows;

        for (let i = 0; i < rows * columns; i += 1) {
            this.sxs[i] = this.frameWidth * (i % this.columns);
            this.sys[i] = this.frameHeight * Math.floor(i / this.columns);
        }
    }

    set frames(value: number[]) {
        if (value.length != this._frames.length || value.some((v, i) => v != this._frames[i])) this.index = 0

        this._frames = value
    }

    set framesPerSecond(value: number) {
        this._framesPerSecond = value

        this.remainingTime = 1000 / value;
    }

    get framesPerSecond() {
        return this._framesPerSecond;
    }

    get finished() {
        return this._finished;
    }

    get frame() {
        return this._frames[this.index];
    }

    update() {
        this.remainingTime -= deltaTime;

        if (this.remainingTime < 0) {
            if (this.index >= this._frames.length - 1) {
                if (this.loop) {
                    this.index = 0;
                } else {
                    this._finished = true;
                }
            } else {
                this.index++;
            }

            this.remainingTime += 1000 / this._framesPerSecond;
        }

        this.draw();
    }

    draw() {
        const sx = this.sxs[this._frames![this.index]];
        const sy = this.sys[this._frames![this.index]];

        ctx.drawImage(
            this.spritesheet,
            sx, sy, this.frameWidth, this.frameHeight,
            this.x, this.y, this.width, this.height
        );
    }

    getImages() {
        const frameCanvas = document.createElement("canvas");
        const frameCtx = frameCanvas.getContext("2d")!;

        const images: HTMLImageElement[] = [];

        for (const frame of this._frames!) {
            frameCtx.clearRect(0, 0, this.frameWidth, this.frameHeight);
            frameCtx.drawImage(
                this.spritesheet,
                this.sxs[frame], this.sys[frame], this.frameWidth, this.frameHeight,
                0, 0, this.frameWidth, this.frameHeight
            );

            images.push(imageFromDataURL(frameCanvas.toDataURL()));
        }

        return images;
    }
}

/**
 * BalderJS
 * 
 */
class Turtle {
    private container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    private turtle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    private points: [number, number][] = [];
    private _color = "black";

    penSize = 1;

    /**
     * The delay, in milliseconds, between changes in state (movements and rotations).
     */
    delay = 100;

    /**
     * Create a turtle.
     * 
     * @example
     * Creates a turtle in the middle of the canvas, headed east (default settings):
     * ```
     * let t = new Turtle()
     * ```
     * @example
     * Creates a turtle at (`100`, `200`), headed north:
     * ```
     * let t = new Turtle(100, 200, -90)
     * ```
     *  
     */
    constructor(
        private x = W / 2,
        private y = H / 2,
        private heading = 0
    ) {
        document.body.appendChild(this.container);
        this.container.appendChild(this.turtle);
        this.container.setAttribute("width", "20");
        this.container.setAttribute("height", "20");
        this.container.style.position = "absolute";
        this.turtle.setAttribute("fill", this._color);
        this.turtle.setAttribute("stroke", this._color);
        this.turtle.setAttribute("stroke-width", "1");

        this.move();
        this.turn();
    }

    /**
     * The state of the turtle as a 3-tuple.
     * 
     * @example
     * Get the position and heading of turtle `t`: 
     * ```
     * let [x, y, heading] = t.state
     * ```
     * @example
     * Place turtle `t` at (`100`, `200`) headed south:
     * ```
     * t.state = [100, 200, 90]
     * ```
    */
    get state() {
        return [this.x, this.y, this.heading];
    }

    set state(value: [x: number, y: number, heading: number]) {
        [this.x, this.y, this.heading] = value;
        this.move()
        this.turn()
    }

    /**
     * The color of this turtle. Used when drawing and filling.
     */
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        this.turtle.setAttribute("fill", this._color);
    }

    private move() {
        const style = getComputedStyle(_canvas);
        const offsetLeft = _canvas.offsetLeft + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
        const offsetTop = _canvas.offsetTop + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
        this.container.style.left = (offsetLeft + this.x - 10) + "px";
        this.container.style.top = (offsetTop + this.y - 10) + "px";

        if (this.points.length > 0) {
            this.points.push([this.x, this.y]);
        }
    }

    private turn() {
        const [x0, y0] = [10, 10];
        const [x1, y1] = pointFromPolar(10, this.heading + 150, x0, y0);
        const [x2, y2] = pointFromPolar(6, this.heading + 180, x0, y0);
        const [x3, y3] = pointFromPolar(10, this.heading - 150, x0, y0);
        this.turtle.setAttribute("points", `${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}`);
    }

    /**
     * Move this turtle `length` pixels in the direction it is headed. 
    */
    async forward(length: number, penDown = true) {
        this.container.style.zIndex = _layer.toString();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        this.x += Math.cos(radians(this.heading)) * length;
        this.y += Math.sin(radians(this.heading)) * length;

        if (penDown) {
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.penSize;
            ctx.stroke();
        } else {
            ctx.moveTo(this.x, this.y);
        }

        this.move()

        await sleep(this.delay);
    }

    /**
     * Move this turtle `length` pixels in the direction opposite it is headed. 
     */
    async backward(length: number, penDown = true) {
        this.forward(-length, penDown);
    }

    /**
     * Turn this turtle `degAngle` degrees clockwise.
     */
    async right(degAngle = 90) {
        this.container.style.zIndex = _layer.toString();
        this.heading += degAngle;
        this.turn()
        await sleep(this.delay);
    }

    /**
     * Turn this turtle `degAngle` degrees counterclockwise.
     */
    async left(degAngle = 90) {
        await this.right(-degAngle);
    }

    hide() {
        this.container.style.display = "none";
    }

    beginFill() {
        this.points = [[this.x, this.y]];
    }

    endFill() {
        polygon(this.points, this._color);
        this.points = [];
    }

    toString() {
        return JSON.stringify(this)
    }
}

addEventListener("resize", () => {
    if (_canvas.style.display == "") location.reload()
});


//
// Updates
//

/**
 * BalderJS
 * 
 */
let deltaTime: number;

/**
 * BalderJS
 * 
 * The `update`-function is run once for every screen update.
 * @example
 * Draw a circle at random postiton each update
 * ```
 * update = () => {
 *     circle(random(W), random(H), 10)
 * }
 * ```
 * @example
 * Count the number of updates between two space pressings.
 * ```
 * text("Press space twice.")
 * update = () => {
 *     if (keyboard.space) {
 *         keyboard.space = false
 *         let n = 0
 *       
 *         update = () => {
 *             clear()
 *             n++
 *             text(n)
 *
 *             if (keyboard.space) {
 *                 update = null
 *             }
 *         }
 *     }
 * }
 * ```
 */
let update: (() => void) | null = null;
let _timestamp0: number;

function _updateHandler(timestamp: number) {
    deltaTime = timestamp - _timestamp0;
    _timestamp0 = timestamp;

    update?.();
    requestAnimationFrame(_updateHandler);
}

requestAnimationFrame(timestamp => _timestamp0 = timestamp)
requestAnimationFrame(_updateHandler)


//
// Utilities
//

/**
 * BalderJS
 * 
 * Creates an array filled with `value`.
 * @example
 * Create the array `["-", "-", "-", "-", "-"]`:
 * ```
 * let a = array(5, "-")
 * ``` 
 */
function array<T>(length: number, value: Exclude<T, Function>): T[];
/**
 * BalderJS
 * 
 * Create an array filled with values returned by the `callback`-function. 
 * @example
 * Create the array `[0, 2, 4, 6, 8, 10]`:
 * ```
 * let a = array(6, i => 2 * i)
 * ``` 
 */
function array<T>(length: number, callback: ((index: number) => T)): T[];
function array(length: number, value: unknown) {
    return Array.from({ length }, (_, i) =>
        typeof value == "function" ? value(i) : value);
}

/** 
 * BalderJS
 * 
 * Create a 2D-array filled with `value`.
 */
function array2D<T>(rows: number, columns: number, value: Exclude<T, Function>): T[][];
/**
 * BalderJS
 * 
 * Create a 2D-array filled with values returned by the `callback`-function. 
 */
function array2D<T>(rows: number, columns: number, callback: ((rowIndex: number, columnIndex: number) => T)): T[][];
function array2D(rows: number, columns: number, value: unknown) {
    return Array.from({ length: rows }, (_, i) =>
        Array.from({ length: columns }, (_, j) =>
            typeof value == "function" ? value(i, j) : value));
}

let _audioContext: AudioContext;
const _audioList: [OscillatorNode, GainNode][] = [];

/**
 * BalderJS
 * 
 * Plays a beep. A user interaction is mandatory.
 * @example
 * Beeps for two seconds:
 * ```
 * let f = +await read("Frequency (Hz): ")
 * beep(f, 2000)
 * ```
 */
function beep(frequency = 800, msDuration = 200, volume = 1): Promise<void> {
    if (!_audioContext) _audioContext = new AudioContext();

    return new Promise(resolve => {
        let audioItem = _audioList.find(item => item[0].frequency.value == frequency)
        if (!audioItem) {
            const oscillator = _audioContext.createOscillator();
            const gain = _audioContext.createGain();

            oscillator.connect(gain);
            oscillator.type = "square";
            gain.connect(_audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.start();

            audioItem = [oscillator, gain];
            _audioList.push(audioItem);

            oscillator.onended = () => {
                _audioList.splice(_audioList.indexOf(audioItem!), 1);
                resolve();
            }
        }

        audioItem[1].gain.value = volume;
        audioItem[0].stop(_audioContext.currentTime + msDuration / 1000);
    });
}

/**
 * BalderJS
 * 
 * Returns `radAngle`, an angle in radians, to degrees. 
 * @example
 * ```
 * write(degrees(Math.PI))      // 180   
 * ```   
 */
function degrees(radAngle: number): number {
    return radAngle * 180 / Math.PI;
}

/**
 * BalderJS
 * 
 *  Returns the distance between (`x1`, `y1`) and (`x2`, `y2`). 
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * BalderJS
 * 
 * Returns the point with polar coordinates (`radius`, `degAngle`). 
 */
function pointFromPolar(radius: number, degAngle: number, x0 = 0, y0 = 0): [x: number, y: number] {
    const a = radians(degAngle);
    return [x0 + Math.cos(a) * radius, y0 + Math.sin(a) * radius];
}

/**
 * BalderJS
 * 
 * Returns `degAngle`, an angle in degrees, to radians. 
 * @example
 * ```
 * write(radians(180))      // 3.141592653589793 
 * ```   
 */
function radians(degAngle: number): number {
    return degAngle * Math.PI / 180;
}

/**
 * BalderJS
 * 
 */
function rand(N: number) {
    return Math.floor(Math.random() * N);
}

/**
 * BalderJS
 * 
 * Returns a random number between `min` and `max` (both included).
 * @example
 * Throw a die:
 * ```
 * let die = random(1, 6)
 * ``` 
*/
function random(min: number, max: number, step = 1) {
    return min + Math.floor(Math.random() * Math.floor((max - min) / step + 1)) * step;
}

/**
 * BalderJS
 * 
 * Returns a random item from `items`, the argument list.
 * @example
 * A random color:
 * ```
 * let color = randomItem("red", "green", "blue")
 * ``` 
 */
function randomItem<T>(...items: T[]): T {
    return items[rand(items.length)];
}

/**
 * BalderJS
 * 
 * Returns a RGBA color. 
 * Values `r`(ed), `g`(reen) and `b`(lue) are integers in the interval 0 to 255.
 * Value `a`(lpha) is between `0` and `1`.
 */
function rgba(r: number, g: number, b: number, a = 1): string {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * BalderJS
 * 
 * Shuffles `array` in place.
 */
function shuffle(array: unknown[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = rand(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * BalderJS
 * 
 * Pauses execution for `msDuration` ms.
 * @example
 * Show a green screen after 3 seconds:
 * ```
 * fill("red")
 * await sleep(3000)
 * fill("green")
 * ``` 
 */
function sleep(msDuration: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(() => resolve(), msDuration));
}

/**
 * BalderJS
 * 
 */
class Vector {
    constructor(
        public x: number,
        public y: number
    ) {
    }

    static fromPolar(length: number, angle: number): Vector {
        return new Vector(Math.cos(angle) * length, Math.sin(angle) * length);
    }

    get length(): number {
        return Math.hypot(this.x, this.y);
    }

    set length(value: number) {
        const angle = this.angle;
        this.x = value * Math.cos(angle);
        this.y = value * Math.sin(angle);
    }

    get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    set angle(value: number) {
        const length = this.length;
        this.x = length * Math.cos(value);
        this.y = length * Math.sin(value);
    }

    clone(): Vector {
        return new Vector(this.x, this.y);
    }

    normalize() {
        const angle = this.angle;
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
    }

    toNormalized(): Vector {
        const angle = this.angle;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    add(v: Vector) {
        this.x += v.x;
        this.y += v.y;
    }

    adding(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vector) {
        this.x -= v.x;
        this.y -= v.y;
    }

    subtracting(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multiply(v: Vector) {
        this.x *= v.x;
        this.y *= v.y;
    }

    multiplying(v: Vector): Vector {
        return new Vector(this.x * v.x, this.y * v.y);
    }

    divide(v: Vector) {
        this.x /= v.x;
        this.y /= v.y;
    }

    dividing(v: Vector): Vector {
        return new Vector(this.x / v.x, this.y / v.y);
    }

    scale(s: number) {
        this.x *= s;
        this.y *= s;
    }

    toScaled(s: number): Vector {
        return new Vector(this.x * s, this.y * s);
    }

    distanceTo(v: Vector): number {
        return Math.hypot(this.x - v.x, this.y - v.y);
    }

    directionTo(v: Vector): Vector {
        const angle = Math.atan2(v.y - this.y, v.x - this.x);
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}

/**
 * BalderJS
 * 
*/
function setLayer(layer: number) {
    if (!_ctxs[layer]) {
        let canvasLayer = document.createElement("canvas");
        _canvas.append(canvasLayer);
        canvasLayer.width = W;
        canvasLayer.height = H;
        canvasLayer.style.zIndex = layer.toString();
        _canvasLayers[layer] = canvasLayer;
        _ctxs[layer] = canvasLayer.getContext("2d")!;
    }

    _layer = layer;
    ctx = _ctxs[_layer];
}

setLayer(0);
_canvas.style.display = "";
_canvas.tabIndex = 0;
_canvas.focus();


//
// I/O
//

const _params = new URL(location.href).searchParams;
const _iParam = _params.get("i");               // input
let _inputLines: string[] = [];
let _inputLineIndex = 0;
let _outputElt: HTMLDivElement | null;

if (_iParam != null) {
    _inputLines = decodeURIComponent(_iParam).split("\n");
}

/**
 * BalderJS
 * 
 * Writes `prompt`, and waits for user input.
 * @example
 * ```
 * let name = await read("Your name? ")
 * ```
 */
function read(prompt = ""): Promise<string> {
    const inputElt = document.createElement("div");
    inputElt.textContent = prompt;
    _io.append(inputElt);
    inputElt.className = "input";

    _canvas.hidden = true;
    _io.hidden = false;
    _outputElt = null;

    return new Promise<string>((resolve) => {
        if (_inputLines[_inputLineIndex] != null) {
            let b = document.createElement("b");
            b.textContent = _inputLines[_inputLineIndex];
            inputElt.append(b);

            _canvas.hidden = false;
            _io.hidden = true;
            _canvas.focus()

            resolve(_inputLines[_inputLineIndex++]);
        } else {
            const valueElt = document.createElement("b");
            inputElt.append(valueElt);
            valueElt.contentEditable = "true"
            valueElt.focus();

            inputElt.onclick = () => valueElt.focus();

            valueElt.onkeydown = event => {
                if (event.code == "Enter") {
                    event.preventDefault();
                    valueElt.contentEditable = "false";
                    _inputLines[_inputLineIndex] = valueElt.textContent!;

                    _canvas.hidden = false;
                    _io.hidden = true;
                    _canvas.focus()

                    resolve(_inputLines[_inputLineIndex++]);
                }
            }
        }

    });
}

/**
 * BalderJS
 * 
 * Writes `value`. Hides the canvas.
 * 
 * @example
 * ```
 * write("On row 1.")  
 * write("On row 2.")
 * ```  
 * @example
 * ```
 * write("On row 1.", " ")  
 * write("Also on row 1.")
 * ```  
 * @example
 * ```
 * write()  // Line break  
 * ```  
 */
function write(value?: unknown, end: "" | " " | "\t" | "\n" = "\n") {
    if (!_outputElt) {
        _outputElt = document.createElement("div");
        _io.append(_outputElt);
        _outputElt.className = "output";

        _canvas.hidden = true;
        _io.hidden = false;
    }

    _outputElt.textContent! += arguments.length > 0 ? str(value) + end : "\n";
}

/**
 * BalderJS
 * 
 * Clears the input/output-element.
 */
function clearIO() {
    _io.hidden = false;
    _io.innerHTML = "";
    _outputElt = null;

    _canvas.hidden = true;
}


window.addEventListener("load", () => {
    const oParam = _params.get("o");        // output
    if (oParam != null) {
        _canvas.hidden = true;
        _io.hidden = false;

        _io.append(document.createElement("hr"));
        const respElt = document.createElement("p")
        _io.append(respElt);

        const output = _outputElt?.textContent!.split("\n").map(line => line.trimEnd()).join("\n").trimEnd() ?? "";
        const oValue = decodeURIComponent(oParam);

        if (output == oValue) {
            respElt.innerHTML = `<span class="correct">${output}</span>`;
        } else {
            let offset = 0;
            while (output[offset] == oValue[offset]) {
                offset++
            }

            const correct = output.slice(0, offset);
            respElt.innerHTML = `<span class="correct">${correct}</span>`;

            const incorrect = output.slice(offset) + " ".repeat(Math.max(0, oValue.length - output.length));
            respElt.innerHTML += `<span class="incorrect">${incorrect}</span>`;

            const correctElt = document.createElement("p")
            _io.append(correctElt);
            correctElt.innerHTML += `<span class="correct">${oParam}</span>`;
        }
    }
});


//
// Console
//

let _repetition = 1;
let _repetitionElt: HTMLSpanElement;
let _lastValue = ["", ""];

window.onerror = (_event, _source, _lineno, _colno, error) => {
    _writeConsole("error", str(error))
}

const _log = console.log;
console.log = (...args: any[]) => {
    _log(...args);

    _writeConsole("log", args.map(arg => str(arg)).join(" "));
}

function _writeConsole(...value: string[]) {
    if (value[0] == _lastValue[0] && value[1] == _lastValue[1]) {
        _repetitionElt.textContent = " *" + ++_repetition;
    } else {
        const elt = document.createElement("div")
        _console.append(elt)
        elt.textContent = value[1]
        elt.className = value[0];
        elt.scrollIntoView()

        _repetitionElt = document.createElement("span")
        elt.append(_repetitionElt)
        _repetition = 1;
        _lastValue = value;
    }
}

function clearConsole() {
    _console.innerHTML = "";
    _lastValue = ["", ""];
}

_console.onclick = () => {
    clearConsole();
}

window.addEventListener("unhandledrejection", event => {
    throw event.reason;
});
