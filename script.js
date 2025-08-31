class CyberpunkRPS {
    constructor() {
        this.choices = ['rock', 'paper', 'scissors'];
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.maxRounds = 5;
        this.gameOver = false;
        this.isProcessing = false;
        
        this.elements = {
            playerScore: document.getElementById('playerScore'),
            computerScore: document.getElementById('computerScore'),
            currentRound: document.getElementById('currentRound'),
            playerChoice: document.getElementById('playerChoice'),
            computerChoice: document.getElementById('computerChoice'),
            resultDisplay: document.getElementById('resultDisplay'),
            gameStatus: document.getElementById('gameStatus'),
            resetBtn: document.getElementById('resetBtn'),
            choiceButtons: document.querySelectorAll('.choice-btn'),
            gameOverModal: document.getElementById('gameOverModal'),
            newGameBtn: document.getElementById('newGameBtn')
        };
        
        this.initializeGame();
    }

    initializeGame() {
        this.bindEvents();
        this.updateStatus('Neural interface online. Select your weapon...');
        this.playIntroAnimation();
    }

    bindEvents() {
        // Choice button events
        this.elements.choiceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleChoiceClick(e));
        });

        // Reset button event
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());

        // New game button event
        this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
    }

    handleKeyNavigation(e) {
        if (this.isProcessing || this.gameOver) return;

        const keyMappings = {
            '1': 'rock',
            '2': 'paper',
            '3': 'scissors',
            'r': 'rock',
            'p': 'paper',
            's': 'scissors'
        };

        if (keyMappings[e.key.toLowerCase()]) {
            e.preventDefault();
            this.playRound(keyMappings[e.key.toLowerCase()]);
        }
    }

    async handleChoiceClick(e) {
        if (this.isProcessing || this.gameOver) return;
        const choice = e.currentTarget.dataset.choice;
        await this.playRound(choice);
    }

    async playRound(playerChoice) {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.disableChoiceButtons();
        
        try {
            // Show player choice immediately
            this.showPlayerChoice(playerChoice);
            this.playSound('select');

            // Show computer thinking
            this.showComputerThinking();
            await this.delay(800);

            // Generate computer choice and determine winner
            const computerChoice = this.generateComputerChoice();
            const winner = this.determineWinner(playerChoice, computerChoice);

            // Update scores
            if (winner === 'player') {
                this.playerScore++;
            } else if (winner === 'computer') {
                this.computerScore++;
            }

            // Reveal computer choice
            this.showComputerChoice(computerChoice);
            await this.delay(600);

            // Show result
            this.showRoundResult(winner, playerChoice, computerChoice);
            this.updateScoreboard();
            
            // Play appropriate sound
            this.playSound(winner);

            // Check if game is over
            this.currentRound++;
            if (this.currentRound > this.maxRounds) {
                await this.delay(1500);
                this.endGame();
            } else {
                await this.delay(2000);
                this.prepareNextRound();
            }

        } catch (error) {
            console.error('Error during round play:', error);
            this.updateStatus('Error occurred. Please try again.');
        } finally {
            this.isProcessing = false;
            if (!this.gameOver) {
                this.enableChoiceButtons();
            }
        }
    }

    generateComputerChoice() {
        const randomIndex = Math.floor(Math.random() * this.choices.length);
        return this.choices[randomIndex];
    }

    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return 'draw';
        }

        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };

        return winConditions[playerChoice] === computerChoice ? 'player' : 'computer';
    }

    showPlayerChoice(choice) {
        const emoji = this.getChoiceEmoji(choice);
        this.elements.playerChoice.innerHTML = emoji;
        this.elements.playerChoice.classList.add('player-selected');
        
        // Highlight selected button
        this.elements.choiceButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.choice === choice) {
                btn.classList.add('selected');
            }
        });
    }

    showComputerThinking() {
        this.elements.computerChoice.innerHTML = '🤖';
        this.elements.computerChoice.classList.add('computer-thinking');
        this.updateStatus('CPU analyzing optimal strategy...');
    }

    showComputerChoice(choice) {
        const emoji = this.getChoiceEmoji(choice);
        this.elements.computerChoice.classList.remove('computer-thinking');
        this.elements.computerChoice.innerHTML = emoji;
        this.elements.computerChoice.classList.add('revealed');
    }

    showRoundResult(winner, playerChoice, computerChoice) {
        const message = this.getResultMessage(winner, playerChoice, computerChoice);
        
        this.elements.resultDisplay.classList.remove('show', 'win', 'lose', 'draw');
        this.elements.resultDisplay.querySelector('.result-text').textContent = message.main;
        this.elements.resultDisplay.querySelector('.result-subtext').textContent = message.sub;
        
        // Add result class and show
        this.elements.resultDisplay.classList.add('show', winner);
        
        // Update status
        this.updateStatus(`Round ${this.currentRound} complete`);
    }

    updateScoreboard() {
        this.elements.playerScore.textContent = this.playerScore;
        this.elements.computerScore.textContent = this.computerScore;
        this.elements.currentRound.textContent = Math.min(this.currentRound, this.maxRounds);

        // Add winner animation to score
        if (this.playerScore > this.computerScore) {
            this.elements.playerScore.classList.add('winner');
            setTimeout(() => {
                this.elements.playerScore.classList.remove('winner');
            }, 1000);
        } else if (this.computerScore > this.playerScore) {
            this.elements.computerScore.classList.add('winner');
            setTimeout(() => {
                this.elements.computerScore.classList.remove('winner');
            }, 1000);
        }
    }

    endGame() {
        this.gameOver = true;
        const gameWinner = this.determineGameWinner();
        this.showGameOverModal(gameWinner);
        this.playSound('gameOver');
    }

    determineGameWinner() {
        if (this.playerScore > this.computerScore) {
            return 'player';
        } else if (this.computerScore > this.playerScore) {
            return 'computer';
        } else {
            return 'draw';
        }
    }

    showGameOverModal(gameWinner) {
        const message = this.getGameOverMessage(gameWinner);
        
        document.getElementById('modalTitle').textContent = message.title;
        document.getElementById('modalResult').textContent = message.result;
        document.getElementById('modalDescription').textContent = message.description;
        
        this.elements.gameOverModal.classList.add('active');
    }

    startNewGame() {
        this.elements.gameOverModal.classList.remove('active');
        this.resetGame();
    }

    prepareNextRound() {
        // Clear choices and results
        this.elements.playerChoice.innerHTML = '<span class="choice-placeholder">?</span>';
        this.elements.computerChoice.innerHTML = '<span class="choice-placeholder">?</span>';
        this.elements.playerChoice.classList.remove('player-selected');
        this.elements.computerChoice.classList.remove('revealed');
        this.elements.resultDisplay.classList.remove('show', 'win', 'lose', 'draw');
        
        // Clear button states
        this.elements.choiceButtons.forEach(btn => {
            btn.classList.remove('selected');
        });

        this.updateStatus('Select your next protocol...');
    }

    resetGame() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.gameOver = false;
        this.isProcessing = false;
        
        // Reset UI elements
        this.elements.playerScore.textContent = '0';
        this.elements.computerScore.textContent = '0';
        this.elements.currentRound.textContent = '1';
        
        this.prepareNextRound();
        this.enableChoiceButtons();
        this.updateStatus('New tournament initialized. Make your choice...');
        
        this.playSound('reset');
    }

    disableChoiceButtons() {
        this.elements.choiceButtons.forEach(btn => {
            btn.disabled = true;
        });
    }

    enableChoiceButtons() {
        this.elements.choiceButtons.forEach(btn => {
            btn.disabled = false;
        });
    }

    updateStatus(message) {
        this.elements.gameStatus.querySelector('.status-text').textContent = message;
    }

    getChoiceEmoji(choice) {
        const emojis = {
            rock: '🗿',
            paper: '📄',
            scissors: '✂️'
        };
        return emojis[choice] || '❓';
    }

    getResultMessage(winner, playerChoice, computerChoice) {
        if (winner === 'draw') {
            return {
                main: 'NEURAL SYNC',
                sub: 'Both entities selected identical protocols'
            };
        }

        const winMessages = {
            player: {
                main: 'SYSTEM BREACH',
                sub: `Your ${playerChoice.toUpperCase()} protocol defeated COMPUTER ${computerChoice.toUpperCase()}`
            },
            computer: {
                main: 'FIREWALL ACTIVE',
                sub: `COMPUTER ${computerChoice.toUpperCase()} blocked your ${playerChoice.toUpperCase()} attempt`
            }
        };

        return winMessages[winner];
    }

    getGameOverMessage(gameWinner) {
        const messages = {
            player: {
                title: 'SYSTEM COMPROMISED',
                result: 'HUMAN VICTORY ACHIEVED',
                description: 'You have successfully breached the mainframe!'
            },
            computer: {
                title: 'ACCESS DENIED',
                result: 'COMPUTER DEFENSE SUCCESSFUL',
                description: 'The artificial intelligence has prevailed!'
            },
            draw: {
                title: 'EQUILIBRIUM STATE',
                result: 'NEURAL PARITY DETECTED',
                description: 'Human and AI capabilities are perfectly matched!'
            }
        };

        return messages[gameWinner];
    }

    // Simple sound effects using Web Audio API
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const soundMap = {
                select: { freq: 800, duration: 0.1, type: 'square' },
                player: { freq: 523, duration: 0.3, type: 'triangle' },
                computer: { freq: 277, duration: 0.3, type: 'triangle' },
                draw: { freq: 440, duration: 0.2, type: 'sine' },
                reset: { freq: 600, duration: 0.2, type: 'sawtooth' },
                gameOver: { freq: 220, duration: 0.5, type: 'square' }
            };

            const sound = soundMap[type];
            if (!sound) return;

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
            oscillator.type = sound.type;

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + sound.duration);
        } catch (error) {
            // Silently fail if audio is not supported
        }
    }

    playIntroAnimation() {
        const title = document.querySelector('.game-title');
        const scoreBoard = document.querySelector('.score-board');
        const gameArena = document.querySelector('.game-arena');
        const gameControls = document.querySelector('.game-controls');

        // Stagger entrance animations
        const elements = [title, scoreBoard, gameArena, gameControls];
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'all 0.8s ease-out';
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            }, index * 200);
        });
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new CyberpunkRPS();
    
    // Make game globally accessible for debugging
    window.cyberpunkRPS = game;
    
    console.log('🎮 NEON RPS Cyberpunk Edition Initialized');
    console.log('🎯 Use keys 1-3 or R/P/S for quick play');
});

// Initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    const game = new CyberpunkRPS();
    window.cyberpunkRPS = game;
}