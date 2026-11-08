# GAIA JET DUO v20 — 로비·경기 BGM / 점프 음향 혼합

## 기준

- 로컬 저장소: `Alix1211/Gaia-jet_duo`, 브랜치 `jet-team-animation-skills`
- v19 소스에서 시작. 기존 미커밋 파일 보존.
- GitHub 커밋·푸시 및 APK 빌드는 진행하지 않음.

## 이번 적용

1. **로비 BGM:** 사용자 제공 `Funked Up.mp3` → `assets/bgm-v20/lobby-funked-up.ogg` (66초, 반복).
2. **경기 BGM:** 사용자 제공 `hot_roadway_bpm160.ogg` → `assets/bgm-v20/race-hot-roadway.ogg` (120초, 반복).
3. 게임 화면에서 로비/락커룸/경기 일정/훈련 메뉴는 로비 BGM, 카운트다운과 경기 중은 경기 BGM. 경기 종료 화면은 BGM 정지. 훈련 미니게임 진입 시 로비 BGM 정지, 복귀 시 재개.
4. BGM 전환은 약 0.44초 페이드. 안드로이드 브라우저 자동재생 제한을 고려하여 사용자가 화면을 처음 터치한 이후 시작.
5. **점프음 강화:** 기존 `assets/audio-v18/jump.ogg`에서 작은 물소리 구간을 살리고 `assets/audio-v20/jump-splash-loud.ogg` 제작. 게임 재생 레벨 `.55` → `.85`.
6. **엔진·점프 끊김 방지:** 엔진 반복음과 점프·물총·충돌 효과음을 같은 Web Audio 믹서에서 독립적으로 합성. 점프 때 엔진 재생을 정지/초기화하지 않으며 부스터 때도 엔진 게인만 변경. Web Audio 미지원 기기는 기존 HTMLAudio 재생으로 대체.
7. 기존 주행음 소스(`audio-v18/boost.ogg`)와 부스터 볼륨 규칙은 유지. 부표 원근·물총 로직·락커룸 배치·시나리오는 변경하지 않음.

## 출처·라이선스

- **Funked Up** — Joth, OpenGameArt, CC0: https://opengameart.org/content/funked-up
- **Hot Roadway** — MintoDog, OpenGameArt, CC0: https://opengameart.org/content/hot-roadway
- 사용자가 전달한 두 원본 파일을 게임용 OGG로 변환하여 연결. CC0 표기 기준 출처 기록, 저작자 표기는 의무 아님.

## 빌드 및 검증

- 진입 소스: `index.html`; 번들러: `bundle.mjs`
- `node bundle.mjs` → `../GAIA-JET-DUO-v20-BGM-JUMP-MIX.html`
- 사운드 3종 길이 확인(로비 66.27초 / 경기 120초 / 점프 1.48초), 소스 및 단일 HTML 내 스크립트 구문 검사 통과.
- 실기기에서 점프-엔진 동시 청감, BGM 볼륨, 미니게임 복귀 시 음악 재개 여부 확인 필요.
