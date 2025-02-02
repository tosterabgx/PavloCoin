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

    // Handle button clicks
    document.querySelector('.coin-button').addEventListener('click', () => {
        score.increment();
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
