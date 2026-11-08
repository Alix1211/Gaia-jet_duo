# GAIA JET DUO — 경기 HUD / 일정 이미지 (v17)

이번 작업은 **이미지 제작 및 PNG 분리만** 수행했습니다. 게임 HTML/JS/CSS는 수정하지 않았습니다.

## 경기 HUD (투명 PNG)

`assets/hud-v17/`

- `speedometer.png`: 속도계 (속도 수치 코드 오버레이 영역 비워둠)
- `lap.png`: LAP 표시판 (랩 수치 코드 오버레이 영역 비워둠)
- `steer-left.png`, `steer-right.png`: 반투명 화이트 방향 버튼
- `watergun.png`: 물총 발사
- `jump.png`: 점프
- `boost-button.png`: 노란 BOOST 버튼
- `boost-meter-full.png`, `boost-meter-empty.png`: 세로 부스터 게이지 두 상태
- `hud-atlas.png`: 9개 요소 원형 배치 참고용 아틀라스

## 경기 선택용 가로 그림

`assets/schedule-v17/`

- `river-league.png`: 강변리그
- `championship.png`: 챔피언십
- `practice.png`: 연습경기

모든 HUD 단품은 배경 투명 PNG이며, 경기 선택 그림 3장은 가로 비율의 불투명 PNG입니다.

미완료: 실제 HUD 배치·버튼 이벤트 연결, 부스터 게이지 수치 연동, 경기 카드 교체는 후속 구현 대상입니다.
