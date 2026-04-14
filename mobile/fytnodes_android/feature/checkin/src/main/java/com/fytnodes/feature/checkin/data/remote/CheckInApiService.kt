package com.fytnodes.feature.checkin.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.POST

@Serializable
data class CheckInResponseDto(
    val success: Boolean? = null,
    val message: String? = null,
)

@Serializable
data class CheckInRequestDto(
    val memberId: Int? = null,
)

@Serializable
data class CheckInErrorDto(
    val message: String? = null,
    val statusCode: Int? = null,
)

interface CheckInApiService {
    @POST("attendance/check-in")
    suspend fun checkIn(
        @Body request: CheckInRequestDto,
    ): CheckInResponseDto
}
