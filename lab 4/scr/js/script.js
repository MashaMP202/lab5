const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")


canvas.width = window.innerWidth
canvas.height = window.innerHeight

boundary_width = 50
boundary_height = 50

map = [
	['-','-','-','-','-','-','-','-','-','-',],
	['-','.','.','.','.','.','.','.','.','-',],
	['-','.','-','.','-','-','-','-','.','-',],
	['-','.','-','.','.','.','-','-','.','-',],
	['-','.','-','.','-','.','.','.','.','-',],
	['-','.','.','.','.','.','-','-','.','-',],
	['-','-','.','-','-','.','.','.','.','-',],
	['-','-','.','-','-','.','-','-','.','-',],
	['-','-','.','.','.','.','.','.','.','-',],
	['-','-','-','-','-','-','-','-','-','-',],
]

class Boundary {
	constructor(position){
		this.position = position
		this.width = boundary_width
		this.height = boundary_height
	}
	
	draw() {
		ctx.fillStyle = "#006400"
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
	}	
}

class Pacman {
	constructor(position){
		this.position = position
		this.velocity = {
			x: 0,
			y: 0
		}
		this.radius = 20
	}
	
	draw() {
		ctx.beginPath()
		ctx.arc(this.position.x, this.position.y, this.radius, 0.2 * Math.PI, 1.8 * Math.PI)
		ctx.lineTo(this.position.x, this.position.y)
		ctx.fillStyle = "#FFA07A"
		ctx.fill()
	}
	
	update() {
		this.draw()
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
	}
}

class Ghost {
	constructor(position){
		this.position = position
		this.velocity = {
			x: 5,
			y: 0
		}
		this.radius = 20
		this.prevColl = []
	}
	
	draw() {
		ctx.beginPath()
		ctx.arc(this.position.x, this.position.y, this.radius, 0.2 * Math.PI, 1.8 * Math.PI)
		ctx.lineTo(this.position.x, this.position.y)
		ctx.fillStyle = "#B0C4DE"
		ctx.fill()
	}
	
	update() {
		this.draw()
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
	}
}


class Food {
	constructor(position){
		this.position = position
		this.radius = 7
	}
	
	draw() {
		ctx.beginPath()
		ctx.arc(this.position.x, this.position.y, this.radius, 0 * Math.PI, 2 * Math.PI)
		ctx.lineTo(this.position.x, this.position.y)
		ctx.fillStyle = "white"
		ctx.fill()
	}

} 

function check_if_collision(mobile, stationary){
	return mobile.position.y - mobile.radius + mobile.velocity.y <=
	stationary.position.y + stationary.height &&
	mobile.position.y + mobile.radius + mobile.velocity.y >= stationary.position.y &&
	mobile.position.x + mobile.radius + mobile.velocity.x >= stationary.position.x &&
	mobile.position.x - mobile.radius + mobile.velocity.x <= stationary.position.x + stationary.width
}

function check_if_food_eaten(pacman, food){
	return(Math.hypot(pacman.position.x - food.position.x, pacman.position.y - food.position.y) <= pacman.radius + food.radius)
}

pacman_init_position = {
	x: boundary_width + boundary_width / 2,
	y: boundary_height + boundary_height / 2
}
pacman = new Pacman(pacman_init_position)
pacman.draw()

pacman_init_position = {
	x: boundary_width*3 + boundary_width / 2,
	y: boundary_height + boundary_height / 2
}
ghost = new Ghost(pacman_init_position)
ghost.draw()

boundaries = []
foods = []
map.forEach((row, index) => {
	row.forEach((symbol, index2) => {
		if(symbol === "-"){
			boundaries.push(new Boundary({
				x: boundary_width * index2,
				y: boundary_height * index
			}))
		}
		if(symbol == "."){
			foods.push(new Food({
				x: boundary_width * index2 + boundary_width/2,
				y: boundary_height * index + boundary_height/2
			}))
		}
	})	
})

function animate() {
	requestId = window.requestAnimationFrame(animate)

	if(foods.length === 0){
		window.alert("Поздравляю! Вы выиграли!")
		window.cancelAnimationFrame(requestId)
	}
	if(Math.hypot(ghost.position.x - pacman.position.x, ghost.position.y - pacman.position.y) <= ghost.radius + pacman.radius){
		window.alert("Игра окончена! Вы проиграли!")
		window.cancelAnimationFrame(requestId)
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height)

	collisions = []
	boundaries.forEach(boundary => {
		boundary.draw()
		
		if(check_if_collision(pacman, boundary)){
			pacman.velocity.x = 0
			pacman.velocity.y = 0
		}
		
		if(!collisions.includes("left") && check_if_collision({
			...ghost,
			velocity: {
				x: -5,
				y: 0
			}
		}, boundary)) {
			collisions.push("left")
		}
		if(!collisions.includes("right") && check_if_collision({
			...ghost,
			velocity: {
				x: 5,
				y: 0
			}
		}, boundary)) {
			collisions.push("right")
		}
		if(!collisions.includes("bottom") && check_if_collision({
			...ghost,
			velocity: {
				x: 0,
				y: 5
			}
		}, boundary)) {
			collisions.push("bottom")
		}
		if(!collisions.includes("top") && check_if_collision({
			...ghost,
			velocity: {
				x: 0,
				y: -5
			}
		}, boundary)) {
			collisions.push("top")
		}
	})
	
	if(ghost.prevColl.length < collisions.length) {
		ghost.prevColl = collisions
	}
	
	if(JSON.stringify(ghost.prevColl) !== JSON.stringify(collisions)){
	if(ghost.velocity.x < 0) {
		collisions.push("left")
	}
	if(ghost.velocity.x > 0) {
		collisions.push("right")
	}
	if(ghost.velocity.y > 0) {
		collisions.push("bottom")
	}
	if(ghost.velocity.y < 0) {
		collisions.push("top")
	}
	paths = []
	paths = ghost.prevColl.filter(collision => {
		return !collisions.includes(collision)
	})
	
	direction = paths[Math.floor(Math.random() * paths.length)]
	if(direction == "top") {
		ghost.velocity.y = -5
		ghost.velocity.x = 0
	}
	else if(direction == "bottom") {
		ghost.velocity.y = 5
		ghost.velocity.x = 0
	}
	else if(direction == "left") {
		ghost.velocity.y = 0
		ghost.velocity.x = -5
	}
	else if(direction == "right") {
		ghost.velocity.y = 0
		ghost.velocity.x = 5
	}
	ghost.prevColl = []
	}
	foods.forEach((food, index) => {
		food.draw()
		
		if(check_if_food_eaten(food, pacman)) {
			foods.splice(index, 1)
		}
	})
	
	ghost.update()
	pacman.update()
}
animate()

window.addEventListener("keydown", event => {
	if(event.key == "s") {
		pacman.velocity.x = 0
		pacman.velocity.y = 5
	}
	if(event.key == "w") {
		pacman.velocity.x = 0
		pacman.velocity.y = -5
	}
	if(event.key == "a") {
		pacman.velocity.x = -5
		pacman.velocity.y = 0
	}
	if(event.key == "d") {
		pacman.velocity.x = 5
		pacman.velocity.y = 0
	}
})