plugins {
    id("com.android.application")
}

android {
    namespace = "com.gaia.jetduo"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.gaia.jetduo"
        minSdk = 26
        targetSdk = 35
        versionCode = 49
        versionName = "0.49.0-script-fix"

        // Opt-in: the game stays completely offline until a trusted HTTPS
        // manifest URL is intentionally configured by the project owner.
        val manifestUrl = providers.gradleProperty("gaiaUpdateManifestUrl").orNull.orEmpty()
        buildConfigField("String", "UPDATE_MANIFEST_URL", "\"${manifestUrl.replace("\\", "\\\\").replace("\"", "\\\"")}\"")
    }
    buildFeatures {
        buildConfig = true
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    packaging {
        resources.excludes.add("META-INF/*")
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.14.0")
}
