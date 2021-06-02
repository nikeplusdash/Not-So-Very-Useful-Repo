var canvas = document.querySelector('canvas')
var ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

function randomFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function Star(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = {
        x: 0,
        y: 3
    }
    this.friction = 0.8
    this.gravity = 1
}

Star.prototype.draw = function () {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
}

Star.prototype.update = function () {
    this.draw()
    if (this.y + this.radius + this.velocity.y > canvas.height) {
        this.velocity.y = -this.velocity.y * this.friction
        this.shatter()
    }
    else {
        this.velocity.y += this.gravity
    }
    this.y += this.velocity.y
}

Star.prototype.shatter = function () {
    this.radius -= 3
    for (let i = 1; i <= 8; i++) {
        ministars.push(new MiniStar(this.x, this.y, 2, "red"))
    }
}

function MiniStar(x, y, radius, color) {
    Star.call(this, x, y, radius, color)
    this.velocity = {
        x: randomFromRange(-5, 5),
        y: randomFromRange(-25, 25)
    }
    this.gravity = 0.5
    this.friction = 0.9
    this.ttl = 100
}

MiniStar.prototype.draw = function () {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
}

MiniStar.prototype.update = function () {
    this.draw()
    if (this.y + this.radius + this.velocity.y > canvas.height) {
        this.velocity.y = -this.velocity.y * this.friction
    }
    else {
        this.velocity.y += this.gravity
    }
    this.y += this.velocity.y
    this.x += this.velocity.x
    this.ttl -= 1
}

let stars
let ministars
function init() {
    stars = []
    ministars = []
    for (let i = 1; i <= 1; i++) {
        stars.push(new Star(canvas.width / 2, 30, 30, "blue"))
    }
}

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    stars.forEach((star, index) => {
        if (star.radius == 0) {
            stars.splice(index, 1)
        }
        star.update()
    })
    ministars.forEach((ministar, index) => {
        if (ministar.ttl == 0) {
            ministars.splice(index, 1)
        }
        ministar.update()
    })
}

init()
animate()