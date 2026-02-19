package client.sdk.myapplication.cirtag.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ConfirmationNumber
import androidx.compose.material.icons.filled.Factory
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Nature
import androidx.compose.material.icons.filled.Recycling
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.SupportAgent
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import client.sdk.myapplication.cirtag.data.ScannedProduct
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreen
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenLight
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenMedium
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenPale
import client.sdk.myapplication.cirtag.ui.theme.Gray100
import client.sdk.myapplication.cirtag.ui.theme.Gray400
import client.sdk.myapplication.cirtag.ui.theme.OffWhite
import client.sdk.myapplication.cirtag.ui.theme.TextDark
import client.sdk.myapplication.cirtag.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    product: ScannedProduct,
    onBack: () -> Unit,
    onGetSupport: () -> Unit = {},
    onRaiseTicket: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
    ) {
        // Top Bar
        TopAppBar(
            title = {
                Column {
                    Text(
                        "Product Passport",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                    Text(
                        "Scanned just now",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = TextDark
                    )
                }
            },
            actions = {
                // Verified Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(CirtagGreenPale)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Filled.CheckCircle,
                            contentDescription = null,
                            tint = CirtagGreen,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            "Verified",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = CirtagGreen
                        )
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = OffWhite
            )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
        ) {
            // Hero Card
            HeroCard(product = product)

            Spacer(modifier = Modifier.height(20.dp))

            // Product Lifecycle
            Text(
                text = "Product Lifecycle",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            Spacer(modifier = Modifier.height(12.dp))
            LifecycleStepper()

            Spacer(modifier = Modifier.height(24.dp))

            // Emission Breakdown
            Text(
                text = "Emission Breakdown",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            Spacer(modifier = Modifier.height(12.dp))
            EmissionBreakdownCard(product = product)

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ActionButton(
                    icon = Icons.Filled.SupportAgent,
                    label = "Get Support",
                    onClick = onGetSupport,
                    isPrimary = true,
                    modifier = Modifier.weight(1f)
                )
                ActionButton(
                    icon = Icons.Filled.ConfirmationNumber,
                    label = "Raise Ticket",
                    onClick = onRaiseTicket,
                    modifier = Modifier.weight(1f)
                )
                ActionButton(
                    icon = Icons.Filled.Share,
                    label = "Share DPP",
                    onClick = { },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun HeroCard(product: ScannedProduct) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            CirtagGreen,
                            CirtagGreenLight
                        )
                    )
                )
                .padding(20.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.Top) {
                    // Recycle Icon
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Filled.Recycling,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = product.productName.ifEmpty { "Product" },
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "${product.supplier.ifEmpty { "Unknown Supplier" }} · Sweden",
                            fontSize = 13.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // DPP ID Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White.copy(alpha = 0.2f))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = product.productId.ifEmpty { "DPP-${product.id}" },
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Stats Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val co2Value = product.co2Total.replace(Regex("[^\\d.]"), "").take(5)
                    HeroStatBox(
                        value = if (co2Value.isNotEmpty()) co2Value else "0.4",
                        unit = "t",
                        label = "Total CO₂",
                        sublabel = "Low",
                        modifier = Modifier.weight(1f)
                    )
                    HeroStatBox(
                        value = "94",
                        unit = "%",
                        label = "Recyclability",
                        sublabel = "High",
                        modifier = Modifier.weight(1f)
                    )
                    HeroStatBox(
                        value = "#204",
                        unit = "",
                        label = "Batch",
                        sublabel = "Active",
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
private fun HeroStatBox(
    value: String,
    unit: String,
    label: String,
    sublabel: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White.copy(alpha = 0.15f))
            .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
            .padding(12.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = value,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                if (unit.isNotEmpty()) {
                    Text(
                        text = unit,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 2.dp)
                    )
                }
            }
            Text(
                text = label,
                fontSize = 10.sp,
                color = Color.White.copy(alpha = 0.7f)
            )
            Box(
                modifier = Modifier
                    .padding(top = 4.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color.White.copy(alpha = 0.2f))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = sublabel,
                    fontSize = 9.sp,
                    color = Color.White,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
private fun LifecycleStepper() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            LifecycleStep(icon = Icons.Filled.Nature, label = "Raw Mat.", isCompleted = true)
            StepConnector(isCompleted = true)
            LifecycleStep(icon = Icons.Filled.Factory, label = "Mfg.", isCompleted = true)
            StepConnector(isCompleted = true)
            LifecycleStep(icon = Icons.Filled.LocalShipping, label = "Transit", isCompleted = true, isCurrent = true)
            StepConnector(isCompleted = false)
            LifecycleStep(icon = Icons.Filled.ShoppingCart, label = "Retail", isCompleted = false)
            StepConnector(isCompleted = false)
            LifecycleStep(icon = Icons.Filled.Home, label = "EOL", isCompleted = false)
        }
    }
}

@Composable
private fun LifecycleStep(
    icon: ImageVector,
    label: String,
    isCompleted: Boolean,
    isCurrent: Boolean = false
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(
                    when {
                        isCurrent -> CirtagGreen
                        isCompleted -> CirtagGreenPale
                        else -> Gray100
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = when {
                    isCurrent -> Color.White
                    isCompleted -> CirtagGreen
                    else -> Gray400
                },
                modifier = Modifier.size(18.dp)
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 9.sp,
            color = if (isCompleted || isCurrent) TextDark else TextSecondary,
            fontWeight = if (isCurrent) FontWeight.SemiBold else FontWeight.Normal
        )
    }
}

@Composable
private fun StepConnector(isCompleted: Boolean) {
    Box(
        modifier = Modifier
            .width(20.dp)
            .height(2.dp)
            .background(if (isCompleted) CirtagGreen else Gray100)
    )
}

@Composable
private fun EmissionBreakdownCard(product: ScannedProduct) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Parse CO2 details or use mock data
            val emissions = if (product.co2Details.isNotEmpty()) {
                product.co2Details.split(",").mapNotNull { item ->
                    val parts = item.split(":")
                    if (parts.size == 2) {
                        val value = parts[1].replace(Regex("[^\\d.]"), "").toFloatOrNull() ?: 0f
                        parts[0].trim() to value
                    } else null
                }
            } else {
                listOf(
                    "Raw Material" to 0.18f,
                    "Manufacturing" to 0.12f,
                    "Transport" to 0.10f
                )
            }

            val maxValue = emissions.maxOfOrNull { it.second } ?: 1f

            emissions.forEach { (label, value) ->
                EmissionRow(
                    icon = when {
                        label.contains("Raw", ignoreCase = true) -> "\uD83C\uDF3F"
                        label.contains("Manuf", ignoreCase = true) -> "\uD83C\uDFED"
                        label.contains("Transport", ignoreCase = true) || label.contains("Ship", ignoreCase = true) -> "\uD83D\uDE9A"
                        else -> "\uD83D\uDCCA"
                    },
                    label = label,
                    value = value,
                    maxValue = maxValue
                )
                if (emissions.last() != (label to value)) {
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
private fun EmissionRow(
    icon: String,
    label: String,
    value: Float,
    maxValue: Float
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = icon, fontSize = 16.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = label,
                    fontSize = 14.sp,
                    color = TextDark
                )
            }
            Text(
                text = "${String.format("%.2f", value)}t",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextDark
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        LinearProgressIndicator(
            progress = { value / maxValue },
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp)),
            color = CirtagGreen,
            trackColor = CirtagGreenPale,
            strokeCap = StrokeCap.Round
        )
    }
}

@Composable
private fun ActionButton(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isPrimary: Boolean = false
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isPrimary) CirtagGreen else Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isPrimary) 0.dp else 2.dp),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isPrimary) Color.White else CirtagGreen,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = if (isPrimary) Color.White else TextDark,
                textAlign = TextAlign.Center
            )
        }
    }
}
