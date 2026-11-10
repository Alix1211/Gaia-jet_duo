# GAIA JET DUO V49 — 미니게임 진입 불가 원인 수정판 (2026-11-10)

## V49에서 고친 것 (진짜 원인)
- **원인:** `GAIA-JET-DUO-v47-ACTIONS-ABOVE-STEER.html` 안의 `window.GAIA_DOC`(배팅 게임 문서를 담은 JS 문자열)에 `</script>` 가 이스케이프 없이 2군데 들어 있었습니다. 브라우저가 그 지점에서 스크립트를 끝내 버려 `window.GAIA`, `MINI_ASSETS`, 미니게임 등록이 통째로 실행되지 않았고, 그래서 스쿼트·배팅·감성충전 **세 미니게임 모두 진입이 안 됐습니다.** (안드로이드 문제가 아니라 HTML 자체 문제입니다. V47 HTML에도 있었습니다.)
- **수정:** 그 2곳을 `<\/script>` 로 바꿨습니다(파일 크기 +2바이트). 게임 로직·그림·소리·버튼은 변경하지 않았습니다.
- 버전: versionCode 49 / `0.49.0-script-fix`, `ContentUpdater.BUNDLED_VERSION=49`.
- V48의 `MainActivity.java` iframe 허용 수정은 그대로 유지했습니다.

## 확인한 것 / 못 한 것
- 확인: 데스크톱 Chromium에서 스크립트 8개 전부 문법 통과, 스쿼트·배팅·감성충전 3종이 실행되어 게임 화면(캔버스)이 뜸, 페이지 오류 없음.
- **미확인: 실제 안드로이드 기기(WebView)에서의 동작, APK 빌드.** (이 환경에는 Android SDK가 없습니다.)

--- 이하 V48 안내 ---

# GAIA JET DUO V48 — Android Studio 시작 안내 / 인수인계

작업일: 2026-11-10. V47 Android Studio 프로젝트에서 미니게임 실행 경로만 수정했습니다.

## 이번 V48에서 수정한 부분

- **Android WebView의 내부 `iframe` 화면 이동 처리:** `MainActivity.java`의 `shouldOverrideUrlLoading`에서 미니게임 문서 `about:srcdoc` / `data:` / `blob:` 및 앱 자체 주소의 하위 프레임은 차단하지 않도록 수정했습니다.
- 메인 화면이 외부 웹사이트로 이동하지 못하도록 하던 기존 제한은 유지했습니다.
- V47 HTML 원본을 **바이트 단위로 그대로** 사용했습니다. 미니게임 로직·이미지·훈련 횟수·레이싱·의상·버튼 위치를 새로 변경하지 않았습니다.
- 이 수정은 Android WebView 미니게임 연결 실패의 **유력한 원인에 대한 조치**이며, 실제 기기에서 수정 결과는 아직 확인되지 않았습니다.

## 유지한 V47 게임 변경

- **점프·물총 버튼 두 개만 왼쪽 조향 버튼 위로 이동.** 부스터 게이지 및 버튼은 기존 오른쪽에 그대로 둡니다.
- V46에 복원된 V23 컨베이어 배팅 에셋·게임 로직, 조교 의상, 레이싱 조작 등은 변경하지 않았습니다.
- 변경은 HTML 헤더에 추가한 `/* V47: ... */` CSS 규칙 5줄입니다. 원본 V46 파일은 보존했습니다.

## Android 프로젝트 반영

- 단일 HTML: `app/src/main/assets/GAIA-JET-DUO-v47-ACTIONS-ABOVE-STEER.html`
- Android WebView가 불러오는 내장 파일은 V47과 동일합니다.
- 버전: `app/build.gradle.kts` → `versionCode=48`, `versionName=0.48.0-minigame-webview`.
- 콘텐츠 최소 버전: `ContentUpdater.BUNDLED_VERSION=48`. 이전 업데이트 파일을 우선 사용하지 않도록 합니다.
- 기존 `gradle.properties`의 업데이트 확인 주소는 그대로 두었습니다. **새 V47 파일은 GitHub에 올리지 않았습니다.**

## 케인님이 Android Studio에서 APK 만들기

1. `GAIA-JET-DUO-V48-ANDROID-STUDIO.zip` 파일을 압축 해제합니다.
2. Android Studio를 열고 **Open** → 압축을 푼 **`GAIA-JET-DUO-V48-ANDROID` 폴더 자체**를 선택합니다.
3. 프로젝트 하단의 **Gradle Sync**가 끝날 때까지 기다립니다. 최초 실행 시 Android SDK 구성요소를 설치하라고 안내할 수 있습니다.
4. 상단 **Build → Build Bundle(s) / APK(s) → Build APK(s)** 를 선택합니다. 메뉴 명칭이 다른 버전에서는 **Build → Generate App Bundles or APKs → Generate APKs** 또는 Gradle의 `assembleDebug`를 사용하셔도 됩니다.
5. 완성된 APK는 `GAIA-JET-DUO-V48-ANDROID/app/build/outputs/apk/debug/app-debug.apk` 위치에 생깁니다.

**기존 게임 세이브 주의:** 설치된 이전 APK와 디버그 서명이 다르면 덮어 설치할 수 없습니다. 기존 앱 삭제는 저장 데이터 손실로 이어질 수 있으므로 먼저 백업하세요.

## 검증 및 배포 범위

- V48에 내장된 HTML이 V47과 완전히 동일한지 파일 해시로 확인합니다.
- Android `MainActivity.java`의 미니게임 iframe 예외 및 버전 코드 변경을 정적 검사합니다.
- 이 환경에서 Android SDK로 실제 APK를 빌드하거나 기기에서 미니게임 진입을 검증하지는 못했습니다.
- GitHub에 커밋·푸시하지 않았고 기존 V47 프로젝트 폴더도 수정하지 않았습니다.
