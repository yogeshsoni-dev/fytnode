plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.fytnodes.core.ui"
    compileSdk = 35
    defaultConfig { minSdk = 26 }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    api(composeBom)
    api(project(":core:designsystem"))
    api("androidx.compose.ui:ui")
    api("androidx.compose.material3:material3")
    api("androidx.compose.foundation:foundation")
    api("androidx.compose.material:material-icons-extended")
    api("androidx.compose.ui:ui-tooling-preview")
    api("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    api("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    api("androidx.hilt:hilt-navigation-compose:1.2.0")
    api("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    api("com.google.dagger:hilt-android:2.52")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
    testImplementation("app.cash.turbine:turbine:1.1.0")
    debugImplementation("androidx.compose.ui:ui-tooling")
}

