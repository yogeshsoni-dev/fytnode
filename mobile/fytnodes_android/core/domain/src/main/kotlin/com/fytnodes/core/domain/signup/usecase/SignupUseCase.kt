package com.fytnodes.core.domain.signup.usecase

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.domain.auth.repository.AuthRepository
import com.fytnodes.core.domain.signup.model.SignupRequest
import com.fytnodes.core.domain.signup.model.SignupResult
import javax.inject.Inject

class SignupUseCase @Inject constructor(
    private val authRepository: AuthRepository,
) {
    suspend operator fun invoke(request: SignupRequest): AppResult<SignupResult> =
        authRepository.signup(request)
}

