package com.gaia.jetduo;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

/**
 * Optional private HTTPS game-data updates. No silent APK installation.
 * Update only code/images/audio embedded in the downloaded single HTML file.
 */
final class ContentUpdater {
    static final int BUNDLED_VERSION = 49;
    private static final long MAX_HTML_BYTES = 80L * 1024 * 1024;
    private static final int MAX_MANIFEST_BYTES = 16 * 1024;
    private final File contentFile;
    private final SharedPreferences saved;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    ContentUpdater(Context context) {
        final File privateDir = new File(context.getFilesDir(), "game-content");
        if (!privateDir.isDirectory()) privateDir.mkdirs();
        contentFile = new File(privateDir, "current.html");
        saved = context.getSharedPreferences("gaia-content-update", Context.MODE_PRIVATE);
    }

    File activeContentFile() {
        if (saved.getInt("version", 0) < BUNDLED_VERSION) return null;
        return contentFile.isFile() && contentFile.length() > 0 ? contentFile : null;
    }

    void checkForUpdate(String manifestUrl, Consumer<Boolean> result) {
        if (manifestUrl == null || manifestUrl.isBlank()) return;
        executor.execute(() -> {
            boolean updated = false;
            File tempFile = new File(contentFile.getParentFile(), "downloading.tmp");
            try {
                URL manifest = requireHttps(manifestUrl);
                JSONObject data = new JSONObject(new String(downloadBytes(manifest, MAX_MANIFEST_BYTES),
                        java.nio.charset.StandardCharsets.UTF_8));
                int version = data.getInt("version");
                final int current = Math.max(BUNDLED_VERSION, saved.getInt("version", 0));
                if (version <= current) return;

                URL content = requireHttps(data.getString("url"));
                // Prevent downloaded game code from unexpectedly switching hosts.
                if (!manifest.getHost().equalsIgnoreCase(content.getHost())) return;
                String expected = data.getString("sha256").toLowerCase(Locale.ROOT);
                if (!expected.matches("[0-9a-f]{64}")) return;

                MessageDigest sha = MessageDigest.getInstance("SHA-256");
                HttpURLConnection conn = open(content);
                long size = 0;
                try (InputStream input = conn.getInputStream();
                     FileOutputStream output = new FileOutputStream(tempFile)) {
                    byte[] block = new byte[64 * 1024];
                    int n;
                    while ((n = input.read(block)) != -1) {
                        size += n;
                        if (size > MAX_HTML_BYTES) throw new IllegalStateException("HTML too large");
                        output.write(block, 0, n);
                        sha.update(block, 0, n);
                    }
                    output.getFD().sync();
                } finally {
                    conn.disconnect();
                }
                if (size < 1024 || !expected.equals(hex(sha.digest()))) return;

                // Move only a verified full download into the private active slot.
                try {
                    Files.move(tempFile.toPath(), contentFile.toPath(),
                            StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
                } catch (java.nio.file.AtomicMoveNotSupportedException unsupported) {
                    Files.move(tempFile.toPath(), contentFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }
                saved.edit().putInt("version", version).apply();
                updated = true;
            } catch (Exception ignored) {
                // Retain the last verified HTML or bundled V48 on network failure.
            } finally {
                if (tempFile.isFile()) tempFile.delete();
                result.accept(updated);
            }
        });
    }

    private static URL requireHttps(String text) throws Exception {
        URL url = new URL(text);
        if (!"https".equalsIgnoreCase(url.getProtocol()) || url.getUserInfo() != null)
            throw new IllegalArgumentException("HTTPS only");
        return url;
    }

    private static HttpURLConnection open(URL url) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(8_000);
        conn.setReadTimeout(16_000);
        conn.setInstanceFollowRedirects(false);
        conn.setRequestProperty("Accept", "application/octet-stream, text/html, application/json");
        if (conn.getResponseCode() != 200) {
            conn.disconnect();
            throw new IllegalStateException("HTTP fetch failed");
        }
        return conn;
    }

    private static byte[] downloadBytes(URL url, int maxBytes) throws Exception {
        HttpURLConnection conn = open(url);
        try (InputStream input = conn.getInputStream();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] block = new byte[2048];
            int n;
            while ((n = input.read(block)) != -1) {
                if (output.size() + n > maxBytes) throw new IllegalStateException("Manifest too large");
                output.write(block, 0, n);
            }
            return output.toByteArray();
        } finally {
            conn.disconnect();
        }
    }

    private static String hex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) result.append(String.format(Locale.ROOT, "%02x", b & 0xff));
        return result.toString();
    }

    void close() { executor.shutdownNow(); }
}
