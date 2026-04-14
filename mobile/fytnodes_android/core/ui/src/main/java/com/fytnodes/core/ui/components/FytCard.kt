package com.fytnodes.core.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

enum class CardPadding { SMALL, MEDIUM, LARGE }

@Composable
fun FytCard(
    modifier: Modifier = Modifier,
    padding: CardPadding = CardPadding.MEDIUM,
    elevation: Dp = 10.dp,
    content: @Composable ColumnScope.() -> Unit,
) {
    GlassCard(modifier = modifier) {
        Column(content = content)
    }
}

