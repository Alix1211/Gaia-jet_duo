# GAIA JET DUO v16.2 — 신규 배팅 이미지 및 탄성

- 베이스: `v16.1` 로컬 작업. 저장소 `Alix1211/Gaia-jet_duo`, 작업 브랜치 `jet-team-animation-skills`; 아직 GitHub 커밋·푸시 없음.
- 컨베이어 배팅 원본 판정·사운드·6컷 타자·게임 규칙 유지. 원본 `Wellness-RPG/gaia-detective-assets/belt-scroll`의 미니게임 HTML을 사용하며, `minigame_batting.js` 문서 변환 부분에서 대기·비행 이미지 2인 교대만 연결함.
- 새 컷 4장: 핑크 대기 `standby_pink.webp`, 보라 대기 `standby_purple.webp`, 핑크 비행 `flight_pink.webp`, 보라 비행 `flight_purple.webp` (`assets/minigame/batting_police/`). 1·3·5라운드 핑크, 2·4라운드 보라.
- 락커룸은 핑크 왼쪽, 보라 오른쪽. 핑크 캐릭터는 다시 제공된 PNG의 투명 여백만 잘라 배치(내부 검정 배경은 밝기 합성으로 처리).
- 메인 듀오의 상체와 락커룸 두 캐릭터의 힙에 국소 마스크를 이용한 짧은 스프링 탄성 CSS 추가. 원본 이미지·레이싱 모션·충돌 판정은 유지.
- 배포 파일: `GAIA-JET-DUO-v16.2-BATTING-SPRING.html` 및 동일 이름 ZIP. 오프라인 단일 HTML.
- 테스트: 새 배팅 이미지 경로 및 라운드별 선택 코드를 확인하고 임베디드 문서 JS 구문 검사 통과. 기존 레이싱 회귀 검사 별도 통과 필요; 안드로이드 실기기 시각·터치 테스트 미실시.
