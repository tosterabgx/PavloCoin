if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const score = {
    value: 0,
    level: 1,
    earnPerTap: 1,
    levelUpThreshold: 100,
    energyLeft: 1000,
    maxEnergy: 1000,
    element: document.getElementById('score'),
    levelElement: document.getElementById('energy-left'),
    earnElement: document.getElementById('earn-per-tap'),
    levelUpElement: document.getElementById('level-up-at'),

    increment(tapCount = 1) {
        // Check if we have enough energy
        if (this.energyLeft <= 0) {
            return; // Don't allow tapping if no energy left
        }
        
        this.value += this.earnPerTap * tapCount;
        this.energyLeft -= tapCount;
        this.checkLevelUp();
        this.update();
        sendScoreToServer();
    },

    checkLevelUp() {
        if (this.value >= this.levelUpThreshold) {
        this.level++;
        this.levelUpThreshold *= 10;
        this.earnPerTap = this.level;
        // Don't immediately update energy - it will update next day
        
        // Add level up animation
        const coins = document.querySelectorAll('[class^="coin-"]');
        coins.forEach(coin => {
            // Skip the coin button
            if (coin.classList.contains('button')) return;
            
            // Store original transform
            if (!coin.dataset.originalTransform) {
                coin.dataset.originalTransform = getComputedStyle(coin).transform;
            }
            
            // Subtle scatter effect
            const randomX = (Math.random() - 0.5) * 800; // Reduced from 50 to 20
            const randomY = (Math.random() - 0.5) * 800; // Reduced from 50 to 20
            const randomRotate = (Math.random() - 0.5) * 40; // Reduced from 180 to 30
            
            coin.style.transform = `${coin.dataset.originalTransform} translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
            
            // Reset to original position after animation
            setTimeout(() => {
                coin.style.transform = coin.dataset.originalTransform;
            }, 500);
        });
        }
    },

    update() {
    this.element.textContent = this.value.toLocaleString();

    // Update "Energy left"
    this.levelElement.querySelector('.panel-value').textContent = this.energyLeft.toLocaleString();

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
            const initData = tg.initData;
            
            await fetch("/update_score", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Telegram-Init-Data": initData
                },
                body: JSON.stringify({
                    user_id: userId,
                    score: score.value,
                    level: score.level,
                    earnPerTap: score.earnPerTap,
                    levelUpThreshold: score.levelUpThreshold,
                    energyLeft: score.energyLeft,
                    maxEnergy: score.maxEnergy,
                    timestamp: Date.now()
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
    
            // Check if it's a new day and reset energy if needed
            const lastResetTime = data.lastResetTime || Date.now() / 1000;
            const currentTime = Date.now() / 1000;
            const isNewDay = (currentTime - lastResetTime) >= 86400;

            score.value = data.score || 0;
            score.level = data.level || 1;
            score.earnPerTap = data.earnPerTap || 1;
            score.levelUpThreshold = data.levelUpThreshold || 100;
            
            if (isNewDay) {
                // Reset energy to max on new day
                score.energyLeft = score.level * 1000;
                score.maxEnergy = score.level * 1000;
            } else {
                score.energyLeft = data.energyLeft || 1000;
                score.maxEnergy = data.maxEnergy || 1000;
            }

            score.update();
        } catch (error) {
            console.error("Error loading score:", error);
        }
    }

    const coinButton = document.querySelector('button');

    coinButton.addEventListener('touchstart', (event) => {
        const touchCount = event.touches.length;
        score.increment(touchCount);
        coinButton.style.transform = 'scale(0.95)';
        
        // Check if HapticFeedback is available and supported
        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
            tg.HapticFeedback.impactOccurred(); // Trigger haptic feedback on touch
        } else {
            console.warn("HapticFeedback is not supported in this version."); // Warning message
        }
        
        event.preventDefault();
    });

    coinButton.addEventListener('touchend', () => {
        coinButton.style.transform = 'scale(1)';
    });

    coinButton.addEventListener('click', () => {
        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
            tg.HapticFeedback.impactOccurred(); // Trigger haptic feedback on click
        } else {
            console.warn("HapticFeedback is not supported in this version."); // Warning message
        }
        score.increment();
    });

    loadScore();
}
