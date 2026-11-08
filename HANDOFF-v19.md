# GAIA JET DUO v19 — 엔진·효과음·락커룸 인수인계

기준: 로컬 브랜치 `jet-team-animation-skills`. 기존 미커밋 파일과 이전 v18 빌드 보존. GitHub 커밋/푸시는 실행하지 않음.

## 요청 반영

1. 주행음은 기존 부스터 음원(`assets/audio-v18/boost.ogg`) 하나를 반복 재생. 부스터 시 **같은 Audio 인스턴스**의 볼륨을 부드럽게 높이고 종료 시 줄임. 재생 위치 초기화나 재시작 없음.
2. 점프는 주행음과 별도로 겹쳐 재생. 짧은 효과음은 최대 5개 재생 인스턴스를 재사용해 연타/동시발생 시 이전 효과음을 불필요하게 끊지 않음.
3. 자체 제작 효과음 3개: 기체 충돌 `craft-thud`, 부표 충돌 `buoy-toong`, 물총 `watergun-pyong`. `scripts/generate_jet_sfx.mjs`가 원본 WAV 생성, 게임에는 압축 OGG 연결. 충돌은 실제 충돌 시 1회, 물총은 플레이어 탄 발사 성공 시 매회 재생.
4. 물총 자동 조준은 유지하되 심한 사선을 줄이려고 횡방향 탄속 상한을 ±315→±225로 줄임. **직선 고정 사격으로 변경하지 않음.**
5. 락커룸: 핑크 왼쪽·보라 오른쪽 그대로, 두 인물 크기를 96%→111%로 키우고 가운데로 약간 붙임. `bottom:-9%`로 발목 아래가 화면 밖으로 내려가 서 있는 듯 보이도록 정리. 핑크 엉덩이 효과 마스크 중심을 65%→51%로 수정하고 탄성 정도를 소폭 강화.

## 건드리지 않은 부분

- BGM·시나리오/대사(다음 작업 예정)
- 훈련 미니게임·부표 크기·경기 규칙·경기 화면 배치 등 기타 요소

## 빌드

- 진입 HTML: `index.html`
- 에셋: `assets/audio-v18/boost.ogg`, `assets/audio-v19/{craft-thud,buoy-toong,watergun-pyong}.ogg`
- 원본 효과음 생성: `node scripts/generate_jet_sfx.mjs`
- 게임 통합: `node bundle.mjs` → `../GAIA-JET-DUO-v19-SFX-LOCKER.html`
- 별도 WAV 원본을 위해 `assets/audio-v19/*.wav` 보존

## 검증 및 실기기 확인

- 생성된 3개 OGG 파일의 재생 길이·오디오 피크 확인, 원본/통합 HTML 내부 JS 구문 검사, 번들 생성 성공.
- 실기기에서 부스터-점프 동시 입력, 충돌, 물총 연사, 락커룸 잘림 위치 및 음량 균형 청감 확인 필요.
- GitHub 업로드/APK 제작은 미진행.
