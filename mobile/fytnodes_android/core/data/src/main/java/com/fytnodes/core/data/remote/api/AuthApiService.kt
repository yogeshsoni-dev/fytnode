package com.fytnodes.core.data.remote.api

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Body
import retrofit2.http.POST

@Serializable
data class SignupRequestDto(
    val email: String,
    val password: String,
    val name: String,
)

@Serializable
data class SignupResponseDto(
    val user: SignupUserDto? = null,
    @SerialName("next_action") val nextAction: String? = null,
    val message: String? = null,
)

@Serializable
data class SignupUserDto(
    val id: String? = null,
    val email: String? = null,
    val name: String? = null,
)

@Serializable
data class LoginRequestDto(
    val email: String,
    val password: String,
)

@Serializable
data class LoginResponseDto(
    val success: Boolean? = null,
    val message: String? = null,
    val data: LoginDataDto? = null,
)

@Serializable
data class LoginDataDto(
    val accessToken: String? = null,
    val refreshToken: String? = null,
)

@Serializable
data class ProfileResponseDto(
    val success: Boolean? = null,
    val message: String? = null,
    val data: ProfileUserDto? = null,
)

@Serializable
data class ProfileUserDto(
    val email: String? = null,
    val name: String? = null,
    val role: String? = null,
    val member: ProfileMemberDto? = null,
)

@Serializable
data class ProfileMemberDto(
    val id: Int? = null,
)

@Serializable
internal data class ApiErrorResponseDto(
    val message: JsonElement? = null,
    val error: String? = null,
    val statusCode: Int? = null,
)

interface AuthApiService {
    @POST("auth/signup")
    suspend fun signup(@Body body: SignupRequestDto): SignupResponseDto

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequestDto): LoginResponseDto

    @GET("auth/me")
    suspend fun profile(
        @Header("Authorization") authorization: String,
    ): ProfileResponseDto
}

