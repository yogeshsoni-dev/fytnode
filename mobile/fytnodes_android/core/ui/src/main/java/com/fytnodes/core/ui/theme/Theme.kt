package com.fytnodes.core.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val FytNodesColorScheme = darkColorScheme(
    primary = NeonGreen,
    onPrimary = TextBlack,
    background = BackgroundDarkStart,
    onBackground = TextPrimary,
    surface = GlassWhite,
    onSurface = TextPrimary,
    error = Red400,
    onError = TextPrimary,
)

@Composable
fun FytNodesTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = FytNodesColorScheme,
        typography = FytNodesTypography,
        content = content,
    )
}

