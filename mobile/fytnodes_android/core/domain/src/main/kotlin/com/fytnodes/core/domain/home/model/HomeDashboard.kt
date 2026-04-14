package com.fytnodes.core.domain.home.model

data class HomeDashboard(
    val welcomeName: String,
    val stats: List<HomeStat>,
)

data class HomeStat(
    val key: String,
    val label: String,
    val value: String,
    val unit: String,
    val goal: String,
    val progress: Float,
)

