pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    plugins {
        id("com.android.application") version "8.7.2"
        id("com.android.library") version "8.7.2"
        id("org.jetbrains.kotlin.android") version "2.0.21"
        id("org.jetbrains.kotlin.jvm") version "2.0.21"
        id("org.jetbrains.kotlin.plugin.compose") version "2.0.21"
        id("com.google.dagger.hilt.android") version "2.52"
        id("com.google.devtools.ksp") version "2.0.21-1.0.28"
        id("org.jetbrains.kotlin.plugin.serialization") version "2.0.21"
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "FytNodes"

include(":fan")
include(
    ":core:common",
    ":core:analytics",
    ":core:domain",
    ":core:data",
    ":core:network",
    ":core:database",
    ":core:store",
    ":core:work",
    ":core:ui",
    ":core:designsystem",
)
include(":feature:login")
include(":feature:splash")
include(":feature:signup")
include(":feature:home")
include(":feature:onboarding")
include(":feature:profile")
include(":feature:checkin")
