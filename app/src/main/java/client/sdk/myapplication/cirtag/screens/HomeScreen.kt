package client.sdk.myapplication.cirtag.screens

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Loop
import androidx.compose.material.icons.filled.Recycling
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import client.sdk.myapplication.cirtag.ui.theme.CirtagDarkBg
import client.sdk.myapplication.cirtag.ui.theme.CirtagDarkCard
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreen
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenLight
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenMedium

@Composable
fun HomeScreen(
    onProductsHistoryClick: () -> Unit = {},
    onLifeCycleClick: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        CirtagDarkBg,
                        Color(0xFF0A2A0D),
                        Color(0xFF0F3512),
                        Color(0xFF0A2A0D),
                        CirtagDarkBg
                    )
                )
            )
    ) {
        // Grid pattern overlay
        Canvas(modifier = Modifier.fillMaxSize()) {
            val gridSize = 35.dp.toPx()
            val gridColor = Color(0xFF16A34A).copy(alpha = 0.08f)

            var x = 0f
            while (x < size.width) {
                drawLine(
                    color = gridColor,
                    start = Offset(x, 0f),
                    end = Offset(x, size.height),
                    strokeWidth = 1f
                )
                x += gridSize
            }

            var y = 0f
            while (y < size.height) {
                drawLine(
                    color = gridColor,
                    start = Offset(0f, y),
                    end = Offset(size.width, y),
                    strokeWidth = 1f
                )
                y += gridSize
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .padding(top = 16.dp, bottom = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top bar with time and Live Tracking
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "9:41 AM",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White
                )
                LiveTrackingPill()
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Logo
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .clip(RoundedCornerShape(22.dp))
                    .background(CirtagGreen),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Recycling,
                    contentDescription = "CirTag Logo",
                    tint = Color.White,
                    modifier = Modifier.size(52.dp)
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // CIRTAG text
            Text(
                buildAnnotatedString {
                    withStyle(style = SpanStyle(color = Color.White)) {
                        append("CIRT")
                    }
                    withStyle(style = SpanStyle(color = CirtagGreenLight)) {
                        append("AG")
                    }
                },
                fontSize = 46.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 3.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Tagline
            Text(
                text = "Circular Economy Platform.",
                fontSize = 15.sp,
                color = Color.White.copy(alpha = 0.8f),
                fontWeight = FontWeight.Normal
            )
            Text(
                text = "Measure. Trace. Act.",
                fontSize = 15.sp,
                color = CirtagGreenMedium,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(36.dp))

            // Welcome Card
            WelcomeCard()

            Spacer(modifier = Modifier.height(16.dp))

            // Stats Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    value = "4.2",
                    unit = "t",
                    label = "Monthly CO₂",
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    value = "48",
                    unit = "",
                    label = "Products",
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Quick Action Icons Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Products History
                Card(
                    onClick = onProductsHistoryClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(80.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = CirtagDarkCard)
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.History,
                            contentDescription = "Products History",
                            tint = CirtagGreen,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Products History",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                }

                // Product Life Cycle
                Card(
                    onClick = onLifeCycleClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(80.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = CirtagDarkCard)
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Loop,
                            contentDescription = "Product Life Cycle",
                            tint = CirtagGreenLight,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Product Life Cycle",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun LiveTrackingPill() {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(CirtagGreen.copy(alpha = 0.25f))
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(CirtagGreenLight.copy(alpha = alpha))
            )
            Text(
                text = "Live Tracking",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = CirtagGreenLight
            )
        }
    }
}

@Composable
private fun WelcomeCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = CirtagDarkCard)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Welcome to CirTag",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Track your products sustainably",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.7f)
                )
            }

            // Logo Icon
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(CirtagGreen),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Recycling,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(28.dp)
                )
            }
        }
    }
}

@Composable
private fun StatCard(
    value: String,
    unit: String,
    label: String,
    modifier: Modifier = Modifier,
    valueColor: Color = Color.White
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = CirtagDarkCard)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 18.dp, horizontal = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                verticalAlignment = Alignment.Bottom
            ) {
                Text(
                    text = value,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Bold,
                    color = valueColor
                )
                if (unit.isNotEmpty()) {
                    Text(
                        text = unit,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = valueColor,
                        modifier = Modifier.padding(bottom = 3.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                fontSize = 11.sp,
                color = Color.White.copy(alpha = 0.5f),
                textAlign = TextAlign.Center
            )
        }
    }
}
