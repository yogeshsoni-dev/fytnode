package com.fytnodes.feature.checkin.domain.model

data class CheckInResult(
    val attendanceId: Int,
    val message: String,
)

data class CheckOutResult(
    val message: String,
)
