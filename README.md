# 뚝배기 팡팡! 스트레스 팡팡! 🍳

전통적인 두더지잡기 게임을 뚝배기 터트리기 게임으로 재해석한 모바일 웹 게임입니다.

## 🎮 게임 특징

- **3x3 가스레인지**: 9개의 화구에서 뚝배기가 튀어나옵니다
- **무한 게임 플레이**: 시간 제한 없이 계속 플레이 가능
- **다양한 뚝배기**: 일반 뚝배기와 황금뚝배기 (10% 확률)
- **황금뚝배기 보너스**: 5점 + 시간 5초 추가
- **실시간 랭킹**: 구글 스프레드시트 기반 실시간 랭킹 시스템
- **모바일 최적화**: 아이폰 기준 모바일 웹뷰에 최적화
- **사용자 계정**: 이름 + 비밀번호 4자리로 개인 정보 관리
- **게임 컨트롤**: 시작, 일시정지, 강제종료 버튼

## 🎯 게임 규칙

1. **로그인**: 이름과 비밀번호 4자리 입력
2. **무한 플레이**: 시간 제한 없이 계속 게임 가능
3. **뚝배기 유지 시간**: 0.5초, 1초, 1.5초, 2초 (랜덤)
4. **점수 시스템**:
   - 일반 뚝배기: 1점
   - 황금뚝배기: 5점 + 시간 5초 추가
5. **랭킹**: 총점 기준으로 상위 10명 표시

## 🚀 설치 및 실행

### 1. 파일 다운로드
```bash
git clone [repository-url]
cd punch
```

### 2. 로컬 실행
```bash
# Python 3의 내장 서버 사용
python -m http.server 8000

# 또는 Node.js의 http-server 사용
npx http-server
```

### 3. 브라우저에서 접속
```
http://localhost:8000
```

## 📊 구글 스프레드시트 연동 설정

### 1. 구글 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성
2. 스프레드시트 ID 복사 (URL에서 `/d/`와 `/edit` 사이의 문자열)

### 2. Google Apps Script 설정
1. [Google Apps Script](https://script.google.com) 접속
2. 새 프로젝트 생성
3. `google-apps-script.gs` 파일의 내용을 복사하여 붙여넣기
4. `SPREADSHEET_ID` 변수에 실제 스프레드시트 ID 입력

### 3. 웹앱 배포
1. Google Apps Script에서 "배포" → "새 배포" 클릭
2. 유형: "웹앱" 선택
3. 실행: "나" 선택
4. 액세스 권한: "모든 사용자" 선택
5. 배포 후 생성된 웹앱 URL 복사

### 4. JavaScript 코드 업데이트
`script.js` 파일에서 `YOUR_GOOGLE_APPS_SCRIPT_URL`을 실제 웹앱 URL로 교체:

```javascript
const scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### 5. 스프레드시트 초기 설정
Google Apps Script 편집기에서 `setupSpreadsheet` 함수를 한 번 실행하여 필요한 시트를 생성합니다.

## 📁 프로젝트 구조

```
punch/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일
├── script.js           # 게임 로직
├── google-apps-script.gs # 구글 스프레드시트 연동
└── README.md           # 프로젝트 설명서
```

## 🎨 디자인 특징

- **색상**: 녹색 톤의 게임 테마
- **폰트**: Pretendard (한국어 최적화)
- **반응형**: 모바일 디바이스 최적화
- **애니메이션**: GSAP 라이브러리 활용
- **파티클 효과**: 황금뚝배기 터트릴 때 금색 파티클

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **애니메이션**: GSAP (GreenSock)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **폰트**: Pretendard

## 📱 모바일 최적화

- 터치 이벤트 최적화
- 뷰포트 설정
- 스케일 방지
- 탭 하이라이트 제거
- 터치 액션 최적화

## 🎮 게임 컨트롤

- **시작 버튼**: 게임 시작 또는 재시작
- **일시정지 버튼**: 게임 일시 정지/재개
- **강제종료 버튼**: 게임 즉시 종료

## 🏆 랭킹 시스템

### 실시간 랭킹 업데이트
- **실제 데이터 기반**: 구글 스프레드시트의 실제 게임 플레이 데이터로 랭킹 산출
- **자동 업데이트**: 게임 화면 진입 시 자동으로 최신 랭킹 로드
- **수동 새로고침**: 새로고침 버튼으로 언제든지 최신 랭킹 확인 가능
- **빈 데이터 처리**: 게임 기록이 없을 때 안내 메시지 표시

### userdata 시트 구조
- `name`: 플레이어 이름
- `password`: 비밀번호 (4자리 숫자)
- `totalScore`: 총 점수
- `totalGoldenPots`: 총 황금뚝배기
- `totalGames`: 총 게임 수
- `bestScore`: 최고 점수
- `lastPlayed`: 마지막 플레이 시간

### gamehistory 시트 구조
- `timestamp`: 게임 시간
- `playerName`: 플레이어 이름
- `score`: 게임 점수
- `goldenPots`: 황금뚝배기 수
- `playTime`: 플레이 시간

## 🔐 사용자 인증

- **이름**: 최대 10자
- **비밀번호**: 4자리 숫자
- **자동 등록**: 첫 로그인 시 자동으로 계정 생성
- **데이터 연동**: 개인별 게임 기록 저장

## 🐛 문제 해결

### 구글 스프레드시트 연동 오류
1. 스프레드시트 ID 확인
2. 웹앱 URL 확인
3. 스프레드시트 권한 설정 확인
4. Google Apps Script 로그 확인

### CORS 오류
- Google Apps Script 웹앱이 올바르게 배포되었는지 확인
- 웹앱 URL이 정확한지 확인

### 뚝배기가 나타나지 않는 문제
1. 게임 시작 버튼을 눌렀는지 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. JavaScript 파일이 올바르게 로드되었는지 확인

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**즐거운 뚝배기 터트리기 되세요! 🍳💥** 