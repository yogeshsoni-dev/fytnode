package com.fytnodes.feature.checkin.data.repository

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.core.database.dao.UserDao
import com.fytnodes.core.database.entity.UserEntity
import com.fytnodes.feature.checkin.data.remote.CheckInApiService
import com.fytnodes.feature.checkin.data.remote.CheckInRequestDto
import com.fytnodes.feature.checkin.data.remote.CheckInResponseDto
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runTest
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlinx.serialization.json.Json
import retrofit2.HttpException
import retrofit2.Response

class CheckInRepositoryImplTest {
    @Test
    fun `member check-in sends empty request body`() = runTest {
        val api = FakeCheckInApi()
        val userDao = FakeUserDao(
            UserEntity(
                email = "member@fytnodes.com",
                name = "Member",
                role = "MEMBER",
                memberId = 14,
            ),
        )
        val repository = CheckInRepositoryImpl(api = api, userDao = userDao, json = Json)

        repository.checkIn()

        assertEquals(CheckInRequestDto(memberId = null), api.lastRequest)
    }

    @Test
    fun `trainer check-in sends memberId from local user table`() = runTest {
        val api = FakeCheckInApi()
        val userDao = FakeUserDao(
            UserEntity(
                email = "trainer@fytnodes.com",
                name = "Trainer",
                role = "TRAINER",
                memberId = 41,
            ),
        )
        val repository = CheckInRepositoryImpl(api = api, userDao = userDao, json = Json)

        repository.checkIn()

        assertEquals(CheckInRequestDto(memberId = 41), api.lastRequest)
    }

    @Test
    fun `409 response maps to already checked-in message`() = runTest {
        val api = FakeCheckInApi().apply {
            error = httpException(
                code = 409,
                body = """{"message":"already checked in"}""",
            )
        }
        val userDao = FakeUserDao(
            UserEntity(
                email = "member@fytnodes.com",
                name = "Member",
                role = "MEMBER",
                memberId = 11,
            ),
        )
        val repository = CheckInRepositoryImpl(api = api, userDao = userDao, json = Json)

        val result = repository.checkIn()

        assertTrue(result is AppResult.Error)
        assertEquals("Already checked in today", (result as AppResult.Error).message)
    }
}

private class FakeCheckInApi : CheckInApiService {
    var lastRequest: CheckInRequestDto? = null
    var error: Throwable? = null

    override suspend fun checkIn(request: CheckInRequestDto): CheckInResponseDto {
        error?.let { throw it }
        lastRequest = request
        return CheckInResponseDto(
            success = true,
            message = "Check-in recorded",
        )
    }
}

private class FakeUserDao(user: UserEntity?) : UserDao {
    private val userFlow = MutableStateFlow(user)

    override suspend fun insertUser(user: UserEntity) {
        userFlow.value = user
    }

    override fun getUser(): Flow<UserEntity?> = userFlow
}

private fun httpException(code: Int, body: String): HttpException {
    val response = Response.error<Any>(
        code,
        body.toResponseBody("application/json".toMediaType()),
    )
    return HttpException(response)
}
