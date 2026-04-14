package com.fytnodes.core.data.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.data.di.IoDispatcher
import com.fytnodes.core.domain.login.model.LoginUser
import com.fytnodes.core.domain.signup.model.SignupRequest
import com.fytnodes.core.domain.signup.repository.SignupRepository
import com.fytnodes.core.domain.store.SessionStore
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

@Singleton
class SignupRepositoryImpl @Inject constructor(
    private val sessionStore: SessionStore,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher,
) : SignupRepository {
    override suspend fun signup(request: SignupRequest): AppResult<LoginUser> = withContext(ioDispatcher) {
        try {
            delay(600)
            val user = LoginUser(
                id = "new-user",
                name = request.name,
                email = request.email,
                token = "mock-signup-token",
            )
            sessionStore.accessToken = user.token
            sessionStore.email = user.email
            sessionStore.name = user.name
            AppResult.Success(user)
        } catch (t: Throwable) {
            AppResult.Error(t.message ?: "Unable to sign up", t)
        }
    }
}

