// 게임 상태 관리
class PotSmashGame {
    constructor() {
        this.score = 0;
        this.coins = 0;
        this.goldenPots = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.currentPot = null;
        this.potTimeouts = [];
        this.playerName = '';
        this.gameStartTime = null;
        
        // 뚝배기 유지 시간 옵션 (초 단위)
        this.potDurations = [0.5, 1, 1.5, 2];
        
        this.initializeElements();
        this.bindEvents();
        this.loadRankings();
    }

    initializeElements() {
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.endScreen = document.getElementById('endScreen');
        this.playerNameInput = document.getElementById('playerName');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.coinsElement = document.getElementById('coins');
        this.stoveGrid = document.getElementById('stoveGrid');
        this.rankingList = document.getElementById('rankingList');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalCoinsElement = document.getElementById('finalCoins');
        this.goldenPotsElement = document.getElementById('goldenPots');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.backToStartBtn = document.getElementById('backToStartBtn');
        this.particleContainer = document.getElementById('particleContainer');
    }

    bindEvents() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.backToStartBtn.addEventListener('click', () => this.showStartScreen());
        
        // 뚝배기 클릭 이벤트
        this.stoveGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('pot') && this.gameActive) {
                this.hitPot(e.target);
            }
        });

        // 엔터키로 게임 시작
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
    }

    showScreen(screenId) {
        // 모든 화면 숨기기
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 지정된 화면 보이기
        document.getElementById(screenId).classList.add('active');
    }

    showStartScreen() {
        this.showScreen('startScreen');
        this.playerNameInput.focus();
    }

    startGame() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            alert('플레이어 이름을 입력해주세요!');
            return;
        }

        this.playerName = playerName;
        this.resetGame();
        this.showScreen('gameScreen');
        this.gameActive = true;
        this.gameStartTime = new Date();
        
        // 게임 시작
        this.startTimer();
        this.spawnPot();
    }

    resetGame() {
        this.score = 0;
        this.coins = 0;
        this.goldenPots = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.currentPot = null;
        
        // 기존 뚝배기 제거
        this.clearAllPots();
        this.clearParticleEffects();
        
        // 기존 타이머 정리
        this.potTimeouts.forEach(timeout => clearTimeout(timeout));
        this.potTimeouts = [];
        
        // UI 업데이트
        this.updateUI();
    }

    clearAllPots() {
        document.querySelectorAll('.pot-container').forEach(container => {
            container.innerHTML = '';
            container.classList.remove('show');
        });
    }

    clearParticleEffects() {
        this.particleContainer.innerHTML = '';
    }

    startTimer() {
        const timerInterval = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(timerInterval);
                return;
            }

            this.timeLeft -= 0.01;
            this.updateTimer();

            if (this.timeLeft <= 0) {
                this.endGame();
                clearInterval(timerInterval);
            }
        }, 10);
    }

    updateTimer() {
        this.timerElement.textContent = this.timeLeft.toFixed(2);
    }

    spawnPot() {
        if (!this.gameActive) return;

        // 기존 뚝배기 제거
        this.clearAllPots();

        // 랜덤 위치 선택
        const randomIndex = Math.floor(Math.random() * 9);
        const potContainer = this.stoveGrid.children[randomIndex].querySelector('.pot-container');

        // 황금뚝배기 확률 (10%)
        const isGolden = Math.random() < 0.1;
        
        // 뚝배기 생성
        const pot = document.createElement('div');
        pot.className = `pot ${isGolden ? 'golden' : 'normal'}`;
        pot.dataset.isGolden = isGolden;
        
        potContainer.appendChild(pot);
        potContainer.classList.add('show');

        // 유지 시간 설정
        const duration = isGolden ? 0.5 : this.potDurations[Math.floor(Math.random() * this.potDurations.length)];
        
        // 뚝배기 자동 사라짐
        const timeout = setTimeout(() => {
            if (potContainer.contains(pot)) {
                potContainer.classList.remove('show');
                setTimeout(() => {
                    potContainer.innerHTML = '';
                }, 300);
            }
        }, duration * 1000);

        this.potTimeouts.push(timeout);
        this.currentPot = pot;
    }

    hitPot(pot) {
        if (!this.gameActive || !pot) return;

        const isGolden = pot.dataset.isGolden === 'true';
        
        // 점수 추가
        if (isGolden) {
            this.score += 5;
            this.coins += 1;
            this.goldenPots += 1;
            this.timeLeft += 5; // 시간 5초 추가
            this.createGoldenParticleEffect(pot);
        } else {
            this.score += 1;
        }

        // 뚝배기 터짐 효과
        pot.classList.add('hit');
        
        // UI 업데이트
        this.updateUI();

        // 0.5초 후 다음 뚝배기 생성
        setTimeout(() => {
            this.spawnPot();
        }, 500);
    }

    createGoldenParticleEffect(pot) {
        const rect = pot.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 파티클 생성
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (i / 15) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            this.particleContainer.appendChild(particle);

            // GSAP 애니메이션
            gsap.to(particle, {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                opacity: 0,
                scale: 0,
                duration: 1 + Math.random(),
                ease: "power2.out",
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }

    updateUI() {
        this.scoreElement.textContent = `${this.score}점`;
        this.timerElement.textContent = this.timeLeft.toFixed(2);
        this.coinsElement.textContent = this.coins;
    }

    async endGame() {
        this.gameActive = false;
        
        // 기존 뚝배기 제거
        this.clearAllPots();
        this.clearParticleEffects();
        
        // 타이머 정리
        this.potTimeouts.forEach(timeout => clearTimeout(timeout));
        this.potTimeouts = [];

        // 게임 결과 저장
        await this.saveGameResult();
        
        // 랭킹 업데이트
        await this.loadRankings();
        
        // 종료 화면 표시
        this.showEndScreen();
    }

    showEndScreen() {
        this.finalScoreElement.textContent = `${this.score}점`;
        this.finalCoinsElement.textContent = `${this.coins}개`;
        this.goldenPotsElement.textContent = `${this.goldenPots}개`;
        this.showScreen('endScreen');
    }

    playAgain() {
        this.startGame();
    }

    // 구글 스프레드시트 연동
    async saveGameResult() {
        try {
            const gameData = {
                playerName: this.playerName,
                score: this.score,
                coins: this.coins,
                goldenPots: this.goldenPots,
                playTime: 30 - this.timeLeft,
                timestamp: new Date().toISOString()
            };

            // Google Apps Script 웹앱 URL (실제 배포 후 URL로 교체 필요)
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbxRQSX2bRV5cDbs-LT-wiVfO2Hdu9DDqHHvBLTajcWdt0of3cbR68xPUSEhGMAJcmhB/exec';
            
            const response = await fetch(scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'saveGameResult',
                    data: gameData
                })
            });

            if (!response.ok) {
                console.error('게임 결과 저장 실패');
            }
        } catch (error) {
            console.error('게임 결과 저장 중 오류:', error);
        }
    }

    async loadRankings() {
        try {
            // Google Apps Script 웹앱 URL (실제 배포 후 URL로 교체 필요)
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbxRQSX2bRV5cDbs-LT-wiVfO2Hdu9DDqHHvBLTajcWdt0of3cbR68xPUSEhGMAJcmhB/exec';
            
            const response = await fetch(`${scriptUrl}?action=getRankings`);
            const rankings = await response.json();

            this.displayRankings(rankings);
        } catch (error) {
            console.error('랭킹 로드 중 오류:', error);
            // 오프라인 모드용 더미 데이터
            this.displayRankings(this.getDummyRankings());
        }
    }

    displayRankings(rankings) {
        this.rankingList.innerHTML = '';
        
        rankings.forEach((player, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            if (player.name === this.playerName) {
                rankingItem.classList.add('current');
            }

            const rankClass = index < 3 ? index + 1 : 'other';
            const rankText = index < 3 ? ['🥇', '🥈', '🥉'][index] : (index + 1);

            rankingItem.innerHTML = `
                <div class="rank ${rankClass}">${rankText}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-stats">
                        ${player.score}점 | 황금뚝배기 ${player.goldenPots}개 | 게임 ${player.totalGames}회
                    </div>
                </div>
            `;

            this.rankingList.appendChild(rankingItem);
        });
    }

    getDummyRankings() {
        return [
            { name: '플레이어1', score: 45, goldenPots: 3, totalGames: 5 },
            { name: '플레이어2', score: 38, goldenPots: 2, totalGames: 3 },
            { name: '플레이어3', score: 32, goldenPots: 1, totalGames: 4 },
            { name: '플레이어4', score: 28, goldenPots: 0, totalGames: 2 },
            { name: '플레이어5', score: 25, goldenPots: 1, totalGames: 3 }
        ];
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    const game = new PotSmashGame();
    
    // 전역 변수로 게임 인스턴스 저장 (디버깅용)
    window.game = game;
}); 