import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const DPP_API_URL: string = extra.dppApiUrl ?? 'https://solai.se/dppx/api';
const CLIENT_ID: string = extra.dppClientId ?? '';
const CLIENT_SECRET: string = extra.dppClientSecret ?? '';

export interface SendToRematParams {
  productDbId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  categoryName?: string;
  categoryNumber?: string | number;
  pricePerKg?: number;
}

export async function sendProductToRemat(params: SendToRematParams): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${DPP_API_URL}/v1/product/send-to-remat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-ID': CLIENT_ID,
      'X-Client-Secret': CLIENT_SECRET,
    },
    body: JSON.stringify({
      product_db_id: params.productDbId,
      user_name: params.userName,
      user_email: params.userEmail,
      user_phone: params.userPhone,
      category_name: params.categoryName || '',
      category_number: params.categoryNumber || '',
      price_per_kg: params.pricePerKg || '',
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to send to ReMat');
  }

  return { success: true, message: result.message };
}
