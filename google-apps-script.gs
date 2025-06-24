// Google Apps Script for Pot Smash Game
// 구글 스프레드시트 ID를 여기에 입력하세요
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

// 웹앱으로 배포할 때 사용할 doPost 함수
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'saveGameResult':
        return saveGameResult(data.data);
      case 'login':
        return loginUser(data.data);
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Unknown action'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 웹앱으로 배포할 때 사용할 doGet 함수
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch(action) {
      case 'getRankings':
        return getRankings();
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Unknown action'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 사용자 로그인
function loginUser(loginData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userDataSheet = spreadsheet.getSheetByName('userdata');
    
    if (!userDataSheet) {
      throw new Error('userdata 시트를 찾을 수 없습니다.');
    }
    
    const data = userDataSheet.getDataRange().getValues();
    const headers = data[0];
    
    // 컬럼 인덱스 찾기
    const nameCol = headers.indexOf('name');
    const passwordCol = headers.indexOf('password');
    
    if (nameCol === -1 || passwordCol === -1) {
      throw new Error('필수 컬럼을 찾을 수 없습니다.');
    }
    
    // 사용자 찾기
    for (let i = 1; i < data.length; i++) {
      if (data[i][nameCol] === loginData.playerName && data[i][passwordCol] === loginData.playerPassword) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: '로그인 성공',
          userData: {
            name: data[i][nameCol],
            totalScore: data[i][headers.indexOf('totalScore')] || 0,
            totalGoldenPots: data[i][headers.indexOf('totalGoldenPots')] || 0,
            totalGames: data[i][headers.indexOf('totalGames')] || 0,
            bestScore: data[i][headers.indexOf('bestScore')] || 0
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 새 사용자 등록
    const newUserData = new Array(headers.length).fill('');
    newUserData[nameCol] = loginData.playerName;
    newUserData[passwordCol] = loginData.playerPassword;
    newUserData[headers.indexOf('totalScore')] = 0;
    newUserData[headers.indexOf('totalGoldenPots')] = 0;
    newUserData[headers.indexOf('totalGames')] = 0;
    newUserData[headers.indexOf('bestScore')] = 0;
    newUserData[headers.indexOf('lastPlayed')] = new Date().toISOString();
    
    userDataSheet.appendRow(newUserData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '새 사용자가 등록되었습니다.',
      userData: {
        name: loginData.playerName,
        totalScore: 0,
        totalGoldenPots: 0,
        totalGames: 0,
        bestScore: 0
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 게임 결과 저장
function saveGameResult(gameData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // gamehistory 시트에 게임 결과 저장
    const gameHistorySheet = spreadsheet.getSheetByName('gamehistory');
    if (!gameHistorySheet) {
      throw new Error('gamehistory 시트를 찾을 수 없습니다.');
    }
    
    const gameHistoryData = [
      gameData.timestamp,
      gameData.playerName,
      gameData.score,
      gameData.goldenPots,
      gameData.playTime
    ];
    
    gameHistorySheet.appendRow(gameHistoryData);
    
    // userdata 시트 업데이트
    updateUserData(gameData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '게임 결과가 저장되었습니다.'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 사용자 데이터 업데이트
function updateUserData(gameData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userDataSheet = spreadsheet.getSheetByName('userdata');
    
    if (!userDataSheet) {
      throw new Error('userdata 시트를 찾을 수 없습니다.');
    }
    
    const data = userDataSheet.getDataRange().getValues();
    const headers = data[0];
    
    // 컬럼 인덱스 찾기
    const nameCol = headers.indexOf('name');
    const passwordCol = headers.indexOf('password');
    const totalScoreCol = headers.indexOf('totalScore');
    const totalGoldenPotsCol = headers.indexOf('totalGoldenPots');
    const totalGamesCol = headers.indexOf('totalGames');
    const bestScoreCol = headers.indexOf('bestScore');
    const lastPlayedCol = headers.indexOf('lastPlayed');
    
    if (nameCol === -1) {
      throw new Error('name 컬럼을 찾을 수 없습니다.');
    }
    
    // 기존 사용자 찾기
    let userRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][nameCol] === gameData.playerName && data[i][passwordCol] === gameData.playerPassword) {
        userRowIndex = i + 1; // 시트는 1부터 시작
        break;
      }
    }
    
    if (userRowIndex === -1) {
      // 새 사용자 추가
      const newUserData = new Array(headers.length).fill('');
      newUserData[nameCol] = gameData.playerName;
      newUserData[passwordCol] = gameData.playerPassword;
      newUserData[totalScoreCol] = gameData.score;
      newUserData[totalGoldenPotsCol] = gameData.goldenPots;
      newUserData[totalGamesCol] = 1;
      newUserData[bestScoreCol] = gameData.score;
      newUserData[lastPlayedCol] = gameData.timestamp;
      
      userDataSheet.appendRow(newUserData);
    } else {
      // 기존 사용자 업데이트
      const currentTotalScore = data[userRowIndex - 1][totalScoreCol] || 0;
      const currentTotalGoldenPots = data[userRowIndex - 1][totalGoldenPotsCol] || 0;
      const currentTotalGames = data[userRowIndex - 1][totalGamesCol] || 0;
      const currentBestScore = data[userRowIndex - 1][bestScoreCol] || 0;
      
      userDataSheet.getRange(userRowIndex, totalScoreCol + 1).setValue(currentTotalScore + gameData.score);
      userDataSheet.getRange(userRowIndex, totalGoldenPotsCol + 1).setValue(currentTotalGoldenPots + gameData.goldenPots);
      userDataSheet.getRange(userRowIndex, totalGamesCol + 1).setValue(currentTotalGames + 1);
      userDataSheet.getRange(userRowIndex, bestScoreCol + 1).setValue(Math.max(currentBestScore, gameData.score));
      userDataSheet.getRange(userRowIndex, lastPlayedCol + 1).setValue(gameData.timestamp);
    }
    
  } catch (error) {
    console.error('사용자 데이터 업데이트 중 오류:', error);
  }
}

// 랭킹 조회
function getRankings() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userDataSheet = spreadsheet.getSheetByName('userdata');
    
    if (!userDataSheet) {
      throw new Error('userdata 시트를 찾을 수 없습니다.');
    }
    
    const data = userDataSheet.getDataRange().getValues();
    const headers = data[0];
    
    // 컬럼 인덱스 찾기
    const nameCol = headers.indexOf('name');
    const totalScoreCol = headers.indexOf('totalScore');
    const totalGoldenPotsCol = headers.indexOf('totalGoldenPots');
    const totalGamesCol = headers.indexOf('totalGames');
    
    if (nameCol === -1 || totalScoreCol === -1) {
      throw new Error('필수 컬럼을 찾을 수 없습니다.');
    }
    
    // 사용자 데이터 추출 (헤더 제외)
    const users = data.slice(1).map(row => ({
      name: row[nameCol] || '',
      score: row[totalScoreCol] || 0,
      goldenPots: row[totalGoldenPotsCol] || 0,
      totalGames: row[totalGamesCol] || 0
    })).filter(user => user.name && user.name.trim() !== '');
    
    // 총점 기준으로 정렬 (내림차순)
    users.sort((a, b) => b.score - a.score);
    
    // 상위 10명만 반환
    const topRankings = users.slice(0, 10);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      rankings: topRankings
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 스프레드시트 초기 설정 (한 번만 실행)
function setupSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // userdata 시트 생성
    let userDataSheet = spreadsheet.getSheetByName('userdata');
    if (!userDataSheet) {
      userDataSheet = spreadsheet.insertSheet('userdata');
      userDataSheet.getRange(1, 1, 1, 7).setValues([
        ['name', 'password', 'totalScore', 'totalGoldenPots', 'totalGames', 'bestScore', 'lastPlayed']
      ]);
    }
    
    // gamehistory 시트 생성
    let gameHistorySheet = spreadsheet.getSheetByName('gamehistory');
    if (!gameHistorySheet) {
      gameHistorySheet = spreadsheet.insertSheet('gamehistory');
      gameHistorySheet.getRange(1, 1, 1, 5).setValues([
        ['timestamp', 'playerName', 'score', 'goldenPots', 'playTime']
      ]);
    }
    
    console.log('스프레드시트 설정이 완료되었습니다.');
    
  } catch (error) {
    console.error('스프레드시트 설정 중 오류:', error);
  }
}

// CORS 헤더 설정을 위한 함수
function setCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
} 