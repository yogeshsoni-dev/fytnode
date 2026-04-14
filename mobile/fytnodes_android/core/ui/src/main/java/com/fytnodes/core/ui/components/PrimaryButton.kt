package com.fytnodes.core.ui.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import com.fytnodes.core.ui.theme.FontSemiBold
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.Radius20
import com.fytnodes.core.ui.theme.Space1
import com.fytnodes.core.ui.theme.Space3
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space8
import com.fytnodes.core.ui.theme.TextBase
import com.fytnodes.core.ui.theme.TextBlack

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    loading: Boolean = false,
    enabled: Boolean = true,
) {
    Button(
        onClick = onClick,
        enabled = enabled && !loading,
        modifier = modifier.fillMaxWidth().shadow(elevation = Space3, shape = androidx.compose.foundation.shape.RoundedCornerShape(Radius20)),
        colors = ButtonDefaults.buttonColors(containerColor = NeonGreen, contentColor = TextBlack),
        shape = androidx.compose.foundation.shape.RoundedCornerShape(Radius20),
        contentPadding = PaddingValues(horizontal = Space8, vertical = Space4),
    ) {
        if (loading) {
            CircularProgressIndicator(color = Color.Black, strokeWidth = Space1 / 2)
        } else {
            Text(text = text, fontSize = TextBase, fontWeight = FontSemiBold)
        }
    }
}

