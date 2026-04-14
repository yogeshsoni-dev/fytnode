package com.fytnodes.core.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.shape.RoundedCornerShape
import com.fytnodes.core.ui.theme.GlassBorder
import com.fytnodes.core.ui.theme.GlassWhite
import com.fytnodes.core.ui.theme.Radius20
import com.fytnodes.core.ui.theme.Space1
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space8
import com.fytnodes.core.ui.theme.TextPrimary

@Composable
fun SecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Radius20),
        border = BorderStroke(Space1 / 4, GlassBorder),
        colors = ButtonDefaults.outlinedButtonColors(
            containerColor = GlassWhite,
            contentColor = TextPrimary,
        ),
        contentPadding = PaddingValues(horizontal = Space8, vertical = Space4),
    ) {
        Text(text = text)
    }
}

