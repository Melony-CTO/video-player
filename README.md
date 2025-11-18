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
│   │   └── video/
│   │       └── OverlayManager.js  # 오버레이 관리
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

### Modules
- **video/**: 비디오 관련 모듈
  - OverlayManager: 오버레이 비디오 관리

### Utils
- **domUtils.js**: DOM 조작 헬퍼 함수

## 🎨 CSS 구조

CSS는 기능별로 5개 파일로 분리되었습니다:

1. **base.css**: 리셋, 변수, 기본 스타일
2. **layout.css**: 레이아웃, 포지셔닝
3. **components.css**: UI 컴포넌트
4. **animations.css**: 애니메이션 정의
5. **responsive.css**: 반응형 미디어 쿼리

## 🔧 향후 작업

- [ ] 오디오 모듈 구현
- [ ] 플레이리스트 모듈 구현
- [ ] UI 컨트롤 모듈 구현
- [ ] 프리셋 시스템 구현
- [ ] 키보드 단축키 구현
- [ ] 스텔스 모드 구현

## 📝 변경 이력

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
