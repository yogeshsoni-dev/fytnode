package com.fytnodes.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.fytnodes.core.database.entity.SessionEntity

@Dao
interface SessionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(session: SessionEntity)

    @Query("SELECT * FROM session WHERE id = 'active' LIMIT 1")
    suspend fun getActiveSession(): SessionEntity?
}

