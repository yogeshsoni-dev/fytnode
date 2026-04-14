package com.fytnodes.core.ui.layout

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import com.fytnodes.core.ui.theme.BottomNavHeight
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space6

@Composable
fun ScreenContainer(
    modifier: Modifier = Modifier,
    includeBottomNavPadding: Boolean = false,
    topSpacing: Dp = Space6,
    horizontalPadding: Dp = Space4,
    content: @Composable ColumnScope.() -> Unit,
) {
    val bottomPadding = if (includeBottomNavPadding) BottomNavHeight + Space4 else Space4
    Column(
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(
                top = topSpacing,
                start = horizontalPadding,
                end = horizontalPadding,
                bottom = bottomPadding,
            ),
        content = content,
    )
}
