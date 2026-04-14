package com.fytnodes.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.fytnodes.core.database.dao.SessionDao
import com.fytnodes.core.database.dao.UserDao
import com.fytnodes.core.database.entity.SessionEntity
import com.fytnodes.core.database.entity.UserEntity

@Database(
    entities = [SessionEntity::class, UserEntity::class],
    version = 3,
    exportSchema = false,
)
abstract class FytNodesDatabase : RoomDatabase() {
    abstract fun sessionDao(): SessionDao
    abstract fun userDao(): UserDao
}

