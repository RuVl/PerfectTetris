const canvas = document.getElementById('fireworks'),
    contxt = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function getRandomColor() {
    let channel = () => Math.floor(Math.random() * 255).toString(16);
    return '#' + channel() + channel() + channel();
}

class Rocket {
    constructor(count) {
        let length = 7 + Math.random() * 5,
            speed = (5 + Math.random() * 5),
            angle = Math.PI/3 + Math.random() * Math.PI/3;

        this.timeout = Math.random() * count * 1.5;
        this.thickness = 2 + Math.random() * 1.5;
        this.color = getRandomColor();
        this.x = Math.random() * canvas.width;
        this.lenghtX = Math.cos(angle) * length;
        this.lenghtY = Math.sin(angle) * length;
        this.offsetX = Math.cos(angle) * speed;
        this.offsetY = Math.sin(angle) * speed;
        this.maxY = Math.random() * canvas.height * 2/3 + 50;
        this.y = canvas.height;
    }

    explode() {
        if (!this.particles.length) return -1;

        this.particles = this.particles.map((particle) => {
            if (particle.time <= 0) return -1;

            contxt.fillStyle = this.color;
            contxt.fillRect(particle.x, particle.y, this.thickness, this.thickness);

            particle.x -= particle.offsetX;
            particle.y -= particle.offsetY;
            particle.time--;

            return particle;
        }).filter(v => v !== -1);

        return this;
    }

    create_explode() {
        this.particles = [];
        for (let i = 0, max = 32; i < max; i++) {
            let speed = (1 + Math.random() * 4)/10,
                angle = Math.random() * Math.PI*2;

            this.particles.push({
                x: this.x,
                y: this.y,
                offsetX: speed * Math.cos(angle),
                offsetY: speed * Math.sin(angle),
                time: 100 + Math.random() * 100
            });
        }
    }

    render() {
        if (this.timeout > 0) {
            this.timeout--;
            return this;
        }

        if (this.y <= this.maxY) {
            return this.explode();
        }

        if (this.x + this.offsetX < 0) this.x = canvas.width;
        if (this.x + this.offsetX > canvas.width) this.x = 0;

        this.x -= this.offsetX;
        this.y -= this.offsetY;

        contxt.strokeStyle = this.color;
        contxt.lineWidth = this.thickness;

        contxt.beginPath();
        contxt.moveTo(this.x, this.y);
        contxt.lineTo(this.x + this.lenghtX, this.y + this.lenghtY);
        contxt.stroke();

        if (this.y <= this.maxY) this.create_explode();

        return this;
    }
}

class Fireworks {
    constructor(count) {
        this.isShooting = false;
        this.speed = 100;
        window.addEventListener('resize', this.resize);
    }

    shoot() {
        this.clear();
        this.rockets = this.rockets.map(rocket => rocket.render()).filter(v => v !== -1);

        if (!this.rockets) {
            this.isShooting = false;
            return;
        }

        setTimeout(() => {this.shoot()}, 1000/this.speed);
    }

    clear() {
        contxt.fillStyle = bg_color;
        contxt.fillRect(0, 0, canvas.width, canvas.height);
    }

    resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    run(count) {
        if (!this.rockets)
            this.rockets = Array(count);

        for (let i = 0; i < count; i++)
            this.rockets.push(new Rocket(this.rockets.length));

        if (!this.isShooting) {
            this.isShooting = true;
            this.shoot();
        }
    }
}