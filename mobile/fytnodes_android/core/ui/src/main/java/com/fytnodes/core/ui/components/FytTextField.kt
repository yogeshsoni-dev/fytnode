package com.fytnodes.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.foundation.shape.RoundedCornerShape
import com.fytnodes.core.ui.theme.GlassBorder
import com.fytnodes.core.ui.theme.GlassWhite
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.Radius16
import com.fytnodes.core.ui.theme.Red400
import com.fytnodes.core.ui.theme.Space1
import com.fytnodes.core.ui.theme.Space2
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.TextMuted
import com.fytnodes.core.ui.theme.TextPrimary
import com.fytnodes.core.ui.theme.TextSecondary

@Composable
fun FytTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String = "",
    icon: ImageVector? = null,
    isPassword: Boolean = false,
    keyboardType: KeyboardType = KeyboardType.Text,
    error: String? = null,
    enabled: Boolean = true,
    trailingIcon: (@Composable () -> Unit)? = null,
) {
    Column(modifier = modifier) {
        label?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.labelLarge,
                color = TextPrimary,
                modifier = Modifier.padding(bottom = Space2),
            )
        }

        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .background(color = GlassWhite, shape = RoundedCornerShape(Radius16))
                .border(
                    width = Space1 / 4,
                    color = if (error != null) Red400 else GlassBorder,
                    shape = RoundedCornerShape(Radius16),
                ),
            placeholder = { Text(text = placeholder, color = TextMuted) },
            leadingIcon = icon?.let { image ->
                { Icon(imageVector = image, contentDescription = null, tint = TextMuted) }
            },
            trailingIcon = trailingIcon,
            visualTransformation = if (isPassword) PasswordVisualTransformation() else VisualTransformation.None,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary,
                focusedContainerColor = GlassWhite,
                unfocusedContainerColor = GlassWhite,
                disabledContainerColor = GlassWhite,
                focusedBorderColor = NeonGreen.copy(alpha = 0.5f),
                unfocusedBorderColor = Color.Transparent,
            ),
            shape = RoundedCornerShape(Radius16),
            enabled = enabled,
            singleLine = true,
        )

        error?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodySmall,
                color = Red400,
                modifier = Modifier.padding(start = Space4, top = Space1),
            )
        }
    }
}

