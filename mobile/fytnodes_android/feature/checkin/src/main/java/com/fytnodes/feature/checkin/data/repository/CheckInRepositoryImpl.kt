package com.fytnodes.feature.checkin.data.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.database.dao.UserDao
import com.fytnodes.feature.checkin.data.remote.CheckInApiService
import com.fytnodes.feature.checkin.data.remote.CheckInErrorDto
import com.fytnodes.feature.checkin.data.remote.CheckInRequestDto
import com.fytnodes.feature.checkin.domain.model.CheckInResult
import com.fytnodes.feature.checkin.domain.model.CheckOutResult
import com.fytnodes.feature.checkin.domain.repository.CheckInRepository
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.first
import kotlinx.serialization.json.Json
import retrofit2.HttpException

@Singleton
class CheckInRepositoryImpl @Inject constructor(
    private val api: CheckInApiService,
    private val userDao: UserDao,
    private val json: Json,
) : CheckInRepository {
    override suspend fun checkIn(): AppResult<CheckInResult> {
        return try {
            val user = userDao.getUser().first()
            val role = user?.role?.uppercase().orEmpty().ifBlank { "MEMBER" }
            val request = if (role == "ADMIN" || role == "TRAINER") {
                if (user?.memberId == null) {
                    return AppResult.Error("Member ID required")
                }
                CheckInRequestDto(memberId = user.memberId)
            } else {
                CheckInRequestDto()
            }
            val response = api.checkIn(request = request)
            val attendanceId = response.data?.id ?: return AppResult.Error("Unable to process check-in")
            AppResult.Success(
                CheckInResult(
                    attendanceId = attendanceId,
                    message = response.message.orEmpty().ifBlank { "Check-in recorded" },
                ),
            )
        } catch (e: IOException) {
            AppResult.Error("Check your internet connection", e)
        } catch (e: HttpException) {
            AppResult.Error(mapHttpError(e), e)
        } catch (e: Throwable) {
            AppResult.Error("Server issue. Try again later", e)
        }
    }

    override suspend fun checkOut(attendanceId: Int): AppResult<CheckOutResult> {
        return try {
            val response = api.checkOut(attendanceId = attendanceId)
            AppResult.Success(CheckOutResult(message = response.message.orEmpty().ifBlank { "Check-out recorded" }))
        } catch (e: IOException) {
            AppResult.Error("Check your internet connection", e)
        } catch (e: HttpException) {
            AppResult.Error(mapCheckOutHttpError(e), e)
        } catch (e: Throwable) {
            AppResult.Error("Server issue. Try again later", e)
        }
    }

    private fun mapHttpError(error: HttpException): String {
        val parsed = parseErrorBody(error)
        return when (error.code()) {
            401 -> "Session expired. Please login again"
            422 -> "Member ID required"
            404 -> "Member not found"
            409 -> "Already checked in today"
            500 -> "Server issue. Try again later"
            else -> parsed?.message ?: "Server issue. Try again later"
        }
    }

    private fun parseErrorBody(error: HttpException): CheckInErrorDto? {
        val raw = error.response()?.errorBody()?.string()?.trim().orEmpty()
        if (raw.isBlank()) return null
        return runCatching { json.decodeFromString(CheckInErrorDto.serializer(), raw) }.getOrNull()
    }

    private fun mapCheckOutHttpError(error: HttpException): String {
        val parsed = parseErrorBody(error)
        return when (error.code()) {
            401 -> "Session expired. Please login again"
            403 -> "You can only check yourself out"
            404 -> "Attendance not found"
            400 -> "No check-in found"
            409 -> "Already checked out"
            422 -> "Invalid attendance ID"
            else -> parsed?.message ?: "Server issue. Try again later"
        }
    }
}
