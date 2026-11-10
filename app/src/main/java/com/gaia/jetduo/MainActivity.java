package com.gaia.jetduo;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Collections;

/** Android-only shell around the V47 game, with V48 mini-game iframe navigation fix. */
public final class MainActivity extends Activity {
    private static final String GAME_ORIGIN = "https://appassets.androidplatform.net";
    private static final String GAME_URL = GAME_ORIGIN + "/game/index.html";
    private WebView game;
    private ContentUpdater updater;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        immersive();
        updater = new ContentUpdater(this);

        game = new WebView(this);
        game.setBackgroundColor(0xFF061B36);
        game.setOverScrollMode(View.OVER_SCROLL_NEVER);
        final WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/game/", path -> {
                    if (!"index.html".equals(path)) return null;
                    try {
                        final File updated = updater.activeContentFile();
                        final InputStream stream = updated == null
                                ? getAssets().open("GAIA-JET-DUO-v47-ACTIONS-ABOVE-STEER.html")
                                : new FileInputStream(updated);
                        return new WebResourceResponse("text/html", "UTF-8", stream);
                    } catch (Exception ignored) {
                        try {
                            return new WebResourceResponse("text/html", "UTF-8",
                                    getAssets().open("GAIA-JET-DUO-v47-ACTIONS-ABOVE-STEER.html"));
                        } catch (Exception notAvailable) {
                            return null;
                        }
                    }
                })
                .build();

        game.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Mini-games are rendered as iframe.srcdoc (about:srcdoc). A blanket
                // GAME_URL-only rule also blocked these internal subframe navigations.
                if (!request.isForMainFrame()) {
                    final Uri target = request.getUrl();
                    final String scheme = target.getScheme();
                    if ("about".equalsIgnoreCase(scheme)
                            || "data".equalsIgnoreCase(scheme)
                            || "blob".equalsIgnoreCase(scheme)) return false;
                    // Allow only our own asset-origin subframes, never arbitrary hosts.
                    return !GAME_ORIGIN.equals(target.getScheme() + "://" + target.getAuthority());
                }
                // Preserve the main-frame navigation restriction.
                return !GAME_URL.equals(request.getUrl().toString());
            }
        });

        // A main-frame-only message listener avoids exposing an unrestricted
        // Java object to arbitrary web frames.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(game, "GaiaNative",
                    Collections.singleton(GAME_ORIGIN),
                    (view, message, sourceOrigin, isMainFrame, replyProxy) -> {
                        if (!isMainFrame || !GAME_ORIGIN.equals(sourceOrigin.toString())) return;
                        try {
                            JSONObject event = new JSONObject(message.getData());
                            if (!"haptic".equals(event.optString("type"))) return;
                            final String effect = event.optString("effect");
                            runOnUiThread(() -> vibrate(effect));
                        } catch (Exception ignored) {
                            // Unknown/malformed messages cannot access Android APIs.
                        }
                    });
        }

        setContentView(game);
        game.loadUrl(GAME_URL);

        // Checks only after startup; a new version is activated next launch,
        // never in the middle of an ongoing race or mini-game.
        updater.checkForUpdate(BuildConfig.UPDATE_MANIFEST_URL, updated -> {
            if (updated && !isFinishing()) runOnUiThread(() ->
                    Toast.makeText(this, "새 게임 데이터 준비 완료 · 다음 실행 시 적용", Toast.LENGTH_LONG).show());
        });
    }

    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    private void vibrate(String effect) {
        Vibrator vibrator;
        if (Build.VERSION.SDK_INT >= 31) {
            VibratorManager manager = (VibratorManager) getSystemService(VIBRATOR_MANAGER_SERVICE);
            vibrator = manager == null ? null : manager.getDefaultVibrator();
        } else {
            vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        }
        if (vibrator == null || !vibrator.hasVibrator()) return;
        switch (effect) {
            case "collision":
                vibrator.vibrate(VibrationEffect.createWaveform(
                        new long[]{0, 55, 35, 85}, new int[]{0, 155, 0, 220}, -1));
                break;
            case "boost": vibrator.vibrate(VibrationEffect.createOneShot(75, 190)); break;
            case "jump": vibrator.vibrate(VibrationEffect.createOneShot(23, 65)); break;
            case "drift": vibrator.vibrate(VibrationEffect.createOneShot(38, 95)); break;
            default: break;
        }
    }

    @Override public void onBackPressed() {
        // Keep Android Back inside the game rather than closing the activity.
        if (game != null) game.evaluateJavascript(
                "(()=>{let p=document.getElementById('menuPanel');" +
                "if(p&&!p.classList.contains('hidden'))document.getElementById('panelBack')?.click();" +
                "else window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))})()", null);
    }

    @Override protected void onDestroy() {
        if (game != null) { game.stopLoading(); game.destroy(); game = null; }
        if (updater != null) updater.close();
        super.onDestroy();
    }
}
