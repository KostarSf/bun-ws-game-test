import type { Entity } from "./interfaces/entities";

/**
 * Вычисляет гравитационную силу между двумя объектами.
 *
 * @param {Entity} object1 Объект с координатами x, y, mass.
 * @param {Entity} object2 Объект с координатами x, y, mass.
 * @returns {Pick<Entity, "x" | "y">} Объект с компонентами x и y силы.
 */
export function gravitationalForce(object1: Entity, object2: Entity) {
	const G = 10; // гравитационная постоянная

	const dx = object2.x - object1.x;
	const dy = object2.y - object1.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	// Предотвращение деления на ноль или очень малых расстояний
	const minDistance = 1; // Минимальное расстояние, чтобы избежать бесконечной силы
	const safeDistance = Math.max(distance, minDistance);

	const forceMagnitude = (G * object1.mass * object2.mass) / (safeDistance * safeDistance);

	const forceX = forceMagnitude * (dx / safeDistance);
	const forceY = forceMagnitude * (dy / safeDistance);

	return {
		x: forceX,
		y: forceY,
	};
}

/**
 * Обновляет скорость и позицию объекта на основе приложенных сил.
 *
 * @param {Entity} object Объект с полями x, y, mass, velX, velY, forceX и forceY.
 * @param {number} deltaTime Время, прошедшее с момента последнего обновления.
 */
export function updateObject(object: Entity, deltaTime: number) {
	// Вычислить ускорение на основе силы и массы (F = ma -> a = F/m)
	const accelerationX = object.forceX / object.mass;
	const accelerationY = object.forceY / object.mass;

	// Обновить скорость на основе ускорения и времени
	object.velX += accelerationX * deltaTime;
	object.velY += accelerationY * deltaTime;

	// Обновить позицию на основе скорости и времени
	object.x += object.velX * deltaTime;
	object.y += object.velY * deltaTime;

	// Сбросить силы после обновления
	object.forceX = 0;
	object.forceY = 0;
}

/**
 * Определяет, сталкиваются ли два круга.
 *
 * @param {Object} circle1 Круг с полями x, y и radius.
 * @param {Object} circle2 Круг с полями x, y и radius.
 * @returns {boolean} True, если круги сталкиваются, в противном случае false.
 */
export function circlesCollide(circle1: Entity, circle2: Entity) {
	const dx = circle2.x - circle1.x;
	const dy = circle2.y - circle1.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	const sumOfRadii = circle1.radius + circle2.radius;

	return distance < sumOfRadii;
}

/**
 * Обрабатывает столкновение между двумя кругами.
 *
 * @param {Object} circle1 Круг с полями x, y, radius, mass, velX и velY.
 * @param {Object} circle2 Круг с полями x, y, radius, mass, velX и velY.
 */
export function resolveCollision(circle1: Entity, circle2: Entity) {
	const dx = circle2.x - circle1.x;
	const dy = circle2.y - circle1.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	const sumOfRadii = circle1.radius + circle2.radius;

	// Минимальное расстояние между центрами кругов после столкновения.
	const overlap = sumOfRadii - distance;

	// Нормаль к поверхности столкновения (вектор, указывающий от circle1 к circle2).
	const normalX = dx / distance;
	const normalY = dy / distance;

	// Перемещение кругов, чтобы они больше не перекрывались.
	// Смещение пропорционально массе, чтобы более легкие объекты отодвигались больше.
	const correctionX = (overlap / (circle1.mass + circle2.mass)) * normalX;
	const correctionY = (overlap / (circle1.mass + circle2.mass)) * normalY;

	circle1.x -= correctionX * circle2.mass;
	circle1.y -= correctionY * circle2.mass;
	circle2.x += correctionX * circle1.mass;
	circle2.y += correctionY * circle1.mass;

	// Вычислите относительную скорость.
	const relativeVelocityX = circle2.velX - circle1.velX;
	const relativeVelocityY = circle2.velY - circle1.velY;

	// Вычислите импульс вдоль нормали.
	const dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;

	// Если скорости уже разделяются, ничего не делайте.
	if (dotProduct > 0) return;

	// Коэффициент восстановления (0 = полностью неупругий, 1 = полностью упругий).
	const restitution = 0.8;

	// Вычислите импульс.
	const impulse = (-(1 + restitution) * dotProduct) / (1 / circle1.mass + 1 / circle2.mass);

	// Примените импульс.
	circle1.velX -= (impulse * normalX) / circle1.mass;
	circle1.velY -= (impulse * normalY) / circle1.mass;
	circle2.velX += (impulse * normalX) / circle2.mass;
	circle2.velY += (impulse * normalY) / circle2.mass;
}
