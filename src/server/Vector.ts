export class Vector {
	x: number;
	y: number;

	constructor(x: number, y?: number) {
		this.x = x;
		this.y = typeof y === "number" ? y : x;
	}

	static zero = () => new Vector(0, 0);

	static from(position: Vector) {
		return new Vector(position.x, position.y);
	}

	static difference(vec1: Vector, vec2: Vector) {
		return new Vector(vec2.x - vec1.x, vec2.y - vec1.y);
	}

	static distance(difference: Vector) {
		return Math.hypot(difference.x, difference.y);
	}

	toString() {
		return `{ x: ${this.x}, y: ${this.y} }`;
	}

	set(x: number | Vector, y?: number) {
		const values = getFuncValues(x, y);
		if (values) {
			this.x = values.x;
			this.y = values.y;
		}
		return this;
	}

	add(x: number | Vector, y?: number) {
		const values = getFuncValues(x, y);
		if (values) {
			this.x += values.x;
			this.y += values.y;
		}
		return this;
	}

	sub(x: number | Vector, y?: number) {
		const values = getFuncValues(x, y);
		if (values) {
			this.x -= values.x;
			this.y -= values.y;
		}
		return this;
	}

	mult(x: number | Vector, y?: number) {
		const values = getFuncValues(x, y);
		if (values) {
			this.x *= values.x;
			this.y *= values.y;
		}
		return this;
	}

	div(x: number | Vector, y?: number) {
		const values = getFuncValues(x, y);
		if (values) {
			this.x /= values.x;
			this.y /= values.y;
		}
		return this;
	}
}

function getFuncValues(x: number | Vector, y?: number) {
	if (isVector(x)) {
		return Vector.from(x);
	}
	return new Vector(x, y);
}

function isVector(val: unknown): val is Vector {
	return (
		!!val &&
		typeof val === "object" &&
		"x" in val &&
		"y" in val &&
		typeof val.x === "number" &&
		typeof val.y === "number"
	);
}
