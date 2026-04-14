package com.fytnodes.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "session")
data class SessionEntity(
    @PrimaryKey val id: String = "active",
    val token: String,
    val email: String,
    val name: String,
)

