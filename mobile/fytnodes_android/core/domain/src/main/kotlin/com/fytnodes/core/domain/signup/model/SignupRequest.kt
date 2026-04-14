package com.fytnodes.core.domain.signup.model

data class SignupRequest(
    val name: String,
    val email: String,
    val password: String,
)

