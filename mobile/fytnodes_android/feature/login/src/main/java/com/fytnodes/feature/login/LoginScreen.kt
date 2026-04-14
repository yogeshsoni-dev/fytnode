package com.fytnodes.feature.login

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.fytnodes.core.ui.components.AppLayout
import com.fytnodes.core.ui.components.FytTextField
import com.fytnodes.core.ui.components.GlassCard
import com.fytnodes.core.ui.components.PrimaryButton
import com.fytnodes.core.ui.components.SecondaryButton
import com.fytnodes.core.ui.layout.ScreenContainer
import com.fytnodes.core.ui.theme.NeonGreen
import com.fytnodes.core.ui.theme.Space1
import com.fytnodes.core.ui.theme.Space16
import com.fytnodes.core.ui.theme.Space2
import com.fytnodes.core.ui.theme.Space3
import com.fytnodes.core.ui.theme.Space4
import com.fytnodes.core.ui.theme.Space6
import com.fytnodes.core.ui.theme.Space8
import com.fytnodes.core.ui.theme.FytNodesTheme
import com.fytnodes.core.ui.theme.TextSecondary
import com.fytnodes.feature.login.model.LoginUiEffect
import com.fytnodes.feature.login.model.LoginUiEvent
import com.fytnodes.feature.login.model.LoginUiState
import kotlinx.coroutines.flow.collect

@Composable
fun LoginRoute(
    onNavigateToSignup: () -> Unit,
    onNavigateToDashboard: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: LoginViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(Unit) {
        viewModel.uiEffect.collect { effect ->
            when (effect) {
                is LoginUiEffect.ShowMessage -> snackbarHostState.showSnackbar(effect.message)
                LoginUiEffect.NavigateToDashboard -> onNavigateToDashboard()
                LoginUiEffect.NavigateToSignup -> onNavigateToSignup()
            }
        }
    }
    LoginScreen(
        modifier = modifier,
        uiState = uiState,
        onEvent = viewModel::onEvent,
        snackbarHostState = snackbarHostState,
    )
}

@Composable
fun LoginScreen(
    uiState: LoginUiState,
    onEvent: (LoginUiEvent) -> Unit,
    snackbarHostState: SnackbarHostState,
    modifier: Modifier = Modifier,
) {
    var email by rememberSaveable { mutableStateOf("mohitrawat26@gmail.com") }
    var password by rememberSaveable { mutableStateOf("Strong@12@") }
    var showPassword by rememberSaveable { mutableStateOf(false) }

    AppLayout(modifier = modifier) {
        ScreenContainer(
            modifier = Modifier.verticalScroll(rememberScrollState()),
            horizontalPadding = Space6,
        ) {
            SnackbarHost(hostState = snackbarHostState)
            Spacer(modifier = Modifier.height(Space16))

            GlassCard {
                Text(
                    text = "Welcome to FytNodes",
                    style = MaterialTheme.typography.displaySmall,
                    color = NeonGreen,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = "Login to continue your journey",
                    style = MaterialTheme.typography.bodyLarge,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = Space2, bottom = Space8),
                )
                FytTextField(
                    value = email,
                    onValueChange = {
                        email = it
                        onEvent(LoginUiEvent.OnEmailChanged(it))
                    },
                    label = "Email Address",
                    placeholder = "your@email.com",
                    icon = Icons.Default.Email,
                    keyboardType = KeyboardType.Email,
                    modifier = Modifier.padding(bottom = Space4),
                )
                FytTextField(
                    value = password,
                    onValueChange = {
                        password = it
                        onEvent(LoginUiEvent.OnPasswordChanged(it))
                    },
                    label = "Password",
                    placeholder = "Enter your password",
                    icon = Icons.Default.Lock,
                    isPassword = !showPassword,
                    modifier = Modifier.padding(bottom = Space2),
                    trailingIcon = {
                        IconButton(onClick = { showPassword = !showPassword }) {
                            Icon(
                                imageVector = if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = if (showPassword) "Hide password" else "Show password",
                                tint = TextSecondary,
                            )
                        }
                    },
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = { }) {
                        Text(
                            text = "Forgot Password?",
                            style = MaterialTheme.typography.bodySmall,
                            color = NeonGreen,
                        )
                    }
                }
                PrimaryButton(
                    text = "Sign In",
                    onClick = { onEvent(LoginUiEvent.Submit) },
                    loading = uiState is LoginUiState.Loading,
                    modifier = Modifier.fillMaxWidth(),
                )
                val errorMessage = (uiState as? LoginUiState.Error)?.message
                if (errorMessage != null) {
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(top = Space2),
                    )
                }
            }
            Spacer(modifier = Modifier.height(Space6))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(Space1 / 4)
                        .background(TextSecondary.copy(alpha = 0.25f)),
                )
                Text(
                    text = "or continue with",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    modifier = Modifier.padding(horizontal = Space4),
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(Space1 / 4)
                        .background(TextSecondary.copy(alpha = 0.25f)),
                )
            }
            Spacer(modifier = Modifier.height(Space4))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(Space3),
            ) {
                SecondaryButton(
                    text = "Google",
                    onClick = { },
                    modifier = Modifier.weight(1f),
                )
                SecondaryButton(
                    text = "Apple",
                    onClick = { },
                    modifier = Modifier.weight(1f),
                )
            }
            Spacer(modifier = Modifier.height(Space6))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                Text(
                    text = "Don't have an account? ",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                )
                TextButton(onClick = { onEvent(LoginUiEvent.NavigateToSignupClick) }) {
                    Text(text = "Sign Up", style = MaterialTheme.typography.bodySmall, color = NeonGreen)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun LoginScreenPreview() {
    FytNodesTheme {
        LoginScreen(
            uiState = LoginUiState.Idle,
            onEvent = {},
            snackbarHostState = SnackbarHostState(),
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun LoginScreenErrorPreview() {
    FytNodesTheme {
        LoginScreen(
            uiState = LoginUiState.Error("Invalid credentials"),
            onEvent = {},
            snackbarHostState = SnackbarHostState(),
        )
    }
}
