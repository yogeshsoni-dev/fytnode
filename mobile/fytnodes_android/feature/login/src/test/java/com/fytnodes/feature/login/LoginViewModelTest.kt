package com.fytnodes.feature.login

import app.cash.turbine.test
import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.auth.model.AuthToken
import com.fytnodes.core.domain.auth.repository.AuthRepository
import com.fytnodes.core.domain.login.model.LoginRequest
import com.fytnodes.core.domain.signup.model.SignupRequest
import com.fytnodes.core.domain.login.usecase.LoginUseCase
import com.fytnodes.feature.login.model.LoginUiEffect
import com.fytnodes.feature.login.model.LoginUiEvent
import com.fytnodes.feature.login.model.LoginUiState
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class LoginViewModelTest {
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun `submit with invalid email emits error state`() = runTest {
        val vm = LoginViewModel(
            loginUseCase = LoginUseCase(
                authRepository = FakeAuthRepository(AppResult.Error("unused")),
            ),
        )

        vm.onEvent(LoginUiEvent.OnEmailChanged("invalid-email"))
        vm.onEvent(LoginUiEvent.OnPasswordChanged("123456"))
        vm.onEvent(LoginUiEvent.Submit)
        advanceUntilIdle()

        assertTrue(vm.uiState.value is LoginUiState.Error)
    }

    @Test
    fun `submit success emits success state and navigate effect`() = runTest {
        val success = AppResult.Success(AuthToken(accessToken = "token-123"))
        val vm = LoginViewModel(
            loginUseCase = LoginUseCase(
                authRepository = FakeAuthRepository(success),
            ),
        )

        vm.onEvent(LoginUiEvent.OnEmailChanged("test@fytnodes.com"))
        vm.onEvent(LoginUiEvent.OnPasswordChanged("123456"))

        vm.uiEffect.test {
            vm.onEvent(LoginUiEvent.Submit)
            advanceUntilIdle()

            assertTrue(vm.uiState.value is LoginUiState.Success)
            assertTrue(awaitItem() is LoginUiEffect.NavigateToDashboard)
            cancelAndIgnoreRemainingEvents()
        }
    }
}

private class FakeAuthRepository(
    private val result: AppResult<AuthToken>,
) : AuthRepository {
    override suspend fun signup(request: SignupRequest): AppResult<String> = AppResult.Success("token")

    override suspend fun login(request: LoginRequest): AppResult<AuthToken> = result
}

