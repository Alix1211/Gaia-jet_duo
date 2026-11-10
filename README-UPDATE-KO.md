# GAIA JET DUO V44.1 — 아이콘 + 자동 업데이트 설치

이 파일은 기존 V44 Android Studio 프로젝트의 소규모 수정 패치입니다.

## 기존 Android Studio 프로젝트에 적용

1. `GAIA-JET-DUO-V44-UPDATE-PATCH.zip`을 압축 해제합니다.
2. 안에 있는 `gradle.properties`, `app` 폴더를 **현재 사용 중인 `GAIA-JET-DUO-V44-ANDROID` 폴더 안에 복사**하고, 같은 이름의 파일 3개(`gradle.properties`, `app/build.gradle.kts`, `app/src/main/AndroidManifest.xml`)는 덮어씁니다. `local.properties`, 기존 게임 HTML, 사용자 프로젝트 설정은 건드리지 않습니다.
3. Android Studio로 돌아가 Gradle 동기화가 끝나면 **Build → Generate App Bundles or APKs → Generate APKs**를 실행합니다.
4. 새 `app-debug.apk`를 **기존 설치 앱 위에 설치**합니다. Android Studio가 같은 PC라면 디버그 서명 키가 같으므로 저장 데이터가 유지되어야 합니다. 설치가 막히면 기존 앱을 바로 삭제하지 말고 오류를 먼저 확인하세요.

## 변경 사항

- 앱 아이콘: 보라/핑크 듀오 게임 일러스트를 5개 런처 해상도로 추가.
- 버전 코드: 44 → 45 (게임 본편은 V44 그대로).
- 자동 업데이트 주소: `https://raw.githubusercontent.com/Alix1211/Gaia-jet_duo/jetduo-updates/updates/jetduo/update.json`
- GitHub 분리 브랜치: `jetduo-updates` (main 미변경).
- 게임 HTML 변경 없음. 실기기 다운로드 갱신은 차기 45 버전 HTML 게시 후 검증 가능.

## 게임 콘텐츠 다음 버전 게시 규칙

업데이트 채널은 공개 GitHub이므로 새 HTML에 포함된 리소스도 공개됩니다. 게임 HTML을 먼저 `jetduo-updates/updates/jetduo/game-v45.html`에 올린 다음, `update.json`의 version/url/sha256을 고쳐야 합니다. 앱은 SHA-256이 맞는 HTML만 받으며 게임 도중 즉시 전환하지 않고 다음 실행부터 사용합니다.

**안드로이드 자체 기능 변경은 새 APK가 필요합니다.** 이 시스템이 APK를 무단 설치하는 기능은 아닙니다.
