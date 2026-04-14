package com.fytnodes.feature.signup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.fytnodes.core.ui.components.AppLayout
import com.fytnodes.core.ui.components.FytTextField
import com.fytnodes.core.ui.components.GlassCard
import com.fytnodes.core.ui.components.IconBadge
import com.fytnodes.core.ui.components.PrimaryButton
import com.fytnodes.core.ui.components.SecondaryButton
import com.fytnodes.core.ui.layout.ScreenContainer
import com.fytnodes.core.ui.theme.FytNodesTheme
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.NeonGreenDark
import com.fytnodes.core.ui.theme.Space10
import com.fytnodes.core.ui.theme.Space2
import com.fytnodes.core.ui.theme.Space3
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space5
import com.fytnodes.core.ui.theme.Space6
import com.fytnodes.core.ui.theme.TextSecondary
import com.fytnodes.feature.signup.model.SignupUiEffect
import com.fytnodes.feature.signup.model.SignupUiEvent
import com.fytnodes.feature.signup.model.SignupUiState

@Composable
fun SignupRoute(
    onNavigateToLogin: () -> Unit,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SignupViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(Unit) {
        viewModel.uiEffect.collect { effect ->
            when (effect) {
                is SignupUiEffect.ShowMessage -> snackbarHostState.showSnackbar(effect.message)
                SignupUiEffect.NavigateBack -> onNavigateBack()
                SignupUiEffect.NavigateToLogin -> onNavigateToLogin()
            }
        }
    }
    SignupScreen(uiState = uiState, onEvent = viewModel::onEvent, snackbarHostState = snackbarHostState, modifier = modifier)
}

@Composable
private fun SignupScreen(
    uiState: SignupUiState,
    onEvent: (SignupUiEvent) -> Unit,
    snackbarHostState: SnackbarHostState,
    modifier: Modifier = Modifier,
) {
    val isLoading = uiState is SignupUiState.Loading

    AppLayout(modifier = modifier) {
        ScreenContainer(
            modifier = Modifier.verticalScroll(rememberScrollState()),
            horizontalPadding = Space6,
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                SnackbarHost(hostState = snackbarHostState)
                IconBadge(icon = Icons.Default.Person, gradient = listOf(NeonGreenDark, NeonGreen), size = Space10 + Space6, iconSize = Space6)
                GlassCard(modifier = Modifier.padding(top = Space5)) {
                    Text(text = "Create Account", style = MaterialTheme.typography.displaySmall, color = NeonGreen)
                    Text(
                        text = "Join FytNodes today",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary,
                        modifier = Modifier.padding(bottom = Space5),
                    )
                    FytTextField(
                        value = uiState.name,
                        onValueChange = { onEvent(SignupUiEvent.OnNameChanged(it)) },
                        label = "Full Name",
                        placeholder = "John Doe",
                        icon = Icons.Default.Person,
                        modifier = Modifier.padding(bottom = Space3),
                    )
                    FytTextField(
                        value = uiState.email,
                        onValueChange = { onEvent(SignupUiEvent.OnEmailChanged(it)) },
                        label = "Email",
                        placeholder = "email@example.com",
                        icon = Icons.Default.Email,
                        keyboardType = KeyboardType.Email,
                        modifier = Modifier.padding(bottom = Space3),
                    )
                    FytTextField(
                        value = uiState.password,
                        onValueChange = { onEvent(SignupUiEvent.OnPasswordChanged(it)) },
                        label = "Password",
                        placeholder = "Minimum 6 characters",
                        icon = Icons.Default.Lock,
                        isPassword = true,
                        modifier = Modifier.padding(bottom = Space4),
                    )
                    PrimaryButton(
                        text = "Create Account",
                        onClick = { onEvent(SignupUiEvent.Submit) },
                        loading = isLoading,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    SecondaryButton(
                        text = "Back to Login",
                        onClick = { onEvent(SignupUiEvent.NavigateBackClick) },
                        modifier = Modifier.fillMaxWidth().padding(top = Space3),
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun SignupScreenPreview() {
    FytNodesTheme {
        SignupScreen(
            uiState = SignupUiState.Idle(
                name = "Alex Doe",
                email = "alex@example.com",
                password = "password123",
            ),
            onEvent = {},
            snackbarHostState = SnackbarHostState(),
        )
    }
}

