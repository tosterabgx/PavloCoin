const score = {
    value: 0,
    element: document.getElementById('score'),
    
    increment() {
        this.value++;
        this.update();
    },
    
    update() {
        this.element.textContent = this.value.toLocaleString();
    }
};

// Function to handle button click
function handleButtonClick() {
    score.increment();
}

// Add event listener to the button
document.querySelector('.coin-button').addEventListener('click', handleButtonClick);

// Initial score display
score.update();

