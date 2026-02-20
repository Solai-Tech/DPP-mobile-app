package client.sdk.myapplication.cirtag.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ScannedProductDao {
    @Query("SELECT * FROM scanned_products ORDER BY scannedAt DESC")
    fun getAllProducts(): Flow<List<ScannedProduct>>

    @Query("SELECT * FROM scanned_products WHERE id = :id")
    suspend fun getProductById(id: Long): ScannedProduct?

    @Insert
    suspend fun insertProduct(product: ScannedProduct): Long

    @Update
    suspend fun updateProduct(product: ScannedProduct)

    @Delete
    suspend fun deleteProduct(product: ScannedProduct)

    @Query("DELETE FROM scanned_products")
    suspend fun deleteAllProducts()
}
