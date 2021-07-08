const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
//캔버스에 가로, 세로 크기 지정
canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

//클래스 플레이어
class Player {
	//플레이어 기본 정의하기 
	constructor(x, y, radius, color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
	}
	//드로우
	draw() {
		//플레이어 그리기
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}
}
class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		//플레이어 그리기
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}
	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}


class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		//플레이어 그리기
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}
	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}
const friction = 0.985
//--------------------
class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		this.alpha = 1
	}

	draw() {
		//플레이어 그리기
		ctx.save()
		ctx.globalAlpha = this.alpha
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.restore()
	}
	update() {
		this.draw()
		this.velocity.x *= friction
		this.velocity.y *= friction
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
		this.alpha -= 0.01

	}
}
//플레이어의 x,y 구하기
const x = canvas.width / 2
const y = canvas.height / 2
//플레이어 객체 지정
let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
	 player = new Player(x, y, 10, 'white')
	 projectiles = []
	 enemies = []
	 particles = []
	 score = 0
	 scoreEl.innerHTML = score
	 bigScoreEl.innerHTML = score
}
let spawn
function spawnEnemies() {
		spawn = setInterval(() => {
		const radius = Math.random() * (50 - 15) + 15
		let x
		let y
		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
			y = Math.random() * canvas.height
		} else {

			x = Math.random() * canvas.width
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
		}

		const color = `hsl(${Math.random() * 360}, 50%, 50%)`

		const angle = Math.atan2(
			canvas.height / 2 - y,
			canvas.width / 2 - x)

		const velocity = {
			x: Math.cos(angle)*(1+score/15000),
			y: Math.sin(angle)*(1+score/15000)
		}
		enemies.push(new Enemy(x, y, radius, color, velocity))
	},1000 - (score/100))//적 생성 시간
}
//---------------
let animationId
let score = 0
function animate() {
	animationId = requestAnimationFrame(animate)
	ctx.fillStyle = `rgba(${score/2500},0,0,0.1)`
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	player.draw()
	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1)
		} else {
			particle.update()
		}
	})
	projectiles.forEach((projectile, index) => {
		projectile.update()
		//화면밖에 나간 탄 제거
		if (projectile.x + projectile.radius < 0 ||
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height) {
			setTimeout(() => {
				projectiles.splice(index, 1)
			}, 0)
		}
	})
	enemies.forEach((enemy, index) => {
		enemy.update()

		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
		//종료
		if (dist - enemy.radius - player.radius < 1) {
			
			cancelAnimationFrame(animationId)
			  clearInterval(spawn)
			modalEl.style.display = 'flex'
			bigScoreEl.innerHTML = score
		}

		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
			//오브젝트 닿았을때 
			if (dist - enemy.radius - projectile.radius < 1) {

				//create explosions
				for (let i = 0; i < enemy.radius * 4; i++) {
					particles.push(new Particle(
						projectile.x,
						projectile.y,
						Math.random() * 3,
						enemy.color,
						{
							x: (Math.random() - 0.5) * (Math.random() * 8),
							y: (Math.random() - 0.5) * (Math.random() * 8)
						})
					)
				}

				if (enemy.radius - 20 > 5) {

					score += 110
					scoreEl.innerHTML = score


					gsap.to(enemy, {
						radius: enemy.radius - 15
					})
					setTimeout(() => {
						projectiles.splice(projectileIndex, 1)
					}, 0)
				} else {
					score += 260
					scoreEl.innerHTML = score

					setTimeout(() => {
						enemies.splice(index, 1)
						projectiles.splice(projectileIndex, 1)
					}, 0)
				}
			}
		})
	})
}


addEventListener('click', (event) => {
	const angle = Math.atan2(
		event.clientY - canvas.height / 2,
		event.clientX - canvas.width / 2
	)
	const veloctiy = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5
	}
	projectiles.push(new Projectile(
		canvas.width / 2, canvas.height / 2,
		5, 'white', veloctiy
	))
})

startGameBtn.addEventListener('click', () => {
	 init()
	 animate()
	 spawnEnemies()
	 modalEl.style.display = 'none'
})