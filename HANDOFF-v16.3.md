# GAIA JET DUO v16.3 — 스쿼트 이미지·전체화면·배팅 확대

- 작업 브랜치: `jet-team-animation-skills` (`Alix1211/Gaia-jet_duo`). 로컬만 수정, GitHub 미커밋·미푸시.
- 이전 버전 `v16.2`의 레이싱·메뉴·락커룸·배팅 이미지 교대·탄성은 그대로 유지.
- 전달받은 핑크/보라 5단계 스쿼트 원화를 각각 `assets/minigame/squat_duo_source/`에 보관.
- `scripts/build_squat_sheets.mjs`: 352×576 원본 5칸을 정확히 분리하여 275×456 규격의 6×2=12프레임으로 재배열. 각 캐릭터 모든 프레임 스케일 동일, 같은 바닥선, 소스 내 인접 칸 오염 없음.
- 매핑: `[0,1,2,3,4,4,4,4,3,2,1,0]`. 박자 판정 시점은 원본과 같은 6번째 프레임(0부터 셈)이며, 이때 가장 깊은 스쿼트. 규칙·판정 수치·리듬·소리는 원본 유지.
- 새 시트: `assets/minigame/squat_home/squat_front_duo_1650x912.webp`(핑크), `squat_back_duo_1650x912.webp`(보라). `minigame_squat.js`에 연결. 조작 표기 `핑크/PINK`, `보라/PURPLE`.
- 미니게임 전체화면: iframe을 `document.body`가 아닌 게임 `#shell` 하위로 이동하고 `allowfullscreen` 허용. 훈련 시작 버튼 클릭 이벤트에서 `#shell.requestFullscreen()`, 가능하면 `screen.orientation.lock('landscape')` 요청. 플랫폼 제한 시 인게임 오버레이로 진행.
- 컨베이어 배팅: 원본 입력 타이밍·점수 유지, 화면 세계 그림만 바닥 기준 1.12배 확대 + 화면 높이 2.5% 아래로 이동. HUD는 확대하지 않음.
- HTML 단일 파일 생성: `node bundle.mjs` → `GAIA-JET-DUO-v16.3-SQUAT-FULLSCREEN.html`; ZIP 동명. 소스 5칸 이미지와 사용 중단된 시트는 번들에서 제외.
- 차후 작업: **사운드 추가/설정**(사용자 지시에 따라 이번 변경에 포함하지 않음).
- 완료 검사: 기존 레이싱 물리 smoke, 새 시트 차원·투명도·원본 프레임 바닥 정렬, 미니게임 iframe 생성/설정·기본 JS 구문, 번들 확인. Android 기기 전체화면 권한 및 터치 테스트는 사용자 실기기에서 확인 필요.
