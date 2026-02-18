package client.sdk.myapplication.cirtag.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "scanned_products")
data class ScannedProduct(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val rawValue: String,
    val displayValue: String,
    val format: String,
    val type: String,
    val productName: String = "",
    val productDescription: String = "",
    val imageUrl: String = "",
    val productId: String = "",
    val price: String = "",
    val supplier: String = "",
    val skuId: String = "",
    val weight: String = "",
    val co2Total: String = "",
    val co2Details: String = "",       // "Raw Materials:3.15,Shipping & Transport:3.18,Manufacturing:33.81"
    val certifications: String = "",   // "ISO 14001,BPA Free,FCC Approved"
    val datasheetUrl: String = "",
    val scannedAt: Long = System.currentTimeMillis()
)
