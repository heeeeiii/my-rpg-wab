// This file contains the JavaScript code that adds interactivity to the web application.

document.addEventListener('DOMContentLoaded', () => {
    // 주요 요소
    const authArea = document.getElementById('auth-area');
    const registerArea = document.getElementById('register-area');
    const statusArea = document.getElementById('status-area');
    const loginBtn = document.getElementById('login-btn');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const registerBtn = document.getElementById('register-btn');
    const cancelRegisterBtn = document.getElementById('cancel-register-btn');
    const xpProgress = document.getElementById('xp-progress');
    const levelUpXpSpan = document.getElementById('level-up-xp');
    const MAX_LEVEL = 100;

    // 경험치 요구량 계산 함수
    function getLevelUpXp(level) {
        if (level >= MAX_LEVEL) return 0;
        return 100 + (level - 1) * 20;
    }

    // 내 정보 표시 함수 (텍스트로만)
    function setUserInfoFields(info) {
        document.getElementById('view-nickname').innerText = info.nickname || '';
        document.getElementById('view-level').innerText = info.level || 1;
        document.getElementById('view-xp').innerText = info.xp || 0;
        document.getElementById('view-currency').innerText = info.currency || 0;
        levelUpXpSpan.innerText = getLevelUpXp(info.level || 1);
        updateXpBar(info.xp, info.level);
    }

    function updateXpBar(xp, level) {
        level = level || 1;
        const currentXp = typeof xp === 'number' ? xp : parseInt(document.getElementById('view-xp').innerText) || 0;
        const levelUpXp = getLevelUpXp(level);
        const percentage = levelUpXp === 0 ? 100 : Math.min((currentXp / levelUpXp) * 100, 100);
        xpProgress.style.width = percentage + '%';
    }

    // 사용자 정보 불러오기/저장
    function loadUserInfo(username) {
        const data = localStorage.getItem('userinfo_' + username);
        return data ? JSON.parse(data) : null;
    }
    function saveUserInfo(username, info) {
        localStorage.setItem('userinfo_' + username, JSON.stringify(info));
    }

    // 회원가입
    function register(username, password, nickname) {
        if (localStorage.getItem('user_' + username)) {
            alert('이미 존재하는 아이디입니다.');
            return false;
        }
        if (!nickname) {
            alert('닉네임을 입력하세요.');
            return false;
        }
        localStorage.setItem('user_' + username, password);
        saveUserInfo(username, {
            nickname: nickname,
            level: 1,
            xp: 0,
            currency: 0,
            inventory: [],
            studyTime: 0 // 누적 공부시간(초)
        });
        alert('회원가입이 완료되었습니다!');
        return true;
    }

    // 로그인
    function login(username, password) {
        const savedPw = localStorage.getItem('user_' + username);
        if (!savedPw) {
            alert('존재하지 않는 아이디입니다.');
            return false;
        }
        if (savedPw !== password) {
            alert('비밀번호가 틀렸습니다.');
            return false;
        }
        localStorage.setItem('loginUser', username);
        return true;
    }

    // 로그아웃
    function logout() {
        localStorage.removeItem('loginUser');
    }

    // 퀘스트/업적/상점 상태는 반드시 사용자별로 저장
    function saveQuestState(type, state) {
        const username = localStorage.getItem('loginUser');
        if (!username) return;
        localStorage.setItem(username + '_' + type + 'QuestState', JSON.stringify(state));
    }
    function loadQuestState(type) {
        const username = localStorage.getItem('loginUser');
        if (!username) return {};
        const data = localStorage.getItem(username + '_' + type + 'QuestState');
        return data ? JSON.parse(data) : {};
    }
    function getShopPurchaseState() {
        const username = localStorage.getItem('loginUser');
        if (!username) return { date: '', items: {} };
        const today = new Date().toISOString().slice(0,10);
        let state = JSON.parse(localStorage.getItem(username + '_shopPurchaseState') || '{}');
        if (state.date !== today) {
            // 하루가 지나면 구매횟수 초기화
            state = { date: today, items: {} };
            localStorage.setItem(username + '_shopPurchaseState', JSON.stringify(state));
        }
        return state;
    }
    function setShopPurchaseState(state) {
        const username = localStorage.getItem('loginUser');
        if (!username) return;
        localStorage.setItem(username + '_shopPurchaseState', JSON.stringify(state));
    }
    function saveAchievementState(state) {
        const username = localStorage.getItem('loginUser');
        if (!username) return;
        localStorage.setItem(username + '_achievementState', JSON.stringify(state));
    }
    function loadAchievementState() {
        const username = localStorage.getItem('loginUser');
        if (!username) return {};
        const data = localStorage.getItem(username + '_achievementState');
        return data ? JSON.parse(data) : {};
    }

    // 연속 달성 기록 저장/불러오기 (일일/주간)
    function saveStreak(type, streakArr) {
        const username = localStorage.getItem('loginUser');
        if (!username) return;
        localStorage.setItem(username + '_' + type + 'Streak', JSON.stringify(streakArr));
    }
    function loadStreak(type) {
        const username = localStorage.getItem('loginUser');
        if (!username) return [];
        const data = localStorage.getItem(username + '_' + type + 'Streak');
        return data ? JSON.parse(data) : [];
    }

    // 수능 맞춤 퀘스트/업적 (보상 포함)
    const dailyQuestList = [
        { text: "국어 비문학 지문 2개 풀기", id: "daily1", reward: { xp: 10, gold: 20 } },
        { text: "수학 문제집 20문제 풀기", id: "daily2", reward: { xp: 15, gold: 25 } },
        { text: "영어 단어 30개 암기", id: "daily3", reward: { xp: 10, gold: 20 } },
        { text: "과탐 오답노트 1회 복습", id: "daily4", reward: { xp: 12, gold: 22 } }
    ];
    const weeklyQuestList = [
        { text: "모의고사 1회 실전처럼 풀기", id: "weekly1", reward: { xp: 50, gold: 100 } },
        { text: "수학 심화문제 50문제 풀기", id: "weekly2", reward: { xp: 40, gold: 80 } },
        { text: "국어 문학 작품 3편 정리", id: "weekly3", reward: { xp: 35, gold: 70 } },
        { text: "영어 듣기 5회분 연습", id: "weekly4", reward: { xp: 30, gold: 60 } }
    ];
    const achievementList = [
        { text: "첫 공부 시작! (누적 공부 1시간)", id: "ach1", reward: { xp: 100, gold: 200 } },
        { text: "일일퀘스트 7일 연속 달성!", id: "ach2", reward: { xp: 200, gold: 300 } },
        { text: "주간퀘스트 4주 연속 달성!", id: "ach3", reward: { xp: 400, gold: 500 } },
        { text: "모의고사 만점 달성!", id: "ach4", reward: { xp: 1000, gold: 1000 } }
    ];

    // 날짜 저장 및 초기화 체크 + 연속 달성 기록 관리
    function checkAndResetQuests() {
        const today = new Date();
        const todayStr = today.toISOString().slice(0,10);
        const weekStr = today.getFullYear() + '-' + getWeekNumber(today);

        // 일일퀘스트: 날짜가 다르면 초기화 + streak 관리
        let lastDaily = localStorage.getItem('lastDailyQuestDate');
        if (lastDaily !== todayStr) {
            // streak 관리
            let dailyStreak = loadStreak('daily');
            if (lastDaily) {
                // 어제 날짜와 연속인지 확인
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                if (lastDaily === yesterday.toISOString().slice(0,10)) {
                    dailyStreak.push(lastDaily);
                    if (dailyStreak.length > 7) dailyStreak.shift();
                } else {
                    dailyStreak = [];
                }
            }
            saveStreak('daily', dailyStreak);
            saveQuestState('daily', {});
            localStorage.setItem('lastDailyQuestDate', todayStr);
        }

        // 주간퀘스트: 주가 다르면 초기화 + streak 관리
        let lastWeekly = localStorage.getItem('lastWeeklyQuestWeek');
        if (lastWeekly !== weekStr && today.getDay() === 1) {
            // streak 관리
            let weeklyStreak = loadStreak('weekly');
            if (lastWeekly) {
                // 지난주와 연속인지 확인
                const lastWeekNum = parseInt(lastWeekly.split('-')[1]);
                const thisWeekNum = getWeekNumber(today);
                if (lastWeekNum === thisWeekNum - 1) {
                    weeklyStreak.push(lastWeekly);
                    if (weeklyStreak.length > 4) weeklyStreak.shift();
                } else {
                    weeklyStreak = [];
                }
            }
            saveStreak('weekly', weeklyStreak);
            saveQuestState('weekly', {});
            localStorage.setItem('lastWeeklyQuestWeek', weekStr);
        }
    }
    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        return weekNo;
    }

    // 유저별 퀘스트 저장/불러오기
    function saveUserQuests(username, quests) {
        localStorage.setItem('userquests_' + username, JSON.stringify(quests));
    }
    function loadUserQuests(username) {
        const data = localStorage.getItem('userquests_' + username);
        return data ? JSON.parse(data) : null;
    }

    // 최초 퀘스트 설정 UI 제어
    function showQuestSetupIfNeeded(username) {
        const quests = loadUserQuests(username);
        const questSetupArea = document.getElementById('quest-setup-area');
        if (!quests) {
            // 아직 퀘스트 설정 안 했으면 폼 보여주기
            questSetupArea.style.display = 'block';
            statusArea.style.display = 'none';
        } else {
            questSetupArea.style.display = 'none';
            statusArea.style.display = 'block';
        }
    }

    // 퀘스트 저장 버튼 이벤트
    document.getElementById('save-quest-setup-btn').onclick = function() {
        const username = localStorage.getItem('loginUser');
        if (!username) return;
        // 입력값 수집
        const daily = Array.from(document.getElementsByClassName('setup-daily')).map(i => i.value.trim()).filter(Boolean);
        const weekly = Array.from(document.getElementsByClassName('setup-weekly')).map(i => i.value.trim()).filter(Boolean);
        const repeat = Array.from(document.getElementsByClassName('setup-repeat')).map(i => i.value.trim()).filter(Boolean);
        if (daily.length === 0 || weekly.length === 0) {
            alert('일일/주간 퀘스트를 최소 1개 이상 입력하세요!');
            return;
        }
        // 저장
        saveUserQuests(username, { daily, weekly, repeat });
        alert('퀘스트가 저장되었습니다! 이제부터 수정할 수 없습니다.');
        document.getElementById('quest-setup-area').style.display = 'none';
        statusArea.style.display = 'block';
        renderQuests();
    };

    // 기존 코드의 퀘스트 목록을 유저별로 불러오도록 변경
    function getDailyQuestList() {
        const username = localStorage.getItem('loginUser');
        const quests = loadUserQuests(username);
        if (!quests) return [];
        return quests.daily.map((text, idx) => ({
            text,
            id: 'daily' + (idx + 1),
            reward: { xp: 10 + idx * 5, gold: 20 + idx * 5 }
        }));
    }
    function getWeeklyQuestList() {
        const username = localStorage.getItem('loginUser');
        const quests = loadUserQuests(username);
        if (!quests) return [];
        return quests.weekly.map((text, idx) => ({
            text,
            id: 'weekly' + (idx + 1),
            reward: { xp: 40 + idx * 10, gold: 80 + idx * 10 }
        }));
    }
    function getRepeatQuestList() {
        const username = localStorage.getItem('loginUser');
        const quests = loadUserQuests(username);
        if (!quests) return [];
        return quests.repeat.map((text, idx) => ({
            text,
            id: 'repeat' + (idx + 1),
            reward: { xp: 5 + idx * 5, gold: 10 + idx * 5 }
        }));
    }

    // 퀘스트 렌더링
    function renderQuests() {
        // 일일퀘스트
        const dailyQuestList = getDailyQuestList();
        const dailyState = loadQuestState('daily');
        const dailyUl = document.getElementById('daily-quests');
        dailyUl.innerHTML = '';
        dailyQuestList.forEach(q => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${q.text}
                <span style="color:#4CAF50; font-size:13px;">(+${q.reward.xp}XP, +${q.reward.gold}골드)</span>
                <button class="complete-quest" data-quest-id="${q.id}" ${dailyState[q.id] ? 'disabled' : ''}>${dailyState[q.id] ? '완료됨' : '완료'}</button>
            `;
            dailyUl.appendChild(li);
        });
        // 주간퀘스트
        const weeklyQuestList = getWeeklyQuestList();
        const weeklyState = loadQuestState('weekly');
        const weeklyUl = document.getElementById('weekly-quests');
        weeklyUl.innerHTML = '';
        weeklyQuestList.forEach(q => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${q.text}
                <span style="color:#4CAF50; font-size:13px;">(+${q.reward.xp}XP, +${q.reward.gold}골드)</span>
                <button class="complete-quest" data-quest-id="${q.id}" ${weeklyState[q.id] ? 'disabled' : ''}>${weeklyState[q.id] ? '완료됨' : '완료'}</button>
            `;
            weeklyUl.appendChild(li);
        });
        // 반복퀘스트
        const repeatQuestList = getRepeatQuestList();
        const repeatState = loadRepeatQuestState();
        const repeatUl = document.getElementById('repeat-quests');
        repeatUl.innerHTML = '';
        repeatQuestList.forEach(q => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${q.text}
                <span style="color:#2196F3; font-size:13px;">(+${q.reward.xp}XP, +${q.reward.gold}골드)</span>
                <button class="complete-repeat-quest" data-quest-id="${q.id}" ${repeatState[q.id] ? 'disabled' : ''}>${repeatState[q.id] ? '완료됨' : '완료'}</button>
            `;
            repeatUl.appendChild(li);
        });
        // 업적
        const achState = loadAchievementState();
        const achUl = document.getElementById('achievements');
        achUl.innerHTML = '';
        achievementList.forEach(a => {
            const achieved = achState[a.id];
            const li = document.createElement('li');
            li.innerHTML = `
                ${a.text}
                <span style="color:#FFD700; font-size:13px;">(+${a.reward.xp}XP, +${a.reward.gold}골드)</span>
                <span class="achievement-status" style="color:${achieved ? '#4CAF50' : '#fff'};">${achieved ? '달성!' : '미달성'}</span>
            `;
            achUl.appendChild(li);
        });
    }

    // 레벨업 처리
    function processLevelUp(userInfo) {
        let leveledUp = false;
        while (userInfo.level < MAX_LEVEL) {
            const needXp = getLevelUpXp(userInfo.level);
            if (userInfo.xp >= needXp && needXp > 0) {
                userInfo.xp -= needXp;
                userInfo.level++;
                leveledUp = true;
            } else {
                break;
            }
        }
        if (userInfo.level >= MAX_LEVEL) {
            userInfo.xp = 0;
        }
        return leveledUp;
    }

    // 업적 달성 체크 및 보상 지급
    function checkAchievements() {
        const username = localStorage.getItem('loginUser');
        if (!username) return;
        const userInfo = loadUserInfo(username);
        const achState = loadAchievementState();

        // 1. 첫 공부 시작: 누적 공부시간 1시간(3600초) 이상
        if (!achState['ach1'] && (userInfo.studyTime || 0) >= 3600) {
            achState['ach1'] = true;
            userInfo.xp += achievementList[0].reward.xp;
            userInfo.currency += achievementList[0].reward.gold;
            alert(`업적 달성: ${achievementList[0].text}\n보상: +${achievementList[0].reward.xp}XP, +${achievementList[0].reward.gold}골드`);
        }
        // 2. 일일퀘스트 7일 연속 달성: 최근 7일 streak + 오늘 일일퀘스트 전부 완료
        const dailyStreak = loadStreak('daily');
        const dailyState = loadQuestState('daily');
        const allDailyDone = dailyQuestList.every(q => dailyState[q.id]);
        if (!achState['ach2'] && dailyStreak.length === 6 && allDailyDone) {
            achState['ach2'] = true;
            userInfo.xp += achievementList[1].reward.xp;
            userInfo.currency += achievementList[1].reward.gold;
            alert(`업적 달성: ${achievementList[1].text}\n보상: +${achievementList[1].reward.xp}XP, +${achievementList[1].reward.gold}골드`);
        }
        // 3. 주간퀘스트 4주 연속 달성: 최근 4주 streak + 이번주 주간퀘스트 전부 완료
        const weeklyStreak = loadStreak('weekly');
        const weeklyState = loadQuestState('weekly');
        const allWeeklyDone = weeklyQuestList.every(q => weeklyState[q.id]);
        if (!achState['ach3'] && weeklyStreak.length === 3 && allWeeklyDone) {
            achState['ach3'] = true;
            userInfo.xp += achievementList[2].reward.xp;
            userInfo.currency += achievementList[2].reward.gold;
            alert(`업적 달성: ${achievementList[2].text}\n보상: +${achievementList[2].reward.xp}XP, +${achievementList[2].reward.gold}골드`);
        }
        // 4. 모의고사 만점 달성 (예시: 경험치 1000 이상)
        if (!achState['ach4'] && userInfo.xp >= 1000) {
            achState['ach4'] = true;
            userInfo.xp += achievementList[3].reward.xp;
            userInfo.currency += achievementList[3].reward.gold;
            alert(`업적 달성: ${achievementList[3].text}\n보상: +${achievementList[3].reward.xp}XP, +${achievementList[3].reward.gold}골드`);
        }
        processLevelUp(userInfo);
        saveAchievementState(achState);
        saveUserInfo(username, userInfo);
        setUserInfoFields(userInfo);
        renderQuests();
    }

    // 퀘스트 완료 버튼 이벤트 위임
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('complete-quest')) {
            const questId = e.target.dataset.questId;
            const username = localStorage.getItem('loginUser');
            if (!username) return;
            const userInfo = loadUserInfo(username);
            let reward = { xp: 0, gold: 0 };
            if (questId.startsWith('daily')) {
                const state = loadQuestState('daily');
                state[questId] = true;
                saveQuestState('daily', state);
                const quest = dailyQuestList.find(q => q.id === questId);
                if (quest) reward = quest.reward;
            } else if (questId.startsWith('weekly')) {
                const state = loadQuestState('weekly');
                state[questId] = true;
                saveQuestState('weekly', state);
                const quest = weeklyQuestList.find(q => q.id === questId);
                if (quest) reward = quest.reward;
            }
            // 보상 지급
            userInfo.xp = (userInfo.xp || 0) + reward.xp;
            userInfo.currency = (userInfo.currency || 0) + reward.gold;
            processLevelUp(userInfo);
            saveUserInfo(username, userInfo);
            setUserInfoFields(userInfo);
            renderQuests();
            alert(`퀘스트 완료! 보상: +${reward.xp}XP, +${reward.gold}골드`);
            checkAchievements();
        } else if (e.target.classList.contains('complete-repeat-quest')) {
            const questId = e.target.dataset.questId;
            const username = localStorage.getItem('loginUser');
            if (!username) return;
            const userInfo = loadUserInfo(username);
            let reward = { xp: 0, gold: 0 };
            const state = loadRepeatQuestState();
            state[questId] = true;
            saveRepeatQuestState(state);
            const quest = repeatQuestList.find(q => q.id === questId);
            if (quest) reward = quest.reward;
            userInfo.xp = (userInfo.xp || 0) + reward.xp;
            userInfo.currency = (userInfo.currency || 0) + reward.gold;
            processLevelUp(userInfo);
            saveUserInfo(username, userInfo);
            setUserInfoFields(userInfo);
            renderQuests();
            alert(`반복 퀘스트 완료! 보상: +${reward.xp}XP, +${reward.gold}골드`);
            checkAchievements();
        }
    });

    // 상점 아이템 (보상 느낌, 하루 1회 구매 제한)
    const shopItems = [
        { id: "snack", name: "맛있는 간식", desc: "공부 후 달콤한 보상!", price: 50, limit: 2 },
        { id: "movie", name: "영화 관람권", desc: "하루 공부 끝나고 영화 한 편!", price: 200, limit: 1 },
        { id: "game", name: "게임 1시간 이용권", desc: "오늘 공부했으니 게임도 즐기자!", price: 150, limit: 1 },
        { id: "music", name: "음악 스트리밍 1일권", desc: "좋아하는 음악으로 힐링!", price: 80, limit: 3 }
    ];

    // 상점 렌더링
    function renderShop() {
        const shopUl = document.getElementById('shop-items');
        shopUl.innerHTML = '';
        const purchaseState = getShopPurchaseState();
        shopItems.forEach(item => {
            const boughtCount = purchaseState.items[item.id] || 0;
            const left = item.limit - boughtCount;
            const disabled = left <= 0;
            li = document.createElement('li');
            li.innerHTML = `
                <b>${item.name}</b> - ${item.desc} <span style="color:#FFD700">${item.price} 골드</span>
                <span style="color:#aaa; font-size:13px;">(하루 최대 ${item.limit}개, 남은 ${left}개)</span>
                <button class="buy-item" data-item-id="${item.id}" ${disabled ? 'disabled' : ''}>
                    ${disabled ? '구매제한' : '구매'}
                </button>
            `;
            shopUl.appendChild(li);
        });
    }

    // 아이템 구매 처리
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-item')) {
            const itemId = e.target.dataset.itemId;
            const purchaseState = getShopPurchaseState();
            const item = shopItems.find(i => i.id === itemId);
            const boughtCount = purchaseState.items[itemId] || 0;
            if (boughtCount >= item.limit) {
                alert(`이 아이템은 하루에 최대 ${item.limit}개만 구매할 수 있습니다!`);
                return;
            }
            const username = localStorage.getItem('loginUser');
            if (!username) return;
            const userInfo = loadUserInfo(username);
            if (userInfo.currency < item.price) {
                alert('골드가 부족합니다!');
                return;
            }
            // 골드 차감, 인벤토리 추가, 구매 기록
            userInfo.currency -= item.price;
            userInfo.inventory = userInfo.inventory || [];
            userInfo.inventory.push({ id: item.id, name: item.name, desc: item.desc, date: new Date().toLocaleString() });
            saveUserInfo(username, userInfo);
            purchaseState.items[itemId] = boughtCount + 1;
            setShopPurchaseState(purchaseState);
            setUserInfoFields(userInfo);
            renderShop();
            alert(`${item.name}을(를) 인벤토리에 추가했습니다! (오늘 남은 구매: ${item.limit - purchaseState.items[itemId]}개)`);
        }
    });

    // 인벤토리 화면 전환
    document.getElementById('inventory-btn').onclick = function() {
        statusArea.style.display = 'none';
        document.getElementById('inventory-area').style.display = 'block';
        renderInventory();
    };
    document.getElementById('back-to-main-btn').onclick = function() {
        document.getElementById('inventory-area').style.display = 'none';
        statusArea.style.display = 'block';
    };

    // 인벤토리 렌더링
    function renderInventory() {
        const username = localStorage.getItem('loginUser');
        const userInfo = loadUserInfo(username);
        const invUl = document.getElementById('inventory-list');
        invUl.innerHTML = '';
        if (userInfo && userInfo.inventory && userInfo.inventory.length > 0) {
            userInfo.inventory.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<b>${item.name}</b> - ${item.desc} <span style="color:#aaa;font-size:12px;">(${item.date})</span>`;
                invUl.appendChild(li);
            });
        } else {
            invUl.innerHTML = '<li>아직 획득한 아이템이 없습니다.</li>';
        }
    }

    // 타이머
    let timerInterval;
    let totalStudyTime = 0;
    const timerDisplay = document.getElementById('timer-display');
    document.getElementById('start-button').addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            totalStudyTime++;
            const username = localStorage.getItem('loginUser');
            if (username) {
                const userInfo = loadUserInfo(username);
                userInfo.studyTime = (userInfo.studyTime || 0) + 1;
                saveUserInfo(username, userInfo);
            }
            const hours = String(Math.floor(totalStudyTime / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalStudyTime % 3600) / 60)).padStart(2, '0');
            const seconds = String(totalStudyTime % 60).padStart(2, '0');
            timerDisplay.innerText = `${hours}:${minutes}:${seconds}`;
        }, 1000);
        document.getElementById('stop-button').disabled = false;
        document.getElementById('reset-button').disabled = false;
    });
    document.getElementById('stop-button').addEventListener('click', () => {
        clearInterval(timerInterval);
        document.getElementById('start-button').disabled = false;
    });
    document.getElementById('reset-button').addEventListener('click', () => {
        clearInterval(timerInterval);
        totalStudyTime = 0;
        timerDisplay.innerText = '00:00:00';
        document.getElementById('stop-button').disabled = true;
        document.getElementById('reset-button').disabled = true;
    });

    // 로그인/로그아웃 후 UI 처리
    function afterLogin(username) {
        authArea.style.display = 'none';
        registerArea.style.display = 'none';
        statusArea.style.display = 'block';
        logoutBtn.style.display = 'inline-block';
        const info = loadUserInfo(username);
        if (info) setUserInfoFields(info);
        checkAndResetQuests();
        renderQuests();
        renderShop();
        resetShopIfNeeded();
        checkAchievements();
        // 공부시간 타이머 초기화
        totalStudyTime = info.studyTime || 0;
        const hours = String(Math.floor(totalStudyTime / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalStudyTime % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalStudyTime % 60).padStart(2, '0');
        timerDisplay.innerText = `${hours}:${minutes}:${seconds}`;
        showQuestSetupIfNeeded(username);
    }
    function afterLogout() {
        statusArea.style.display = 'none';
        authArea.style.display = 'block';
        registerArea.style.display = 'none';
        logoutBtn.style.display = 'none';
        setUserInfoFields({nickname:'',level:1,xp:0,currency:0});
        totalStudyTime = 0;
        timerDisplay.innerText = '00:00:00';
        clearInterval(timerInterval);
    }
    function resetShopIfNeeded() {
        getShopPurchaseState();
    }

    // 로그인/회원가입/로그아웃 이벤트
    loginBtn.onclick = function() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        if (!username || !password) {
            alert('아이디와 비밀번호를 입력하세요.');
            return;
        }
        if (login(username, password)) {
            afterLogin(username);
        }
    };
    showRegisterBtn.onclick = function() {
        authArea.style.display = 'none';
        registerArea.style.display = 'block';
    };
    registerBtn.onclick = function() {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const nickname = document.getElementById('register-nickname').value;
        if (!username || !password || !nickname) {
            alert('모든 항목을 입력하세요.');
            return;
        }
        if (register(username, password, nickname)) {
            if (login(username, password)) {
                afterLogin(username);
            }
        }
    };
    cancelRegisterBtn.onclick = function() {
        registerArea.style.display = 'none';
        authArea.style.display = 'block';
    };
    logoutBtn.onclick = function() {
        logout();
        afterLogout();
    };

    // 페이지가 로드될 때 무조건 로그아웃 상태로 시작
    afterLogout();

    // 반복 퀘스트 예시 (매일 반복)
    const repeatQuestList = [
        { text: "아침 10분 스트레칭", id: "repeat1", reward: { xp: 5, gold: 10 } },
        { text: "공부 시작 전 책상 정리", id: "repeat2", reward: { xp: 5, gold: 10 } }
    ];

    // 반복 퀘스트 상태 저장/불러오기
    function saveRepeatQuestState(state) {
        const username = localStorage.getItem('loginUser');
        if (!username) return;
        localStorage.setItem(username + '_repeatQuestState', JSON.stringify(state));
    }
    function loadRepeatQuestState() {
        const username = localStorage.getItem('loginUser');
        if (!username) return {};
        const data = localStorage.getItem(username + '_repeatQuestState');
        return data ? JSON.parse(data) : {};
    }

    // 반복 퀘스트 렌더링 (renderQuests 함수 내에 추가)
    const repeatState = loadRepeatQuestState();
    const repeatUl = document.getElementById('repeat-quests');
    repeatUl.innerHTML = '';
    repeatQuestList.forEach(q => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${q.text}
            <span style="color:#2196F3; font-size:13px;">(+${q.reward.xp}XP, +${q.reward.gold}골드)</span>
            <button class="complete-repeat-quest" data-quest-id="${q.id}" ${repeatState[q.id] ? 'disabled' : ''}>${repeatState[q.id] ? '완료됨' : '완료'}</button>
        `;
        repeatUl.appendChild(li);
    });

    // 반복 퀘스트 완료 처리
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('complete-repeat-quest')) {
            const questId = e.target.dataset.questId;
            const username = localStorage.getItem('loginUser');
            if (!username) return;
            const userInfo = loadUserInfo(username);
            let reward = { xp: 0, gold: 0 };
            const state = loadRepeatQuestState();
            state[questId] = true;
            saveRepeatQuestState(state);
            const quest = repeatQuestList.find(q => q.id === questId);
            if (quest) reward = quest.reward;
            userInfo.xp = (userInfo.xp || 0) + reward.xp;
            userInfo.currency = (userInfo.currency || 0) + reward.gold;
            processLevelUp(userInfo);
            saveUserInfo(username, userInfo);
            setUserInfoFields(userInfo);
            renderQuests();
            alert(`반복 퀘스트 완료! 보상: +${reward.xp}XP, +${reward.gold}골드`);
            checkAchievements();
        }
    });

    // 반복 퀘스트 상태 초기화 (매일)
    function resetRepeatQuestsIfNeeded() {
        const today = new Date().toISOString().slice(0,10);
        const username = localStorage.getItem('loginUser');
        if (!username) return;
        const lastRepeat = localStorage.getItem(username + '_lastRepeatQuestDate');
        if (lastRepeat !== today) {
            saveRepeatQuestState({});
            localStorage.setItem(username + '_lastRepeatQuestDate', today);
        }
    }

    // 로그인 후 반복 퀘스트 초기화
    resetRepeatQuestsIfNeeded();
});
