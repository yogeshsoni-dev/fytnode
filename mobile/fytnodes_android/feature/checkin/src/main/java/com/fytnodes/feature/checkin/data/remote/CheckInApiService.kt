package com.fytnodes.feature.checkin.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.POST

@Serializable
data class AttendanceResponseDto(
    val success: Boolean? = null,
    val message: String? = null,
    val data: AttendanceDataDto? = null,
)

@Serializable
data class AttendanceDataDto(
    val id: Int? = null,
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
    ): AttendanceResponseDto

    @PATCH("attendance/{attendanceId}/check-out")
    suspend fun checkOut(
        @Path("attendanceId") attendanceId: Int,
        @Body request: Map<String, String> = emptyMap(),
    ): AttendanceResponseDto
}
