package com.fytnodes.core.domain.login.model

data class LoginUser(
    val id: String,
    val name: String,
    val email: String,
    val token: String,
)

