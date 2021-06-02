var canvas = document.querySelector('canvas')
var ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let groundHeight = 70

function randomFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

class Star {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: 3
        }
        this.friction = 0.8
        this.gravity = 1.5
    }

    draw() {
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.shadowColor = "#E3EAEF"
        ctx.shadowBlur = 20
        ctx.fill()
        ctx.closePath()
        ctx.restore()
    }

    update() {
        this.draw()
        if (this.y + this.radius + this.velocity.y + groundHeight> canvas.height) {
            this.velocity.y = -this.velocity.y * this.friction
            this.shatter()
        }
        else {
            this.velocity.y += this.gravity
        }
        if (this.x + this.radius + this.velocity.x > canvas.width || this.x - this.radius - this.velocity.x <= 0) {
            this.velocity.x = -this.velocity.x * this.friction
            this.shatter()
        }
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
    shatter() {
        this.radius -= 3
        for (let i = 1; i <= 8; i++) {
            ministars.push(new MiniStar(this.x, this.y, 2, "rgba(227,234,239,1)"))
        }
    }
}

class MiniStar extends Star {
    constructor(x, y, radius, color) {
        super(x, y, radius, color)
        this.velocity = {
            x: randomFromRange(-5, 5),
            y: randomFromRange(-25, 25)
        }
        this.gravity = 0.5
        this.friction = 0.9
        this.ttl = 100
    }
    update() {
        this.draw()
        if (this.y + this.radius + this.velocity.y + groundHeight > canvas.height) {
            this.velocity.y = -this.velocity.y * this.friction
        }
        else {
            this.velocity.y += this.gravity
        }
        this.y += this.velocity.y
        this.x += this.velocity.x
        this.ttl -= 2
        this.opacity -= 1 / this.ttl
    }
}

let stars
let ministars
let bgstars
let ticker = 0
let spawnRate = 75
const bg = ctx.createLinearGradient(0, 0, 0, canvas.height)
bg.addColorStop(0, '#171E26')
bg.addColorStop(1, '#3F586B')

function init() {
    stars = []
    ministars = []
    bgstars = []

    for (let i = 1; i <= 150; i++) {
        const r = Math.random() * 5
        const x = Math.random() * (canvas.width - r), y = Math.random() * (canvas.height - r)
        bgstars.push(new Star(x, y, r, "white"))
    }
}

function animate() {
    requestAnimationFrame(animate)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    bgstars.forEach((bgstar, index) => {
        bgstar.draw()
    })

    createMountainRange(1, canvas.height - 50, "#384551")
    createMountainRange(2, canvas.height - 100, "#2B3843")
    createMountainRange(3, canvas.height - 300, "#26333E")

    ctx.fillStyle = '#182028'
    ctx.fillRect(0,canvas.height - groundHeight,canvas.width,groundHeight)

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

    ticker++
    if (ticker % spawnRate === 0) {
        const radius = 12
        let x = randomFromRange(radius, canvas.width - 12)
        stars.push(new Star(x, -100, 12, "#E3EAEF"))
        spawnRate = randomFromRange(75, 100)
    }
}

function createMountainRange(mountainAmount, height, color) {
    for (let i = 0; i < mountainAmount; i++) {
        let mountainW = canvas.width / mountainAmount
        ctx.beginPath()
        ctx.moveTo(i * mountainW, canvas.height)
        ctx.lineTo((i + 1) * mountainW + 300, canvas.height)
        ctx.lineTo((i + 0.5) * mountainW, canvas.height - height)
        ctx.lineTo(i * mountainW - 300, canvas.height)
        ctx.fillStyle = color
        ctx.fill()
        ctx.closePath()
    }
}

init()
animate()