package com.fytnodes.core.domain.login.usecase

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.auth.model.AuthToken
import com.fytnodes.core.domain.auth.repository.AuthRepository
import com.fytnodes.core.domain.login.model.LoginRequest
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository,
) {
    suspend operator fun invoke(request: LoginRequest): AppResult<AuthToken> =
        authRepository.login(request)
}

