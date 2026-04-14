package com.fytnodes.core.designsystem.theme

import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = FytNodesColors.Teal,
    onPrimary = FytNodesColors.White,
    secondary = FytNodesColors.Blue,
    onSecondary = FytNodesColors.White,
    tertiary = FytNodesColors.Orange,
    onTertiary = FytNodesColors.White,
    background = FytNodesColors.BackgroundMiddle,
    onBackground = FytNodesColors.Text,
    surface = FytNodesColors.White,
    onSurface = FytNodesColors.Text,
    error = FytNodesColors.Red,
    onError = FytNodesColors.White,
)

@Composable
fun FytNodesTheme(
    content: @Composable () -> Unit,
) {
    androidx.compose.material3.MaterialTheme(
        colorScheme = LightColorScheme,
        typography = FytNodesTypography,
        content = content,
    )
}

