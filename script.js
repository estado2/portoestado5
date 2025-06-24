// 게임 상태 관리
class PotSmashGame {
    constructor() {
        this.score = 0;
        this.goldenPots = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.gamePaused = false;
        this.currentPot = null;
        this.potTimeouts = [];
        this.playerName = '';
        this.playerPassword = '';
        this.gameStartTime = null;
        this.timerInterval = null;
        
        // 뚝배기 유지 시간 옵션 (초 단위)
        this.potDurations = [0.5, 1, 1.5, 2];
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.endScreen = document.getElementById('endScreen');
        this.playerNameInput = document.getElementById('playerName');
        this.playerPasswordInput = document.getElementById('playerPassword');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.stoveGrid = document.getElementById('stoveGrid');
        this.rankingList = document.getElementById('rankingList');
        this.refreshRankingBtn = document.getElementById('refreshRankingBtn');
        this.finalScoreElement = document.getElementById('finalScore');
        this.goldenPotsElement = document.getElementById('goldenPots');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.backToStartBtn = document.getElementById('backToStartBtn');
        this.particleContainer = document.getElementById('particleContainer');
        
        // 게임 컨트롤 버튼
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.endBtn = document.getElementById('endBtn');
    }

    bindEvents() {
        this.startGameBtn.addEventListener('click', () => this.login());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.backToStartBtn.addEventListener('click', () => this.showStartScreen());
        
        // 게임 컨트롤 버튼
        this.startBtn.addEventListener('click', () => this.startGamePlay());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.endBtn.addEventListener('click', () => this.endGame());
        
        // 랭킹 새로고침 버튼
        this.refreshRankingBtn.addEventListener('click', () => this.refreshRankings());
        
        // 뚝배기 클릭 이벤트
        this.stoveGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('pot') && this.gameActive && !this.gamePaused) {
                this.hitPot(e.target);
            }
        });

        // 엔터키로 로그인
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.playerPasswordInput.focus();
            }
        });
        
        this.playerPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.login();
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
        
        // 게임 화면으로 이동할 때 랭킹 로드
        if (screenId === 'gameScreen') {
            this.loadRankings();
        }
    }

    showStartScreen() {
        this.showScreen('startScreen');
        this.playerNameInput.focus();
        this.resetGame();
    }

    login() {
        const playerName = this.playerNameInput.value.trim();
        const playerPassword = this.playerPasswordInput.value.trim();
        
        if (!playerName) {
            alert('플레이어 이름을 입력해주세요!');
            return;
        }
        
        if (!playerPassword || playerPassword.length !== 4 || !/^\d{4}$/.test(playerPassword)) {
            alert('비밀번호는 4자리 숫자로 입력해주세요!');
            return;
        }

        this.playerName = playerName;
        this.playerPassword = playerPassword;
        
        // 로그인 처리
        this.performLogin();
    }

    async performLogin() {
        try {
            const loginData = {
                playerName: this.playerName,
                playerPassword: this.playerPassword
            };

            // Google Apps Script 웹앱 URL (실제 배포 후 URL로 교체 필요)
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbw9LrpLMznPuqfzTQGvsSEULHNAAg7pyqOINjfjbXtYMJsxDhEifxC7-EEqZyGEc4PI/exec';
            
            const response = await fetch(scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    data: loginData
                })
            });

            if (!response.ok) {
                throw new Error('로그인 요청 실패');
            }

            const result = await response.json();
            
            if (result.success) {
                // 게임 화면으로 이동
                this.showScreen('gameScreen');
                this.resetGame();
                console.log(result.message);
            } else {
                alert('로그인 중 오류가 발생했습니다: ' + result.error);
            }
        } catch (error) {
            console.error('로그인 중 오류:', error);
            // 오프라인 모드로 진행
            this.showScreen('gameScreen');
            this.resetGame();
        }
    }

    startGamePlay() {
        if (this.gameActive && !this.gamePaused) return;
        
        if (this.gamePaused) {
            // 일시정지 해제
            this.gamePaused = false;
            this.startBtn.textContent = '시작';
            this.pauseBtn.disabled = false;
            this.startTimer();
            this.spawnPot();
        } else {
            // 새 게임 시작
            this.gameActive = true;
            this.gamePaused = false;
            this.gameStartTime = new Date();
            this.startBtn.textContent = '재시작';
            this.pauseBtn.disabled = false;
            
            // 게임 시작
            this.startTimer();
            this.spawnPot();
        }
    }

    pauseGame() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.gamePaused = true;
        this.startBtn.textContent = '재개';
        this.pauseBtn.disabled = true;
        
        // 타이머 정지
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // 뚝배기 타이머 정지
        this.potTimeouts.forEach(timeout => clearTimeout(timeout));
        this.potTimeouts = [];
    }

    resetGame() {
        this.score = 0;
        this.goldenPots = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.gamePaused = false;
        this.currentPot = null;
        
        // 기존 뚝배기 제거
        this.clearAllPots();
        this.clearParticleEffects();
        
        // 기존 타이머 정리
        this.potTimeouts.forEach(timeout => clearTimeout(timeout));
        this.potTimeouts = [];
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // UI 업데이트
        this.updateUI();
        this.updateControlButtons();
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

    updateControlButtons() {
        this.startBtn.textContent = '시작';
        this.pauseBtn.disabled = true;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gameActive || this.gamePaused) {
                return;
            }

            this.timeLeft -= 0.01;
            this.updateTimer();

            // 무한 게임 플레이 - 시간이 0이 되어도 게임 종료하지 않음
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                // 게임은 계속 진행
            }
        }, 10);
    }

    updateTimer() {
        this.timerElement.textContent = this.timeLeft.toFixed(2);
    }

    spawnPot() {
        if (!this.gameActive || this.gamePaused) return;

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
            if (potContainer.contains(pot) && this.gameActive && !this.gamePaused) {
                potContainer.classList.remove('show');
                setTimeout(() => {
                    if (potContainer.contains(pot)) {
                        potContainer.innerHTML = '';
                    }
                }, 300);
                
                // 다음 뚝배기 생성
                if (this.gameActive && !this.gamePaused) {
                    this.spawnPot();
                }
            }
        }, duration * 1000);

        this.potTimeouts.push(timeout);
        this.currentPot = pot;
    }

    hitPot(pot) {
        if (!this.gameActive || this.gamePaused || !pot) return;

        const isGolden = pot.dataset.isGolden === 'true';
        
        // 점수 추가
        if (isGolden) {
            this.score += 5;
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
            if (this.gameActive && !this.gamePaused) {
                this.spawnPot();
            }
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
    }

    async endGame() {
        this.gameActive = false;
        this.gamePaused = false;
        
        // 기존 뚝배기 제거
        this.clearAllPots();
        this.clearParticleEffects();
        
        // 타이머 정리
        this.potTimeouts.forEach(timeout => clearTimeout(timeout));
        this.potTimeouts = [];
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // 게임 결과 저장
        await this.saveGameResult();
        
        // 랭킹 업데이트
        await this.loadRankings();
        
        // 종료 화면 표시
        this.showEndScreen();
    }

    showEndScreen() {
        this.finalScoreElement.textContent = `${this.score}점`;
        this.goldenPotsElement.textContent = `${this.goldenPots}개`;
        this.showScreen('endScreen');
    }

    playAgain() {
        this.showScreen('gameScreen');
        this.resetGame();
    }

    // 구글 스프레드시트 연동
    async saveGameResult() {
        try {
            const gameData = {
                playerName: this.playerName,
                playerPassword: this.playerPassword,
                score: this.score,
                goldenPots: this.goldenPots,
                playTime: 30 - this.timeLeft,
                timestamp: new Date().toISOString()
            };

            // Google Apps Script 웹앱 URL (실제 배포 후 URL로 교체 필요)
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbw9LrpLMznPuqfzTQGvsSEULHNAAg7pyqOINjfjbXtYMJsxDhEifxC7-EEqZyGEc4PI/exec';
            
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
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbw9LrpLMznPuqfzTQGvsSEULHNAAg7pyqOINjfjbXtYMJsxDhEifxC7-EEqZyGEc4PI/exec';
            
            const response = await fetch(`${scriptUrl}?action=getRankings`);
            
            if (!response.ok) {
                throw new Error('랭킹 데이터 요청 실패');
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.displayRankings(result.rankings);
            } else {
                throw new Error(result.error || '랭킹 데이터 로드 실패');
            }
        } catch (error) {
            console.error('랭킹 로드 중 오류:', error);
            this.displayEmptyRankings();
        }
    }

    async refreshRankings() {
        // 새로고침 버튼 비활성화
        this.refreshRankingBtn.disabled = true;
        this.refreshRankingBtn.textContent = '🔄 로딩중...';
        
        try {
            await this.loadRankings();
        } catch (error) {
            console.error('랭킹 새로고침 중 오류:', error);
        } finally {
            // 새로고침 버튼 활성화
            this.refreshRankingBtn.disabled = false;
            this.refreshRankingBtn.textContent = '🔄 새로고침';
        }
    }

    displayRankings(rankings) {
        this.rankingList.innerHTML = '';
        
        if (!rankings || rankings.length === 0) {
            this.displayEmptyRankings();
            return;
        }
        
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

    displayEmptyRankings() {
        this.rankingList.innerHTML = `
            <div class="ranking-item empty">
                아직 게임 기록이 없습니다.<br>
                첫 번째 게임을 플레이해보세요!
            </div>
        `;
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    const game = new PotSmashGame();
    
    // 전역 변수로 게임 인스턴스 저장 (디버깅용)
    window.game = game;
}); 