package com.fytnodes.core.data.remote.api

import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class AuthApiDtoTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun `login response decodes access and refresh token from backend wrapper`() {
        val payload =
            """
            {
              "success": true,
              "message": "Login successful",
              "data": {
                "accessToken": "access-token-123",
                "refreshToken": "refresh-token-123"
              }
            }
            """.trimIndent()

        val dto = json.decodeFromString<LoginResponseDto>(payload)

        assertNotNull(dto.data)
        assertEquals("access-token-123", dto.data?.accessToken)
        assertEquals("refresh-token-123", dto.data?.refreshToken)
    }
}
