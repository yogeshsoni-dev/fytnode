package com.fytnodes.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user")
data class UserEntity(
    @PrimaryKey val email: String,
    val name: String,
    val role: String = "MEMBER",
    val memberId: Int? = null,
)

