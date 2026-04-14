package com.fytnodes.core.domain.login.usecase

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.auth.model.AuthToken
import com.fytnodes.core.domain.auth.repository.AuthRepository
import com.fytnodes.core.domain.login.model.LoginRequest
import com.fytnodes.core.domain.signup.model.SignupRequest
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class LoginUseCaseTest {
    @Test
    fun `invoke delegates request to repository`() = runTest {
        val repository = CapturingAuthRepository()
        val useCase = LoginUseCase(repository)
        val request = LoginRequest(email = "a@b.com", password = "123456")

        val result = useCase(request)

        assertEquals(request, repository.capturedRequest)
        assertTrue(result is AppResult.Success)
    }
}

private class CapturingAuthRepository : AuthRepository {
    var capturedRequest: LoginRequest? = null

    override suspend fun signup(request: SignupRequest): AppResult<String> {
        return AppResult.Success("token")
    }

    override suspend fun login(request: LoginRequest): AppResult<AuthToken> {
        capturedRequest = request
        return AppResult.Success(AuthToken(accessToken = "token"))
    }
}

