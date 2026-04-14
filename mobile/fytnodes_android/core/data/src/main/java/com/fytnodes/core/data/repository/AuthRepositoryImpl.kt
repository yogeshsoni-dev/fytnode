package com.fytnodes.core.data.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.data.di.IoDispatcher
import com.fytnodes.core.data.remote.api.ApiErrorResponseDto
import com.fytnodes.core.data.remote.api.AuthApiService
import com.fytnodes.core.data.remote.api.LoginRequestDto
import com.fytnodes.core.domain.auth.model.AuthToken
import com.fytnodes.core.database.dao.UserDao
import com.fytnodes.core.database.entity.UserEntity
import com.fytnodes.core.data.remote.api.SignupRequestDto
import com.fytnodes.core.domain.auth.repository.AuthRepository
import com.fytnodes.core.domain.login.model.LoginRequest
import com.fytnodes.core.domain.signup.model.SignupRequest
import com.fytnodes.core.domain.signup.model.SignupResult
import com.fytnodes.core.domain.store.SessionStore
import com.fytnodes.core.domain.user.model.User
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive
import retrofit2.HttpException

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApiService,
    private val json: Json,
    private val userDao: UserDao,
    private val sessionStore: SessionStore,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher,
) : AuthRepository {

    override suspend fun signup(request: SignupRequest): AppResult<SignupResult> = withContext(ioDispatcher) {
        try {
            val response = api.signup(
                SignupRequestDto(
                    email = request.email,
                    password = request.password,
                    name = request.name,
                ),
            )
            val nextAction = response.nextAction
            val message = response.message
            val user = response.user

            if (nextAction == null && message.isNullOrBlank() && user == null) {
                AppResult.Error("Something went wrong")
            } else {
                AppResult.Success(
                    SignupResult(
                        nextAction = nextAction,
                        message = message,
                    ),
                )
            }
        } catch (t: Throwable) {
            AppResult.Error(mapSignupError(t), t)
        }
    }

    override suspend fun login(request: LoginRequest): AppResult<AuthToken> = withContext(ioDispatcher) {
        try {
            val response = api.login(
                LoginRequestDto(
                    email = request.email.trim(),
                    password = request.password,
                ),
            )

            val token = response.data?.accessToken
            if (token.isNullOrBlank()) {
                AppResult.Error("Something went wrong")
            } else {
                sessionStore.accessToken = token
                AppResult.Success(AuthToken(accessToken = token))
            }
        } catch (t: Throwable) {
            AppResult.Error(mapLoginError(t), t)
        }
    }

    override suspend fun syncUserProfile(): AppResult<Unit> = withContext(ioDispatcher) {
        val token = sessionStore.accessToken
        if (token.isNullOrBlank()) {
            return@withContext AppResult.Error("Unable to refresh profile")
        }

        try {
            val response = api.profile(authorization = "Bearer $token")
            val profile = response.data
            val email = profile?.email
            val name = profile?.name
            val role = profile?.role?.uppercase().orEmpty().ifBlank { "MEMBER" }
            val memberId = profile?.member?.id
            if (email.isNullOrBlank() || name.isNullOrBlank()) {
                return@withContext AppResult.Error("Unable to refresh profile")
            }
            userDao.insertUser(
                UserEntity(
                    email = email,
                    name = name,
                    role = role,
                    memberId = memberId,
                ),
            )
            sessionStore.email = email
            sessionStore.name = name
            AppResult.Success(Unit)
        } catch (_: Throwable) {
            AppResult.Error("Unable to refresh profile")
        }
    }

    override fun getUserProfile(): Flow<User?> =
        userDao.getUser().map { entity ->
            entity?.let {
                User(
                    email = it.email,
                    name = it.name,
                    role = it.role,
                    memberId = it.memberId,
                )
            }
        }

    private fun mapSignupError(t: Throwable): String {
        return when (t) {
            is IOException -> "Please check your internet connection"
            is HttpException -> {
                val parsed = parseErrorBody(t)
                when (t.code()) {
                    400 -> "Invalid input. Please check your details"
                    409 -> "Email already registered"
                    else -> when (parsed?.statusCode ?: t.code()) {
                        409 -> "Email already registered"
                        else -> "Something went wrong"
                    }
                }
            }
            else -> "Something went wrong"
        }
    }

    private fun mapLoginError(t: Throwable): String {
        return when (t) {
            is IOException -> "Please check your internet connection"
            is HttpException -> {
                val parsed = parseErrorBody(t)
                when (t.code()) {
                    400 -> mapValidationMessage(parsed) ?: "Invalid input"
                    401 -> "Invalid email or password"
                    else -> "Something went wrong"
                }
            }
            else -> "Something went wrong"
        }
    }

    private fun mapValidationMessage(parsed: ApiErrorResponseDto?): String? {
        val raw = parsed?.message ?: return null
        return when (raw) {
            is JsonPrimitive -> normalizeValidationMessage(raw.content)
            is JsonArray -> {
                val first = raw.firstOrNull()?.jsonPrimitive?.contentOrNull
                first?.let(::normalizeValidationMessage)
            }
            else -> null
        }
    }

    private fun normalizeValidationMessage(message: String): String {
        val lower = message.lowercase()
        return when {
            "email must be an email" in lower -> "Invalid email format"
            "password must be longer than or equal to" in lower -> "Password must be at least 8 characters"
            else -> message
        }
    }

    private fun parseErrorBody(t: HttpException): ApiErrorResponseDto? {
        val raw = t.response()?.errorBody()?.string()?.trim().orEmpty()
        if (raw.isBlank()) return null
        return runCatching { json.decodeFromString(ApiErrorResponseDto.serializer(), raw) }.getOrNull()
    }
}

