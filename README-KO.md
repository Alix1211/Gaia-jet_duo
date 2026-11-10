# GAIA JET DUO V44 — Android Studio 인수인계

2026-11-09, 테스트 전용. **V42·V43과 기존 GitHub main은 변경하지 않았습니다.**

## 1. 이번에 고친 게임 내용

- 예선 더미와 첫 대결에서 **2위로 져도**, **1위로 이겨도** 훈련 5회가 새로 생깁니다.
- 스쿼트(체력·음란), 배팅(복종·개방), 감성충전(색기) 각각 배정된 1회씩입니다.
- 강변리그 및 챔피언십도 매 공식 경기 종료 후 승패 무관하게 5회 지급; 남은 기회 이월하지 않습니다.
- **예선 우승 이후 자유 연습경기**에서는 훈련권을 더 지급하지 않습니다.
- 예선 1위 → 강변리그 1~6회전 각 1위 → 챔피언십 개방. 잠긴 지도는 연습경기에서도 선택 불가.
- 드리프트: 시속 **108 이상**, 브레이크와 방향 약 **28% 이상** 동시 입력으로 발동. 기존보다 더 확실한 슬립과 기체 기울기.
- V43의 5단계 미니게임, 짐볼, 경기 결과 1:1 판정, 부표 비장애물 원칙과 원본 이미지·음원은 유지.
- 웹 단일 HTML도 독립 실행됩니다.

## 2. 안드로이드 앱

- 실행: 인터넷 없이 설치된 V44 HTML 파일로 시작. 가로 모드 고정, 전체화면.
- 진동: 충돌, 점프, 부스터, 드리프트 시 Android 시스템 진동 요청. 기기별 세기 차이는 실기기 검증 필요.
- 업데이트: **새 콘텐츠를 확인해 받아두고, 다음 실행에서 적용**합니다.
- **V44.1 업데이트 활성화:** `gradle.properties`에 `jetduo-updates` 브랜치의 GitHub HTTPS 목록 주소를 연결했습니다. APK를 새로 빌드하여 기존 앱 위에 설치하면 이후 V45 이상 게임 콘텐츠를 자동 수신할 준비가 됩니다.
- 기준 목록의 버전은 44이므로 V44.1 설치 직후에는 별도 다운로드가 일어나지 않습니다. 차기 콘텐츠가 업로드되기 전까지 기존 게임이 그대로 유지됩니다.
- Android 앱 내부 기능(진동 등)을 변경하면 새 APK 필요. 동일 `applicationId`와 동일 서명키로 새 버전 서명 필수.
- 플레이 데이터는 Android WebView의 앱 내부 저장공간에 유지. 기존 크롬 또는 파일로 연 V43 세이브가 자동 이관되는 것은 아닙니다.

## 3. Android Studio에서 직접 APK 만들기

1. 이 폴더(`GAIA-JET-DUO-V44-ANDROID`)를 통째로 압축 해제하세요.
2. Android Studio → **Open** → 방금 푼 `GAIA-JET-DUO-V44-ANDROID` 폴더 선택.
3. Gradle Sync가 끝날 때까지 기다리세요. Android SDK 35 등이 없으면 Android Studio가 설치를 안내합니다.
4. **Build → Build Bundle(s) / APK(s) → Build APK(s)** 선택.
5. 완성된 테스트 파일 위치: `app/build/outputs/apk/debug/app-debug.apk`.

처음 시험용 APK는 debug 서명입니다. 장기간 업데이트 설치를 하려면 나중에 고정된 **release 서명키**를 만들어 안전하게 보관해야 합니다. 서로 다른 키로 만든 APK는 기존 설치본을 덮어쓸 수 없습니다.

이 작업 환경에는 Android SDK/Gradle 배포판이 설치되어 있지 않아 실제 APK 생성과 기기 설치는 **아직 검증하지 못했습니다**. 프로젝트 파일과 원본 HTML만 준비한 상태입니다.

## 4. 게임 콘텐츠 자동 업데이트

**주의:** Google Drive의 일반 공유 주소는 게임용 자동 다운로드 호스트로 권장하지 않습니다. 공개 GitHub를 사용하는 경우 단일 HTML에 내장된 그림·음원도 공개되므로 케인님 승인 없이 자동 업로드하지 않습니다.

1. **등록 완료:** GitHub `jetduo-updates` 브랜치의 `updates/jetduo/update.json` 주소가 `gradle.properties`에 들어 있습니다.
2. 다음 버전을 만들면 완성된 단일 HTML을 **먼저** `jetduo-updates/updates/jetduo/game-v45.html`에 업로드합니다.
3. `node publish/generate-manifest.mjs <새HTML파일> <새HTML의 raw.githubusercontent.com URL> 45`로 SHA-256을 포함한 목록을 생성하고, 다운로드 가능한 것을 확인한 뒤 GitHub의 `update.json`을 갱신합니다.
4. APK가 다음 실행 시 새 파일을 검증해 다운로드하고, **그다음 실행 시 적용**합니다. 네트워크 오류 또는 해시 불일치 시 이전 게임을 보존합니다.

기준 버전 44의 HTML은 APK에 이미 들어 있습니다. 서버의 버전 44 목록은 앱이 다운로드하지 않으며, **실제 다운로드 경로는 처음 업로드될 버전 45부터 동작**합니다.

HTML은 약 44MB이며 전체 파일을 다시 내려받습니다. 데이터 사용량을 줄이기 위한 패치 업데이트는 이번 버전에서 구현하지 않았습니다.

## 5. 준비물과 검증

- 프로젝트: Android Studio + Gradle wrapper 8.9 + Android Gradle Plugin 8.7.3 + Java 17.
- 게임 HTML: `app/src/main/assets/GAIA-JET-DUO-v44-STABLE-ANDROID.html`.
- 테스트 스크립트: `tests/GAIA-JET-DUO-v44-SMOKE.mjs` (`node tests/GAIA-JET-DUO-v44-SMOKE.mjs`).
- GitHub 업데이트 전용 브랜치 `jetduo-updates` 생성, `updates/jetduo/update.json` 및 README 커밋. 기존 main 병합 없음.
- V44.1 Android 프로젝트의 업데이트 URL과 새 앱 아이콘은 사용자 PC에서 **재빌드해야 적용**됩니다. 기존에 빌드한 APK는 자동 업데이트를 하지 않습니다.
- 앱 진동과 자동 업데이트는 실기기 및 HTTPS 배포 주소 준비 이후 확인해야 합니다.

## 6. 다음에 보완할 일

- 실기기 드리프트 감각 미세 조정.
- 스쿼트·배팅·감성충전 난이도 1~5단계 실제 성공률 확인.
- HTTPS 배포 주소 확정 및 게임 콘텐츠 업데이트 실기기 확인.
- APK 릴리스 서명키 생성 및 저장. 보안상 서명키는 이 ZIP에 **들어 있지 않습니다**.

기존 그림/음악 수정 없음. 기존 데이터 삭제 없음.
