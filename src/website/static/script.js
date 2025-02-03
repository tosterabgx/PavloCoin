if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const score = {
    value: 0,
    level: 1,
    earnPerTap: 1,
    levelUpThreshold: 100,
    element: document.getElementById('score'),
    levelElement: document.getElementById('current-level'),
    earnElement: document.getElementById('earn-per-tap'),
    levelUpElement: document.getElementById('level-up-at'),

    increment(tapCount = 1) {
        this.value += this.earnPerTap * tapCount;
        this.checkLevelUp();
        this.update();
        sendScoreToServer();
    },

    checkLevelUp() {
        if (this.value >= this.levelUpThreshold) {
        this.level++;
        this.levelUpThreshold *= 10;
        this.earnPerTap = this.level; // Earn increases with level
        }
    },

    update() {
    this.element.textContent = this.value.toLocaleString();

    // Update "Current level"
    this.levelElement.querySelector('.panel-value').textContent = this.level;

    // Update "Earn per tap"
    this.earnElement.querySelector('.panel-value').textContent = this.earnPerTap;

    // Update "Level up at"
    this.levelUpElement.querySelector('.panel-value').textContent = this.levelUpThreshold.toLocaleString();
}

    };

    const userId = tg.initDataUnsafe?.user?.id;

    async function sendScoreToServer() {
        if (!userId) return;
    
        try {
            await fetch("/update_score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                score: score.value,
                level: score.level,
                earnPerTap: score.earnPerTap,
                levelUpThreshold: score.levelUpThreshold
            })
            });
        } catch (error) {
            console.error("Error sending score:", error);
        }
        }
    async function loadScore() {
        if (!userId) return;
    
        try {
            const res = await fetch(`/get_score?user_id=${userId}`);
            const data = await res.json();
    
            score.value = data.score || 0;
            score.level = data.level || 1;
            score.earnPerTap = data.earnPerTap || 1;
            score.levelUpThreshold = data.levelUpThreshold || 100;
    
            score.update();
        } catch (error) {
            console.error("Error loading score:", error);
        }
    }

    const coinButton = document.querySelector('.coin-button');

    coinButton.addEventListener('touchstart', (event) => {
        const touchCount = event.touches.length;
        score.increment(touchCount);
        event.preventDefault();
    });

    coinButton.addEventListener('click', () => score.increment());

    loadScore();
}
