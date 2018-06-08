//
"use strict";


/**
 * @type {Shape}
 */
export class Shape {
    constructor() {
    }
    /**
     * @return {Array<Number>}
     */
    spread() {
        throw new Error(".spread() is an abstract method and must be defined!");
    }
}

/**
 * @type {Point}
 */
export class Point extends Shape {
    /**
     * @param {Number} a
     * @param {Number} b
     */
    constructor(a=0, b=0, c=0) {
        super();
        this.x = a;
        this.y = b;
        this.z = c;
    }
    spread() {
    }
    /**
     * @param  {Point} pt
     * @return {Float}
     */
    distanceTo(pt) {
        return Math.sqrt(Math.pow(pt.x - this.x, 2) + Math.pow(pt.y - this.y, 2));
    }
    /**
     * @param {Point} pt
     * @return {Point}
     */
    add(pt) {
        this.x += pt.x;
        this.y += pt.y;
        this.z += pt.z;
        return this;
    }
    /**
     * @param {Point} pt
     * @return {Point}
     */
    sub(pt) {
        this.x -= pt.x;
        this.y -= pt.y;
        this.z -= pt.z;
        return this;
    }
    /**
     * @return {Point}
     */
    clone() {
        return new Point(this.x, this.y);
    }
}

/**
 * @type {Circle}
 */
export class Circle extends Shape {
    /**
     * @param {Number} a
     * @param {Number} b
     * @param {Number} c
     */
    constructor(a, b, c) {
        super();
        this.x = a || 0;
        this.y = b || 0;
        this.radius = c || 0;
    }
    /**
     * @return {Point}
     */
    center() {
        return new Point(this.x, this.y);
    }
    /**
     * @param  {Shape} ob
     * @return {Boolean}
     */
    intersects(ob) {
        if (ob instanceof Point) { // circle x point via https://math.stackexchange.com/a/198769
            return ob.distanceTo(this.center) <= this.radius;
        }
        else
        if (ob instanceof Circle) { // circle x circle via https://stackoverflow.com/a/8367547
            let dtc = this.center.distanceTo(ob.center); // distance to center
            return (dtc <= this.radius + ob.radius) && (dtc >= Math.abs(this.radius - ob.radius));
        }
        return false;
    }
    spread() {
        return [ this.x, this.y, this.radius ];
    }
}

/**
 * @type {Line}
 */
export class Line extends Shape {
    /**
     * @param {Point} p1
     * @param {Point} p2
     */
    constructor(p1, p2) {
        super();
        this.pt1 = p1 || new Point();
        this.pt2 = p2 || new Point();
    }
    /**
     * @return {Number}
     */
    length() {
        return this.pt1.distanceTo(this.pt2);
    }
    spread() {
        return [ this.pt1, this.pt2 ];
    }
}

/**
 * @type {Rectangle}
 */
export class Rectangle extends Shape {
    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */
    constructor(x, y, w, h) {
        super();
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    /**
     * @param  {Object} ob
     * @return {Boolean}
     */
    intersects(ob) {
        if (ob instanceof Point) {
            return (ob.x >= this.x) && (ob.y >= this.y) && (ob.x <= this.x + this.width) && (ob.y <= this.y + this.height);
        }
        return false;
    }
    /**
     * @param  {Point} pt
     * @return {Rectangle}
     */
    translate(pt) {
        this.x += pt.x;
        this.y += pt.y;
        return this;
    }
    spread() {
        return [ this.x, this.y, this.width, this.height ];
    }
}

/**
 * @type {Square}
 */
export class Square extends Rectangle {
    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Number} s
     */
    constructor(x, y, s) {
        super(x, y, s, s);
    }
}

/**
 * @type {Polygon}
 */
export class Polygon extends Shape {
    /**
     * @param {Array<Point>} points
     */
    constructor(...points) {
        super();
        this.points = points;
    }
}
