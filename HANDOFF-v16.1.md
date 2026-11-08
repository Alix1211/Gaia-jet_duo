# GAIA JET DUO v16.1 — 화면·훈련 미니게임 인수인계

- 작업 브랜치: `jet-team-animation-skills` (`Alix1211/Gaia-jet_duo`). 이번 작업은 **로컬 수정만**, GitHub 커밋·푸시 없음.
- 변경 범위: 가로 전용 메인 UI, 4개 한글 아이콘 + 프레임 없는 톱니바퀴, 도시/강 배경과 45도 듀오 그림, 락커룸 배경·2인·좌우 스탯 패널, 훈련실 배경, 스쿼트/컨베이어 배팅 실행 연결.
- 미니게임 원본: `Alix1211/Wellness-RPG`, 브랜치 `gaia-detective-assets`, 디렉터리 `belt-scroll/`의 `js/minigame*.js` 및 `assets/minigame/{squat_home,batting_police}`. 규칙·타이밍·애니메이션 본체는 유지. 배경 경로만 제트 듀오 훈련실로 교체.
- 새 리소스: `assets/screens`, `assets/menu`, `assets/locker`, `assets/minigame`; 실행 연결: `minigame.js`, `minigame_squat.js`, `minigame_batting.js`.
- 락커룸 보라색 캐릭터는 전달된 PNG 원본. 핑크색 캐릭터는 전달된 JPG 원본(검정 배경)이어서 CSS 스크린 블렌드로 배경을 흡수. 추후 투명 PNG 원본을 받으면 이 파일만 교체 필요.
- 결과 파일: `GAIA-JET-DUO-v16.1-SCREENS-MINIGAMES.html` (에셋·원본 미니게임·사운드 모두 내장, 오프라인 단일 HTML), 같은 이름 ZIP.
- 검사: 기존 레이싱 물리·일정·스탯 smoke 테스트 통과. 두 미니게임의 등록·문서 생성·훈련실 배경 주소 및 iframe 연결 검증. 브라우저 실기기 화면/터치 테스트는 아직 하지 못함.
- 이번 작업에서 **변경하지 않은 것**: 레이싱·난이도·스킬·성장 판정, 훈련 보상 스탯 연결, APK 빌드.
