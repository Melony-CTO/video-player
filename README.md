# 비디오 플레이어 - 모듈화 버전

이 프로젝트는 비디오 플레이어를 모듈화한 버전입니다.

## 📁 프로젝트 구조

```
video-player/
├── index.html                   # 메인 HTML (최소화)
├── index.html.backup            # 원본 백업
├── index_new.html               # 새 모듈화 버전
├── assets/
│   ├── css/
│   │   ├── base.css            # 리셋, 변수, 기본 스타일
│   │   ├── layout.css          # 레이아웃, 그리드
│   │   ├── components.css      # 버튼, 슬라이더 등 컴포넌트
│   │   ├── animations.css      # 애니메이션, 트랜지션
│   │   └── responsive.css      # 반응형 스타일
│   │
│   └── media/
│       ├── logo/
│       ├── default-covers/
│       └── default-videos/
│
├── src/
│   ├── config/
│   │   ├── constants.js        # CONFIG 상수
│   │   ├── paths.js            # 경로 설정
│   │   └── defaults.js         # 기본값
│   │
│   ├── core/
│   │   ├── app.js              # 앱 초기화, 라이프사이클
│   │   ├── dom.js              # DOM 캐싱 시스템
│   │   ├── events.js           # 이벤트 버스
│   │   └── logger.js           # 로깅 시스템
│   │
│   ├── modules/
│   │   ├── video/
│   │   │   └── OverlayManager.js
│   │   │
│   │   ├── audio/
│   │   │   ├── MusicPlayer.js       # 음악 플레이어
│   │   │   ├── EffectPlayer.js      # 효과음 플레이어
│   │   │   ├── Equalizer.js         # 이퀄라이저
│   │   │   ├── AudioAnalyzer.js     # 오디오 분석
│   │   │   └── VolumeManager.js     # 볼륨 관리
│   │   │
│   │   ├── playlist/
│   │   │   ├── PlaylistManager.js   # 플레이리스트 관리
│   │   │   ├── TrackLoader.js       # 트랙 로더
│   │   │   └── ShuffleEngine.js     # 셔플 엔진
│   │   │
│   │   ├── ui/
│   │   │   ├── Visualizer.js        # 비주얼라이저
│   │   │   └── PlaylistUI.js        # 플레이리스트 UI
│   │   │
│   │   └── features/
│   │       ├── StealthMode.js       # 스텔스 모드
│   │       ├── PresetSystem.js      # 프리셋 시스템
│   │       └── KeyboardShortcuts.js # 키보드 단축키
│   │
│   ├── utils/
│   │   └── domUtils.js         # DOM 조작 유틸리티
│   │
│   └── main.js                 # 엔트리 포인트
│
└── README.md                    # 이 파일
```

## 🚀 시작하기

### 개발 서버 실행

모듈 시스템을 사용하므로 로컬 웹 서버가 필요합니다:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# VS Code Live Server 확장 사용
```

브라우저에서 `http://localhost:8000/index_new.html`을 열어주세요.

## 📦 모듈 구조

### Config 모듈
- **constants.js**: 전역 상수 및 설정값
- **paths.js**: 파일 경로 관리
- **defaults.js**: 기본값 정의

### Core 모듈
- **app.js**: 앱 라이프사이클 관리
- **dom.js**: DOM 요소 캐싱
- **events.js**: 이벤트 버스 시스템
- **logger.js**: 통합 로깅 시스템

### Audio 모듈 (5개)
- **MusicPlayer**: 음악 재생 관리 (재생, 일시정지, 다음/이전 트랙)
- **EffectPlayer**: 8채널 효과음 재생 관리
- **Equalizer**: 3밴드 이퀄라이저 (Low, Mid, High)
- **AudioAnalyzer**: 오디오 분석 및 비주얼라이저 데이터 제공
- **VolumeManager**: 통합 볼륨 관리 (마스터, 음악, 효과음)

### Playlist 모듈 (3개)
- **PlaylistManager**: 플레이리스트 생성, 관리, 검색
- **TrackLoader**: 플레이리스트/오디오 파일 로드 (.js, .json, mp3, m4a 등)
- **ShuffleEngine**: 셔플 및 반복 재생 관리

### UI 모듈 (2개)
- **Visualizer**: 오디오 비주얼라이저 (40개 바)
- **PlaylistUI**: 플레이리스트 UI 렌더링 및 인터랙션

### Features 모듈 (3개)
- **StealthMode**: 투명도 및 블러 효과 (닌자, 고스트, 호버 프리셋)
- **PresetSystem**: 설정 저장/로드/관리 (localStorage)
- **KeyboardShortcuts**: 키보드 단축키 (Space, 화살표, M, S, R 등)

### Video 모듈
- **OverlayManager**: 오버레이 비디오 관리

### Utils
- **domUtils.js**: DOM 조작 헬퍼 함수

## 🎨 CSS 구조

CSS는 기능별로 5개 파일로 분리되었습니다:

1. **base.css**: 리셋, 변수, 기본 스타일
2. **layout.css**: 레이아웃, 포지셔닝
3. **components.css**: UI 컴포넌트
4. **animations.css**: 애니메이션 정의
5. **responsive.css**: 반응형 미디어 쿼리

## ✨ 주요 기능

### 구현 완료 ✅
- [x] **Audio 시스템** - 음악 재생, 효과음, 이퀄라이저, 볼륨 관리
- [x] **Playlist 시스템** - 플레이리스트 관리, 셔플, 반복 재생
- [x] **UI 시스템** - 비주얼라이저, 플레이리스트 UI
- [x] **Features** - 스텔스 모드, 프리셋 시스템, 키보드 단축키
- [x] **Core 시스템** - 이벤트 버스, 로깅, DOM 캐싱
- [x] **모듈 시스템** - ES6 모듈, 클래스 기반 아키텍처

### 향후 작업
- [ ] 비디오 모듈 확장 (LoopManager, IntroManager)
- [ ] 미디어 관리 모듈 (BackgroundManager, MediaUploader)
- [ ] UI 확장 (ControlCenter, PresetManager UI)
- [ ] 테스트 코드 작성
- [ ] 빌드 시스템 구축

## 🎹 키보드 단축키

| 키 | 기능 |
|---|---|
| `Space` | 재생/일시정지 |
| `→` | 다음 트랙 |
| `←` | 이전 트랙 |
| `↑` | 볼륨 올리기 |
| `↓` | 볼륨 내리기 |
| `M` | 음소거 토글 |
| `S` | 셔플 토글 |
| `R` | 반복 모드 순환 |
| `C` | 컨트롤 센터 토글 |
| `T` | 스텔스 모드 토글 |
| `Ctrl+1/2/3` | 프리셋 1/2/3 로드 |

## 🔍 디버깅

브라우저 콘솔에서 사용 가능한 유틸리티:

```javascript
// 로드된 모듈 목록 확인
window.videoPlayer.debug.listModules()

// 특정 모듈 가져오기
const musicPlayer = window.videoPlayer.debug.getModule('musicPlayer')
musicPlayer.play()

// 이벤트 발행
window.videoPlayer.debug.emit('music:toggle')

// 이벤트 구독
window.videoPlayer.debug.on('track:loaded', (track) => {
  console.log('트랙 로드됨:', track)
})
```

## 📝 변경 이력

### v2.0.0 - 전체 모듈화 완성 (현재)
- ✅ Audio 모듈 완성 (5개)
- ✅ Playlist 모듈 완성 (3개)
- ✅ UI 모듈 완성 (2개)
- ✅ Features 모듈 완성 (3개)
- ✅ 이벤트 기반 아키텍처 구현
- ✅ 총 13개 모듈 통합

### v1.0.0 - 모듈화 초기 버전
- 프로젝트 구조 모듈화
- CSS 파일 분리 (5개 파일)
- Core 시스템 구현 (app, dom, events, logger)
- Config 시스템 구현
- 기본 비디오 모듈 구현

## 🤝 기여

이 프로젝트는 지속적으로 개선 중입니다.

## 📄 라이선스

MIT
