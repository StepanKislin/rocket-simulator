class Game {
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.size = 50;
        this.score = 0;
        this.time = 0;
        this.health = 100;
        this.ammo = 30;
        this.isActive = false;
        this.keys = {};
        this.shield = false;

        this.player = { x: this.canvas.width/2 - 25, y: this.canvas.height - 70, vx: 0, vy: 0 };
        this.asteroids = [];
        this.coins = [];
        this.ammoBoxes = [];
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];

        document.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.code === 'Space') {
                if (!this.isActive) this.start();
                else if (this.ammo > 0) this.shoot();
            }
        });
        document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);

        setInterval(() => { if (this.isActive) this.spawn('asteroid'); }, 2000);
        setInterval(() => { if (this.isActive) this.spawn('coin'); }, 2000);
        setInterval(() => { if (this.isActive) this.spawn('ammo'); }, 10000);
        setInterval(() => { if (this.isActive) this.spawnEnemy(); }, 10000);
        setInterval(() => { if (this.isActive) this.time++; }, 1000);

        requestAnimationFrame(() => this.loop());
    }

    start() {
        document.getElementById('start-screen').style.display = 'none';
        this.score = 0;
        this.time = 0;
        this.health = 100;
        this.ammo = 30;
        this.isActive = true;
        this.asteroids = [];
        this.coins = [];
        this.ammoBoxes = [];
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
    }

    shoot() {
        this.ammo--;
        this.bullets.push({ x: this.player.x + 22, y: this.player.y - 20 });
    }

    spawn(type) {
        const obj = {
            x: Math.random() * (this.canvas.width - this.size),
            y: -this.size,
            speed: type === 'asteroid' ? 3 : 2
        };
        if (type === 'asteroid') this.asteroids.push(obj);
        else if (type === 'coin') this.coins.push(obj);
        else this.ammoBoxes.push(obj);
    }

    spawnEnemy() {
        if (this.enemies.length > 0) return;
        this.enemies.push({
            x: Math.random() * (this.canvas.width - this.size),
            y: 50,
            dx: Math.random() > 0.5 ? 3 : -3,
            health: [10, 20, 30][Math.floor(Math.random() * 3)],
            lastShot: 0
        });
    }

    loop() {
        if (this.isActive) {
            this.update();
            this.render();
        }
        requestAnimationFrame(() => this.loop());
    }

    update() {
        this.player.vx = (this.keys['d'] || this.keys['arrowright'] ? 1 : 0) - (this.keys['a'] || this.keys['arrowleft'] ? 1 : 0);
        this.player.vy = (this.keys['s'] || this.keys['arrowdown'] ? 1 : 0) - (this.keys['w'] || this.keys['arrowup'] ? 1 : 0);
        
        this.player.x += this.player.vx * 5;
        this.player.y += this.player.vy * 5;
        this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.size));
        this.player.y = Math.max(0, Math.min(this.player.y, this.canvas.height - this.size));

        this.asteroids.forEach(a => {
            a.y += a.speed;
            if (this.collides(this.player, a) && !this.shield) {
                this.health -= 20;
                if (this.health <= 0) this.gameOver();
            }
        });

        for (let i = this.coins.length - 1; i >= 0; i--) {
            this.coins[i].y += this.coins[i].speed;
            if (this.collides(this.player, this.coins[i])) {
                this.score++;
                if (this.score % 5 === 0) {
                    this.shield = true;
                    setTimeout(() => this.shield = false, 5000);
                }
                this.coins.splice(i, 1);
            }
        }

        for (let i = this.ammoBoxes.length - 1; i >= 0; i--) {
            this.ammoBoxes[i].y += this.ammoBoxes[i].speed;
            if (this.collides(this.player, this.ammoBoxes[i])) {
                this.ammo += 10;
                this.ammoBoxes.splice(i, 1);
            }
        }

        this.enemies.forEach(e => {
            e.x += e.dx;
            if (e.x <= 0 || e.x >= this.canvas.width - this.size) e.dx *= -1;
            
            if (Date.now() - e.lastShot > 1000) {
                this.enemyBullets.push({ x: e.x + 22, y: e.y + 50 });
                e.lastShot = Date.now();
            }
        });

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= 10;
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.collides(this.bullets[i], this.enemies[j])) {
                    this.enemies[j].health -= 10;
                    this.bullets.splice(i, 1);
                    if (this.enemies[j].health <= 0) this.enemies.splice(j, 1);
                    break;
                }
            }
        }

        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].y += 5;
            if (this.enemyBullets[i].y > this.canvas.height) {
                this.enemyBullets.splice(i, 1);
                continue;
            }
            
            if (this.collides(this.enemyBullets[i], this.player) && !this.shield) {
                this.health -= 10;
                if (this.health <= 0) this.gameOver();
                this.enemyBullets.splice(i, 1);
            }
        }

        this.asteroids = this.asteroids.filter(a => a.y < this.canvas.height);
        this.coins = this.coins.filter(c => c.y < this.canvas.height);
        this.ammoBoxes = this.ammoBoxes.filter(b => b.y < this.canvas.height);
        this.bullets = this.bullets.filter(b => b.y > 0);
        this.enemyBullets = this.enemyBullets.filter(b => b.y < this.canvas.height);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#4a86e8';
        this.ctx.fillRect(this.player.x, this.player.y, this.size, this.size);
        if (this.shield) {
            this.ctx.strokeStyle = '#0ff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + 25, this.player.y + 25, 35, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.asteroids.forEach(a => {
            this.ctx.fillStyle = '#777';
            this.ctx.fillRect(a.x, a.y, this.size, this.size);
        });

        this.coins.forEach(c => {
            this.ctx.fillStyle = '#ff0';
            this.ctx.beginPath();
            this.ctx.arc(c.x + 25, c.y + 25, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ammoBoxes.forEach(b => {
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(b.x, b.y, this.size, this.size);
        });

        this.enemies.forEach(e => {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(e.x, e.y, this.size, this.size);
        });

        this.bullets.forEach(b => {
            this.ctx.fillStyle = '#ff0';
            this.ctx.fillRect(b.x, b.y, 6, 20);
        });

        this.enemyBullets.forEach(b => {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(b.x, b.y, 6, 20);
        });

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Время: ${Math.floor(this.time/60).toString().padStart(2,'0')}:${(this.time%60).toString().padStart(2,'0')}`, 10, 25);
        this.ctx.fillText(`Монеты: ${this.score}`, 10, 50);
        this.ctx.fillText(`Патроны: ${this.ammo}`, 10, 75);

        this.ctx.fillStyle = this.health < 30 ? '#f00' : this.health < 60 ? '#ff0' : '#0f0';
        this.ctx.fillRect(this.canvas.width - 210, 10, this.health * 2, 20);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.canvas.width - 210, 10, 200, 20);
    }

    collides(a, b) {
        return a.x < b.x + this.size &&
               a.x + this.size > b.x &&
               a.y < b.y + this.size &&
               a.y + this.size > b.y;
    }

    gameOver() {
        this.isActive = false;
        document.getElementById('final-score').textContent = `Твой результат: ${this.time} сек, ${this.score} монет`;
        document.getElementById('game-over').style.display = 'grid';
        
        fetch('http://localhost:8082/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: document.getElementById('player-name').value,
                user: document.getElementById('player-name').value,
                time: `${Math.floor(this.time/60).toString().padStart(2,'0')}:${(this.time%60).toString().padStart(2,'0')}`
            })
        }).catch(e => console.log('Ошибка отправки:', e));
    }
}

new Game();