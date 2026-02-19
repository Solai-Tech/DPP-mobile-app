package client.sdk.myapplication.cirtag.scanner

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import client.sdk.myapplication.cirtag.data.ScannedProduct
import client.sdk.myapplication.cirtag.ui.theme.AmberStatus
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreen
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenLight
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenMedium
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenPale
import client.sdk.myapplication.cirtag.ui.theme.Gray100
import client.sdk.myapplication.cirtag.ui.theme.Gray400
import client.sdk.myapplication.cirtag.ui.theme.OffWhite
import client.sdk.myapplication.cirtag.ui.theme.RedStatus
import client.sdk.myapplication.cirtag.ui.theme.TextDark
import client.sdk.myapplication.cirtag.ui.theme.TextSecondary
import com.google.mlkit.vision.barcode.common.Barcode
import java.util.concurrent.Executors

@Composable
fun ScannerScreen(
    isLoading: Boolean,
    products: List<ScannedProduct>,
    onBarcodeScanned: (Barcode) -> Unit,
    onProductClick: (ScannedProduct) -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
                    PackageManager.PERMISSION_GRANTED
        )
    }

    var selectedScanType by remember { mutableIntStateOf(0) } // 0 = QR Code, 1 = Barcode

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasCameraPermission = granted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Text(
                text = "Scan Product",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            Text(
                text = "Choose scan type or tap a saved product",
                fontSize = 14.sp,
                color = TextSecondary
            )
        }

        // Scan Type Selector
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ScanTypeCard(
                icon = Icons.Filled.QrCode,
                title = "Scan QR Code",
                subtitle = "Point at QR label",
                isSelected = selectedScanType == 0,
                onClick = { selectedScanType = 0 },
                modifier = Modifier.weight(1f)
            )
            ScanTypeCard(
                icon = Icons.Filled.QrCodeScanner,
                title = "Scan Barcode",
                subtitle = "Point at barcode",
                isSelected = selectedScanType == 1,
                onClick = { selectedScanType = 1 },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Camera Preview
        if (hasCameraPermission) {
            CameraPreviewSection(
                isLoading = isLoading,
                onBarcodeScanned = onBarcodeScanned,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .padding(horizontal = 20.dp)
            )
        } else {
            PermissionRequestCard(
                onRequestPermission = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .padding(horizontal = 20.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Saved Products Section
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Saved Products",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            Text(
                text = "See all",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = CirtagGreen,
                modifier = Modifier.clickable { }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Products List
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(products) { product ->
                SavedProductCard(
                    product = product,
                    onClick = { onProductClick(product) }
                )
            }

            if (products.isEmpty()) {
                item {
                    EmptyProductsCard()
                }
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun ScanTypeCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clickable(onClick = onClick)
            .then(
                if (isSelected) Modifier.border(
                    2.dp,
                    CirtagGreen,
                    RoundedCornerShape(16.dp)
                ) else Modifier
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) CirtagGreenPale else Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 0.dp else 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = if (isSelected) CirtagGreen else Gray400,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isSelected) CirtagGreen else TextDark
            )
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = TextSecondary
            )
        }
    }
}

@Composable
private fun CameraPreviewSection(
    isLoading: Boolean,
    onBarcodeScanned: (Barcode) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scanFlag = remember { ScanFlag() }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                scanFlag.canScan = true
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    LaunchedEffect(Unit) { scanFlag.canScan = true }
    LaunchedEffect(isLoading) { if (isLoading) scanFlag.canScan = false }

    Card(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Black)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            val cameraExecutor = remember { Executors.newSingleThreadExecutor() }
            DisposableEffect(Unit) { onDispose { cameraExecutor.shutdown() } }

            // Camera preview
            AndroidView(
                factory = { ctx ->
                    val previewView = PreviewView(ctx)
                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                    cameraProviderFuture.addListener({
                        val cameraProvider = cameraProviderFuture.get()
                        val preview = Preview.Builder().build().also {
                            it.surfaceProvider = previewView.surfaceProvider
                        }
                        val imageAnalysis = ImageAnalysis.Builder()
                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                            .build()
                            .also { analysis ->
                                analysis.setAnalyzer(cameraExecutor, QrAnalyzer { barcode ->
                                    if (scanFlag.canScan) {
                                        scanFlag.canScan = false
                                        onBarcodeScanned(barcode)
                                    }
                                })
                            }
                        try {
                            cameraProvider.unbindAll()
                            cameraProvider.bindToLifecycle(
                                lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA,
                                preview, imageAnalysis
                            )
                        } catch (e: Exception) {
                            Log.e("ScannerScreen", "Camera bind failed", e)
                        }
                    }, ContextCompat.getMainExecutor(ctx))
                    previewView
                },
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(20.dp))
            )

            // Scan frame overlay
            if (!isLoading) {
                val infiniteTransition = rememberInfiniteTransition(label = "scan")
                val scanLineOffset by infiniteTransition.animateFloat(
                    initialValue = 0f,
                    targetValue = 1f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(2000, easing = LinearEasing),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "scanLine"
                )

                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Box(modifier = Modifier.size(160.dp)) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val cornerLen = 24.dp.toPx()
                            val strokeW = 3.dp.toPx()
                            val color = CirtagGreen

                            // Top-left
                            drawLine(color, Offset(0f, cornerLen), Offset.Zero, strokeW, StrokeCap.Round)
                            drawLine(color, Offset(cornerLen, 0f), Offset.Zero, strokeW, StrokeCap.Round)

                            // Top-right
                            drawLine(color, Offset(size.width, 0f), Offset(size.width - cornerLen, 0f), strokeW, StrokeCap.Round)
                            drawLine(color, Offset(size.width, 0f), Offset(size.width, cornerLen), strokeW, StrokeCap.Round)

                            // Bottom-left
                            drawLine(color, Offset(0f, size.height), Offset(0f, size.height - cornerLen), strokeW, StrokeCap.Round)
                            drawLine(color, Offset(0f, size.height), Offset(cornerLen, size.height), strokeW, StrokeCap.Round)

                            // Bottom-right
                            drawLine(color, Offset(size.width, size.height), Offset(size.width - cornerLen, size.height), strokeW, StrokeCap.Round)
                            drawLine(color, Offset(size.width, size.height), Offset(size.width, size.height - cornerLen), strokeW, StrokeCap.Round)

                            // Animated scan line
                            val lineY = scanLineOffset * size.height
                            drawLine(
                                brush = Brush.horizontalGradient(
                                    colors = listOf(Color.Transparent, CirtagGreen, CirtagGreen, Color.Transparent)
                                ),
                                start = Offset(8f, lineY),
                                end = Offset(size.width - 8f, lineY),
                                strokeWidth = 2.dp.toPx(),
                                cap = StrokeCap.Round
                            )
                        }
                    }
                }

                // Instruction text
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(bottom = 12.dp),
                    contentAlignment = Alignment.BottomCenter
                ) {
                    Text(
                        text = "Align within frame to scan",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.8f),
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Loading overlay
            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.7f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(
                            color = CirtagGreenLight,
                            strokeWidth = 3.dp,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Fetching Product...",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PermissionRequestCard(
    onRequestPermission: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Gray100)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                Icons.Filled.CameraAlt,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = CirtagGreen
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Camera Access Required",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Grant permission to scan products",
                fontSize = 13.sp,
                color = TextSecondary,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onRequestPermission,
                colors = ButtonDefaults.buttonColors(containerColor = CirtagGreen),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Grant Permission", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun SavedProductCard(
    product: ScannedProduct,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product Icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(CirtagGreenPale),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Inventory2,
                    contentDescription = null,
                    tint = CirtagGreen,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Product Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.productName.ifEmpty { product.displayValue.ifEmpty { product.rawValue.take(30) } },
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextDark,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = product.productId.ifEmpty { product.rawValue.take(20) },
                    fontSize = 12.sp,
                    color = CirtagGreen,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.supplier.ifEmpty { "Unknown" },
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                    Text(
                        text = " · ",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                    // CO2 Status Badge
                    val co2Value = product.co2Total.replace(Regex("[^\\d.]"), "").toFloatOrNull() ?: 0f
                    val (statusText, statusColor) = when {
                        co2Value < 50 -> "Low CO₂" to CirtagGreen
                        co2Value < 100 -> "Medium" to AmberStatus
                        else -> "Review" to RedStatus
                    }
                    Text(
                        text = statusText,
                        fontSize = 11.sp,
                        color = statusColor,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // CO2 Value
            Column(
                horizontalAlignment = Alignment.End
            ) {
                val co2Display = product.co2Total.replace(Regex("[^\\d.]"), "").take(5)
                Text(
                    text = if (co2Display.isNotEmpty()) "${co2Display}t" else "--",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )
                Text(
                    text = "CO₂",
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            }
        }
    }
}

@Composable
private fun EmptyProductsCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Filled.QrCodeScanner,
                contentDescription = null,
                tint = Gray400,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "No Products Scanned Yet",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextDark
            )
            Text(
                text = "Scan a QR code to get started",
                fontSize = 13.sp,
                color = TextSecondary
            )
        }
    }
}

private class ScanFlag {
    @Volatile
    var canScan = true
}
