if (!('vibrate' in navigator)) {
    console.log('Vibration API not supported');
}

if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand(); // Expands the Mini-App UI

    const score = {
        value: 0,
        element: document.getElementById('score'),
        
        increment() {
            this.value++;
            this.update();
            sendScoreToServer();
        },
        
        update() {
            this.element.textContent = this.value.toLocaleString();
        }
    };

    // Get Telegram User ID
    const userId = tg.initDataUnsafe?.user?.id;

    async function sendScoreToServer() {
        if (!userId) {
            console.error("User ID not found!");
            return;
        }

        try {
            await fetch("/update_score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    score: score.value
                })
            });
        } catch (error) {
            console.error("Error sending score:", error);
        }
    }

    const coinButton = document.querySelector('.coin-button');
    
    // Function to trigger haptic feedback
    function triggerHaptic() {
        if (window.navigator && window.navigator.vibrate) {
            // Trigger a short vibration (50ms)
            window.navigator.vibrate(50);
        }
    }

    // Touch event handler
    coinButton.addEventListener('touchstart', (event) => {
        // Get the number of touch points
        const touchCount = event.touches.length;
        // Increment score by the number of fingers
        score.value += touchCount;
        score.update();
        sendScoreToServer();
        triggerHaptic(); // Add haptic feedback
        
        // Prevent default touch behavior
        event.preventDefault();
    });

    // Click handler for mouse users
    coinButton.addEventListener('click', () => {
        score.increment();
        triggerHaptic(); // Add haptic feedback
    });

    // Load initial score from server
    async function loadScore() {
        if (!userId) return;

        try {
            const res = await fetch(`/get_score?user_id=${userId}`);
            const data = await res.json();
            score.value = data.score || 0;
            score.update();
        } catch (error) {
            console.error("Error loading score:", error);
        }
    }

    loadScore();
} else {
    console.error("Telegram WebApp SDK is not available.");
}
