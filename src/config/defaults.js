/**
 * 기본값 설정
 */

export const DEFAULTS = {
  // 플레이리스트 기본 선택
  SELECTED_PLAYLISTS: ['pop2'],

  // 스텔스 모드 기본 설정
  STEALTH_SETTINGS: {
    panelOpacity: 0.3,
    buttonOpacity: 1.0,
    blurAmount: 20,
    hoverEnabled: true,
    isActive: false
  },

  // 루프 비디오 기본 설정
  LOOP_VIDEOS: {
    loop1: 'Loof_01.mp4',
    loop2: 'Loof_01-1.mp4'
  },

  // 배경 이미지 기본 목록
  BACKGROUND_IMAGES: [
    { name: '산', type: 'image', url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1920&h=1080&fit=crop' },
    { name: '바다', type: 'image', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop' },
    { name: '숲', type: 'image', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop' }
  ],

  // 배경 미디어 초기 목록
  BACKGROUND_MEDIA: [
    { name: '기본 루프 영상', type: 'video', loop1: 'Loof_01.mp4', loop2: 'Loof_01-1.mp4' }
  ]
};
