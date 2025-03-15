// 익스텐션 정보
const extensionName = "Expression Avatar";
const extensionId = "expression_avatar";
const extensionIcon = "fa-face-smile";

// 설정 기본값
const defaultSettings = {
    enabled: true,
    expressionMode: false,
    replaceAll: false,
    avatarHeight: 150,
    mobileHeight: 100,
    keepOriginal: true,
    originalOpacity: 30
};

// 현재 설정
let settings = Object.assign({}, defaultSettings);

// 표정 이미지 URL
let currentExpressionUrl = '';

// 스타일 요소
let styleElement = null;

// 설정 UI 생성
function createUI() {
    const html = `
    <div id="extension-expression-avatar-settings" class="ea-settings">
        <div class="ea-section-title">기본 설정</div>
        
        <div class="ea-setting-item">
            <label for="ea-enabled">익스텐션 활성화</label>
            <input id="ea-enabled" type="checkbox" checked>
        </div>
        
        <div class="ea-setting-item">
            <label>표정 아바타 모드</label>
            <button id="ea-toggle-mode" class="ea-toggle-button">OFF</button>
        </div>
        
        <div class="ea-section-title">표정 아바타 설정</div>
        
        <div class="ea-setting-item">
            <label for="ea-replace-all">사용자 메시지에도 표정 적용</label>
            <input id="ea-replace-all" type="checkbox">
        </div>
        
        <div class="ea-setting-item">
            <label for="ea-avatar-height">아바타 높이 (px)</label>
            <div class="ea-slider-container">
                <input id="ea-avatar-height" type="range" min="50" max="300" value="150">
                <span id="ea-avatar-height-value" class="ea-slider-value">150</span>
            </div>
        </div>
        
        <div class="ea-setting-item">
            <label for="ea-mobile-height">모바일 아바타 높이 (px)</label>
            <div class="ea-slider-container">
                <input id="ea-mobile-height" type="range" min="50" max="200" value="100">
                <span id="ea-mobile-height-value" class="ea-slider-value">100</span>
            </div>
        </div>
        
        <div class="ea-setting-item">
            <label for="ea-keep-original">원본 아바타 유지 (투명도 조절)</label>
            <input id="ea-keep-original" type="checkbox">
        </div>
        
        <div class="ea-setting-item">
            <label for="ea-original-opacity">원본 아바타 투명도</label>
            <div class="ea-slider-container">
                <input id="ea-original-opacity" type="range" min="0" max="100" value="30">
                <span id="ea-original-opacity-value" class="ea-slider-value">30%</span>
            </div>
        </div>
        
        <div class="ea-section-title">기타</div>
        
        <div class="ea-setting-item">
            <button id="ea-reset-settings">설정 초기화</button>
        </div>
    </div>
    `;
    
    // 설정 UI를 확장 설정 영역에 추가
    const settingsArea = document.getElementById('extensions_settings');
    if (settingsArea) {
        const extensionDiv = document.createElement('div');
        extensionDiv.innerHTML = html;
        settingsArea.appendChild(extensionDiv.firstElementChild);
    }
}

// 토글 버튼 상태 업데이트
function updateToggleButton() {
    const button = document.getElementById('ea-toggle-mode');
    if (button) {
        if (settings.expressionMode) {
            button.textContent = 'ON';
            button.classList.add('active');
        } else {
            button.textContent = 'OFF';
            button.classList.remove('active');
        }
    }
}

// 익스텐션 초기화
function onExtensionLoad() {
    // 스타일 요소 생성
    styleElement = document.createElement('style');
    styleElement.id = 'expression-avatar-styles';
    document.head.appendChild(styleElement);
    
    // 설정 UI 생성
    createUI();
    
    // 설정 로드
    loadSettings();
    
    // 표정 이미지 변경 감지
    observeExpressionChanges();
    
    // 설정 UI 이벤트 연결
    document.getElementById('ea-enabled').addEventListener('change', function(e) {
        settings.enabled = e.target.checked;
        saveSettings();
        updateStyles();
    });
    
    document.getElementById('ea-toggle-mode').addEventListener('click', function() {
        settings.expressionMode = !settings.expressionMode;
        updateToggleButton();
        saveSettings();
        updateStyles();
    });
    
    document.getElementById('ea-replace-all').addEventListener('change', function(e) {
        settings.replaceAll = e.target.checked;
        saveSettings();
        updateStyles();
    });
    
    document.getElementById('ea-avatar-height').addEventListener('input', function(e) {
        settings.avatarHeight = parseInt(e.target.value);
        document.getElementById('ea-avatar-height-value').textContent = settings.avatarHeight;
        saveSettings();
        updateStyles();
    });
    
    document.getElementById('ea-mobile-height').addEventListener('input', function(e) {
        settings.mobileHeight = parseInt(e.target.value);
        document.getElementById('ea-mobile-height-value').textContent = settings.mobileHeight;
        saveSettings();
        updateStyles();
    });
    
    document.getElementById('ea-keep-original').addEventListener('change', function(e) {
        settings.keepOriginal = e.target.checked;
        saveSettings();
        updateStyles();
    });
    
    document.getElementById('ea-original-opacity').addEventListener('input', function(e) {
        settings.originalOpacity = parseInt(e.target.value);
        document.getElementById('ea-original-opacity-value').textContent = settings.originalOpacity + '%';
        saveSettings();
        updateStyles();
    });
    
    document.getElementById('ea-reset-settings').addEventListener('click', function() {
        settings = Object.assign({}, defaultSettings);
        saveSettings();
        loadSettingsToUI();
        updateStyles();
    });
    
    // 초기 스타일 적용
    updateStyles();
    
    // UI에 설정값 표시
    loadSettingsToUI();
    
    // 현재 표정 이미지 가져오기
    updateCurrentExpression();
    
    // 메시지 관찰 시작
    observeMessages();
    
    console.log(`${extensionName} 익스텐션이 로드되었습니다.`);
}

// 설정을 UI에 로드
function loadSettingsToUI() {
    const enabledCheckbox = document.getElementById('ea-enabled');
    if (enabledCheckbox) enabledCheckbox.checked = settings.enabled;
    
    updateToggleButton();
    
    const replaceAllCheckbox = document.getElementById('ea-replace-all');
    if (replaceAllCheckbox) replaceAllCheckbox.checked = settings.replaceAll;
    
    const avatarHeightSlider = document.getElementById('ea-avatar-height');
    const avatarHeightValue = document.getElementById('ea-avatar-height-value');
    if (avatarHeightSlider) avatarHeightSlider.value = settings.avatarHeight;
    if (avatarHeightValue) avatarHeightValue.textContent = settings.avatarHeight;
    
    const mobileHeightSlider = document.getElementById('ea-mobile-height');
    const mobileHeightValue = document.getElementById('ea-mobile-height-value');
    if (mobileHeightSlider) mobileHeightSlider.value = settings.mobileHeight;
    if (mobileHeightValue) mobileHeightValue.textContent = settings.mobileHeight;
    
    const keepOriginalCheckbox = document.getElementById('ea-keep-original');
    if (keepOriginalCheckbox) keepOriginalCheckbox.checked = settings.keepOriginal;
    
    const opacitySlider = document.getElementById('ea-original-opacity');
    const opacityValue = document.getElementById('ea-original-opacity-value');
    if (opacitySlider) opacitySlider.value = settings.originalOpacity;
    if (opacityValue) opacityValue.textContent = settings.originalOpacity + '%';
}

// 설정 저장
function saveSettings() {
    localStorage.setItem(`${extensionId}_settings`, JSON.stringify(settings));
}

// 설정 로드
function loadSettings() {
    const savedSettings = localStorage.getItem(`${extensionId}_settings`);
    if (savedSettings) {
        settings = Object.assign({}, defaultSettings, JSON.parse(savedSettings));
    }
}

// 표정 변경 감지
function observeExpressionChanges() {
    // MutationObserver를 사용하여 DOM 변경 감지
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'src' &&
                mutation.target.id === 'expression-image') {
                updateCurrentExpression();
            }
        });
    });
    
    // 표정 이미지 요소 관찰 시작
    const expressionImage = document.getElementById('expression-image');
    if (expressionImage) {
        observer.observe(expressionImage, { attributes: true });
        updateCurrentExpression(); // 초기 상태 설정
    }
    
    // 표정 요소가 아직 로드되지 않았다면 DOM 변경을 감지하여 다시 시도
    if (!expressionImage) {
        const bodyObserver = new MutationObserver(function() {
            const expressionImage = document.getElementById('expression-image');
            if (expressionImage) {
                observer.observe(expressionImage, { attributes: true });
                updateCurrentExpression();
                bodyObserver.disconnect();
            }
        });
        
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    }
}

// 메시지 관찰
function observeMessages() {
    // 채팅 메시지 변경 감지
    const chatObserver = new MutationObserver(function(mutations) {
        if (settings.enabled && settings.expressionMode) {
            updateMessagesWithExpression();
        }
    });
    
    // 채팅 영역 관찰 시작
    const chat = document.getElementById('chat');
    if (chat) {
        chatObserver.observe(chat, { childList: true, subtree: true });
    }
}

// 현재 표정 이미지 URL 업데이트
function updateCurrentExpression() {
    const expressionImage = document.getElementById('expression-image');
    if (expressionImage && expressionImage.src) {
        currentExpressionUrl = expressionImage.src;
        updateStyles();
        
        if (settings.enabled && settings.expressionMode) {
            updateMessagesWithExpression();
        }
    }
}

// 메시지에 표정 이미지 적용
function updateMessagesWithExpression() {
    if (!currentExpressionUrl) return;
    
    // 모든 AI 메시지에 표정 이미지 적용
    const messages = document.querySelectorAll('#chat .mes[is_user="false"]');
    messages.forEach(message => {
        const avatarWrapper = message.querySelector('.mesAvatarWrapper');
        if (avatarWrapper) {
            // 이미 적용된 표정 이미지가 있는지 확인
            let expressionElement = avatarWrapper.querySelector('.ea-expression-image');
            
            if (!expressionElement) {
                // 새 표정 이미지 요소 생성
                expressionElement = document.createElement('div');
                expressionElement.className = 'ea-expression-image';
                expressionElement.style.width = '100%';
                expressionElement.style.height = `${settings.avatarHeight}px`;
                expressionElement.style.backgroundImage = `url('${currentExpressionUrl}')`;
                expressionElement.style.backgroundSize = 'contain';
                expressionElement.style.backgroundPosition = 'center';
                expressionElement.style.backgroundRepeat = 'no-repeat';
                expressionElement.style.marginBottom = '10px';
                
                // 기존 아바타 앞에 삽입
                const avatar = avatarWrapper.querySelector('.avatar');
                if (avatar) {
                    avatarWrapper.insertBefore(expressionElement, avatar);
                    
                    // 원본 아바타 스타일 설정
                    if (settings.keepOriginal) {
                        avatar.style.opacity = settings.originalOpacity / 100;
                    } else {
                        avatar.style.display = 'none';
                    }
                } else {
                    avatarWrapper.appendChild(expressionElement);
                }
            } else {
                // 기존 표정 이미지 업데이트
                expressionElement.style.backgroundImage = `url('${currentExpressionUrl}')`;
                expressionElement.style.height = `${settings.avatarHeight}px`;
            }
        }
    });
    
    // 사용자 메시지에도 표정 적용(설정에 따라)
    if (settings.replaceAll) {
        const userMessages = document.querySelectorAll('#chat .mes[is_user="true"]');
        userMessages.forEach(message => {
            const avatarWrapper = message.querySelector('.mesAvatarWrapper');
            if (avatarWrapper) {
                let expressionElement = avatarWrapper.querySelector('.ea-expression-image');
                
                if (!expressionElement) {
                    expressionElement = document.createElement('div');
                    expressionElement.className = 'ea-expression-image';
                    expressionElement.style.width = '100%';
                    expressionElement.style.height = `${settings.avatarHeight}px`;
                    expressionElement.style.backgroundImage = `url('${currentExpressionUrl}')`;
                    expressionElement.style.backgroundSize = 'contain';
                    expressionElement.style.backgroundPosition = 'center';
                    expressionElement.style.backgroundRepeat = 'no-repeat';
                    expressionElement.style.marginBottom = '10px';
                    
                    const avatar = avatarWrapper.querySelector('.avatar');
                    if (avatar) {
                        avatarWrapper.insertBefore(expressionElement, avatar);
                        
                        if (settings.keepOriginal) {
                            avatar.style.opacity = settings.originalOpacity / 100;
                        } else {
                            avatar.style.display = 'none';
                        }
                    } else {
                        avatarWrapper.appendChild(expressionElement);
                    }
                } else {
                    expressionElement.style.backgroundImage = `url('${currentExpressionUrl}')`;
                    expressionElement.style.height = `${settings.avatarHeight}px`;
                }
            }
        });
    }
}

// 스타일 업데이트
function updateStyles() {
    if (!styleElement) return;
    
    const css = settings.enabled ? `
        /* 모바일 미디어 쿼리 */
        @media (max-width: 768px) {
            .ea-expression-image {
                height: ${settings.mobileHeight}px !important;
            }
        }
        
        /* 표정 이미지 요소 기본 스타일 */
        .ea-expression-image {
            transition: height 0.3s ease;
        }
    ` : '';
    
    styleElement.textContent = css;
    
    // 표정 모드가 활성화되어 있으면 메시지 업데이트
    if (settings.enabled && settings.expressionMode) {
        updateMessagesWithExpression();
    } else {
        // 표정 모드가 비활성화되어 있으면 모든 표정 이미지 제거
        const expressionImages = document.querySelectorAll('.ea-expression-image');
        expressionImages.forEach(img => {
            img.remove();
        });
        
        // 원본 아바타 복원
        const avatars = document.querySelectorAll('#chat .mes .avatar');
        avatars.forEach(avatar => {
            avatar.style.opacity = '';
            avatar.style.display = '';
        });
    }
}

// 익스텐션 언로드
function onExtensionUnload() {
    // 스타일 요소 제거
    if (styleElement) {
        styleElement.remove();
    }
    
    // 모든 표정 이미지 제거
    const expressionImages = document.querySelectorAll('.ea-expression-image');
    expressionImages.forEach(img => {
        img.remove();
    });
    
    // 원본 아바타 복원
    const avatars = document.querySelectorAll('#chat .mes .avatar');
    avatars.forEach(avatar => {
        avatar.style.opacity = '';
        avatar.style.display = '';
    });
    
    console.log(`${extensionName} 익스텐션이 언로드되었습니다.`);
}

// SillyTavern 익스텐션 API 등록
window['extension_expression_avatar'] = {
    name: extensionName,
    icon: extensionIcon,
    id: extensionId,
    
    // 필수 함수
    init: onExtensionLoad,
    
    // 선택적 함수
    destroy: onExtensionUnload,
    
    // 설정 페이지 요소 ID
    settings: 'extension-expression-avatar-settings'
};
