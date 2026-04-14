package com.fytnodes.core.domain.user.model

data class User(
    val email: String,
    val name: String,
    val role: String = "MEMBER",
    val memberId: Int? = null,
)

