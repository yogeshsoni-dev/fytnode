package com.fytnodes.feature.checkin.presentation

import com.fytnodes.core.common.result.AppResult
import com.fytnodes.feature.checkin.domain.model.CheckInResult
import com.fytnodes.feature.checkin.domain.model.CheckOutResult
import com.fytnodes.feature.checkin.domain.repository.CheckInRepository
import com.fytnodes.feature.checkin.domain.usecase.CheckInUseCase
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class CheckInViewModelTest {
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun `check-in success then checkout increments streak and completes`() = runTest {
        val repository = FakeCheckInRepository(
            checkInResult = AppResult.Success(CheckInResult(attendanceId = 7, message = "Check-in recorded")),
            checkOutResult = AppResult.Success(CheckOutResult(message = "Check-out recorded")),
        )
        val viewModel = CheckInViewModel(CheckInUseCase(repository))

        viewModel.checkIn()
        advanceUntilIdle()
        assertTrue(viewModel.uiState.value is CheckInUiState.CheckedIn)

        viewModel.checkOut()
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertTrue(state is CheckInUiState.CheckedOut)
        assertEquals(1, (state as CheckInUiState.CheckedOut).streak)
    }
}

private class FakeCheckInRepository(
    private val checkInResult: AppResult<CheckInResult>,
    private val checkOutResult: AppResult<CheckOutResult>,
) : CheckInRepository {
    override suspend fun checkIn(): AppResult<CheckInResult> = checkInResult

    override suspend fun checkOut(attendanceId: Int): AppResult<CheckOutResult> = checkOutResult
}
