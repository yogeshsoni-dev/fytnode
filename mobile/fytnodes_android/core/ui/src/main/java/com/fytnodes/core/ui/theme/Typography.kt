package com.fytnodes.core.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val TextXs = 12.sp
val TextSm = 14.sp
val TextBase = 16.sp
val TextLg = 18.sp
val TextXl = 20.sp
val Text2xl = 24.sp
val Text3xl = 30.sp
val Text4xl = 36.sp

val FontNormal = FontWeight.Normal
val FontMedium = FontWeight.Medium
val FontSemiBold = FontWeight.SemiBold
val FontBold = FontWeight.Bold

val FytNodesTypography = Typography(
    displaySmall = TextStyle(fontSize = Text3xl, fontWeight = FontBold, lineHeight = 45.sp),
    headlineMedium = TextStyle(fontSize = Text2xl, fontWeight = FontBold, lineHeight = 36.sp),
    headlineSmall = TextStyle(fontSize = TextXl, fontWeight = FontBold, lineHeight = 30.sp),
    bodyLarge = TextStyle(fontSize = TextBase, fontWeight = FontNormal, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontSize = TextSm, fontWeight = FontNormal, lineHeight = 21.sp),
    labelLarge = TextStyle(fontSize = TextBase, fontWeight = FontSemiBold, lineHeight = 24.sp),
)

