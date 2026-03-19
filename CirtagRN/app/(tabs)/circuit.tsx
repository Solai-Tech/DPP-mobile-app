import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCamera } from '../../src/hooks/useCamera';
import { analyzeAndCreateCircuitBoard } from '../../src/utils/circuitBoardApi';
import { sendProductToRemat } from '../../src/utils/rematApi';
import { CircuitBoardAnalysis } from '../../src/types/CircuitBoard';
import { getProfileSync } from '../../src/hooks/useUserProfile';
import { insertProduct, getProductByRawValue } from '../../src/database/scannedProductDao';
import { s, vs, ms } from '../../src/utils/scale';

// Theme colors
const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMutedLight = 'rgba(44,62,45,0.4)';
const CameraBg = '#2C3E2D';
const Border = 'rgba(44,62,45,0.1)';

export default function CircuitBoardScreen() {
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCamera();
  const cameraRef = useRef<CameraView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // State — store base64 image in ref to avoid re-renders on keystroke
  const [isCameraActive, setIsCameraActive] = useState(false);
  const capturedImageRef = useRef<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [productName, setProductName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSendingToRemat, setIsSendingToRemat] = useState(false);
  const [rematSent, setRematSent] = useState(false);
  const [analysis, setAnalysis] = useState<CircuitBoardAnalysis | null>(null);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      if (photo?.base64) {
        capturedImageRef.current = photo.base64;
        setImageUri(`data:image/jpeg;base64,${photo.base64}`);
        setHasImage(true);
        setIsCameraActive(false);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleAnalyzeAndCreate = async () => {
    if (!capturedImageRef.current) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }
    const capturedImage = capturedImageRef.current;

    const weightNum = parseFloat(weight);
    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

    const trimmedName = productName.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    if (isNaN(widthNum) || widthNum <= 0 || isNaN(heightNum) || heightNum <= 0) {
      Alert.alert('Error', 'Please enter valid dimensions');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeAndCreateCircuitBoard(capturedImage, weightNum, widthNum, heightNum, trimmedName);
      setAnalysis(result);

      // Use server's detected name for history, fall back to user input
      const detectedName = result.productName || trimmedName;

      // Save to local product history (skip if already exists)
      const rawKey = `valuescan-${detectedName.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}-${weightNum}`;
      const existing = await getProductByRawValue(rawKey);
      if (!existing) {
        const co2Details = (result.pcfBreakdown || [])
          .map((b) => `${b.stage}:${b.value.toFixed(2)} Kg CO₂`)
          .join(',');

        // Use server description as clean paragraph (max 55 words)
        const descWords = (result.description || '').split(/\s+/);
        const cleanDesc = descWords.slice(0, 55).join(' ');

        // Clean product ID — don't store raw PCB-prefixed IDs for non-PCB products
        const cleanProductId = result.productDbId
          ? `DPP-${result.productDbId}`
          : result.productId
            ? `DPP-${result.productId}`
            : rawKey;

        await insertProduct({
          rawValue: rawKey,
          displayValue: detectedName,
          format: 'DPP',
          type: 'value_scan',
          productName: detectedName,
          productDescription: cleanDesc,
          imageUrl: imageUri || '',
          productId: cleanProductId,
          price: `${result.price.toFixed(2)} kr`,
          supplier: result.categoryName || '',
          skuId: result.productDbId ? String(result.productDbId) : '',
          weight: `${weightNum} kg`,
          co2Total: `${typeof result.pcf === 'number' ? result.pcf.toFixed(2) : result.pcf} Kg CO₂`,
          co2Details,
          certifications: 'Digital Product Passport',
          datasheetUrl: '',
          documents: '',
          scannedAt: Date.now(),
        });
      }

      Alert.alert('Success', `${detectedName} analyzed and saved!`);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', error?.message || 'Failed to analyze product. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendToRemat = async () => {
    if (!analysis?.productDbId) return;

    // Always read fresh from DB so we get latest saved email
    const freshProfile = getProfileSync();

    if (!freshProfile.email) {
      Alert.alert(
        'Email Required',
        'Please add your email in the Profile tab before sending to ReMat.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSendingToRemat(true);
    try {
      await sendProductToRemat({
        productDbId: analysis.productDbId,
        userName: freshProfile.name,
        userEmail: freshProfile.email,
        userPhone: freshProfile.phone,
        categoryName: analysis.categoryName,
        categoryNumber: analysis.category,
        pricePerKg: analysis.pricePerKg,
      });
      setRematSent(true);
      Alert.alert('Sent!', 'Product details have been sent to ReMat.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to send to ReMat');
    } finally {
      setIsSendingToRemat(false);
    }
  };

  const handleReset = () => {
    capturedImageRef.current = null;
    setImageUri(null);
    setHasImage(false);
    setWeight('');
    setWidth('');
    setHeight('');
    setProductName('');
    setAnalysis(null);
    setRematSent(false);
    setIsCameraActive(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vs(30) + keyboardHeight }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Header */}
        <View style={[styles.pageHeader, { paddingTop: insets.top + vs(12) }]}>
          <Text style={styles.pageTitle}>Value Scanner</Text>
          <Text style={styles.pageSubtitle}>
            {!hasImage
              ? 'Take a photo of your product to get started'
              : !analysis
                ? 'Fill in the details below'
                : 'Digital Product Passport created'}
          </Text>
        </View>

        {/* Step Indicators */}
        {!analysis && (
          <View style={styles.stepsRow}>
            <View style={[styles.stepDot, styles.stepActive]} />
            <View style={[styles.stepLine, hasImage && styles.stepLineActive]} />
            <View style={[styles.stepDot, hasImage && styles.stepActive]} />
          </View>
        )}

        {/* Camera / Image Section */}
        {hasPermission ? (
          <View style={[styles.cameraContainer, analysis && styles.cameraSmall]}>
            {isCameraActive ? (
              <>
                <CameraView ref={cameraRef} style={styles.camera} facing="back" />
                <View style={styles.cameraOverlay}>
                  <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto} activeOpacity={0.8}>
                    <MaterialIcons name="camera" size={ms(32)} color={White} />
                  </TouchableOpacity>
                </View>
              </>
            ) : hasImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri! }} style={styles.imagePreview} contentFit="cover" />
                {/* Retake button overlay — only before analysis */}
                {!analysis && (
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => {
                      capturedImageRef.current = null;
                      setImageUri(null);
                      setHasImage(false);
                      setIsCameraActive(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="replay" size={ms(16)} color={White} />
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.scanPlaceholder}>
                <MaterialIcons name="photo-camera" size={ms(48)} color={SageAccent} />
                <Text style={styles.scanPlaceholderTitle}>Take Photo of Product</Text>
                <Text style={styles.scanPlaceholderSub}>
                  Capture a clear image for analysis
                </Text>
                <TouchableOpacity style={styles.scanStartBtn} onPress={() => setIsCameraActive(true)} activeOpacity={0.85}>
                  <MaterialIcons name="camera-alt" size={ms(18)} color={White} />
                  <Text style={styles.scanStartText}>Open Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.permissionCard}>
            <MaterialIcons name="camera-alt" size={ms(48)} color={SageAccent} />
            <Text style={styles.permTitle}>Camera Access Required</Text>
            <Text style={styles.permSubtitle}>CirTag needs camera access to scan products</Text>
            <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
              <Text style={styles.permButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Form — only show after photo is taken and before analysis is done */}
        {hasImage && !analysis && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={productName}
                onChangeText={setProductName}
                placeholder="e.g. Samsung Galaxy S21"
                placeholderTextColor={TextMutedLight}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputRow, { marginTop: vs(12) }]}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0.5"
                  placeholderTextColor={TextMutedLight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: s(8) }]}>
                <Text style={styles.inputLabel}>Width (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={width}
                  onChangeText={setWidth}
                  placeholder="10"
                  placeholderTextColor={TextMutedLight}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: s(8) }]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="8"
                  placeholderTextColor={TextMutedLight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.buttonDisabled]}
              onPress={handleAnalyzeAndCreate}
              disabled={isAnalyzing}
              activeOpacity={0.85}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator color={White} size="small" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="analytics" size={ms(20)} color={White} />
                  <Text style={styles.analyzeButtonText}>Analyze & Create DPP</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Results */}
        {analysis && (
          <View style={styles.resultsSection}>
            {/* Scan New — top of results for easy access */}
            <TouchableOpacity style={styles.scanNewButton} onPress={handleReset} activeOpacity={0.85}>
              <MaterialIcons name="add-a-photo" size={ms(20)} color={White} />
              <Text style={styles.scanNewText}>Scan Another Product</Text>
            </TouchableOpacity>

            {/* Product Name */}
            {analysis.productName && (
              <Text style={styles.detectedName}>{analysis.productName}</Text>
            )}
            <Text style={styles.sectionTitle}>Analysis Results</Text>

            <View style={styles.resultCard}>
              {/* Category Number (1 or 2) */}
              {analysis.category != null && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Category</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{analysis.category}</Text>
                  </View>
                </View>
              )}

              {/* Category Name — only for non-electronics (no scrap price) */}
              {analysis.categoryName && !(analysis.pricePerKg && analysis.pricePerKg > 0) && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Type</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{analysis.categoryName}</Text>
                  </View>
                </View>
              )}

              {/* Material — for all products when available */}
              {analysis.material && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Material</Text>
                  <Text style={styles.materialText}>{analysis.material}</Text>
                </View>
              )}

              {/* Price per kg — for all products when available */}
              {analysis.pricePerKg != null && analysis.pricePerKg > 0 && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Price/kg</Text>
                  <Text style={styles.pricePerKgText}>{analysis.pricePerKg} kr/kg</Text>
                </View>
              )}

              {/* Weight */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Weight</Text>
                <Text style={styles.weightText}>{analysis.weight || weight} kg</Text>
              </View>

              {/* Total Price */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Estimated Value</Text>
                <Text style={styles.priceText}>{analysis.price.toFixed(2)} kr</Text>
              </View>

              {/* PCF */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Carbon Footprint</Text>
                <Text style={styles.pcfText}>{typeof analysis.pcf === 'number' ? analysis.pcf.toFixed(2) : analysis.pcf} kg CO₂</Text>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.resultLabel}>Description</Text>
                <Text style={styles.descriptionText}>{analysis.description}</Text>
              </View>

              {/* Components / Key Features — for all products */}
              {analysis.components.length > 0 && (
                <View style={styles.componentsContainer}>
                  <Text style={styles.resultLabel}>Key Features</Text>
                  <View style={styles.componentsList}>
                    {analysis.components.map((comp, idx) => (
                      <View key={idx} style={styles.componentChip}>
                        <Text style={styles.componentText}>{comp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* PCF Breakdown */}
              {analysis.pcfBreakdown && analysis.pcfBreakdown.length > 0 && (
                <View style={styles.pcfBreakdown}>
                  <Text style={styles.resultLabel}>CO₂ Breakdown</Text>
                  {analysis.pcfBreakdown.map((item, idx) => (
                    <View key={idx} style={styles.pcfRow}>
                      <Text style={styles.pcfStage}>{item.stage}</Text>
                      <Text style={[styles.pcfValue, item.value < 0 && styles.pcfCredit]}>
                        {item.value > 0 ? '+' : ''}{item.value.toFixed(2)} kg
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* DPP Created Info */}
            {analysis.productDbId && (
              <View style={styles.dppCreated}>
                <MaterialIcons name="check-circle" size={ms(24)} color={SageAccent} />
                <Text style={styles.dppCreatedText}>DPP Created: #{analysis.productDbId}</Text>
              </View>
            )}

            {/* Send to ReMat Button */}
            {analysis.productDbId && !rematSent && (
              <TouchableOpacity
                style={[styles.rematButton, isSendingToRemat && styles.buttonDisabled]}
                onPress={handleSendToRemat}
                disabled={isSendingToRemat}
                activeOpacity={0.85}
              >
                {isSendingToRemat ? (
                  <>
                    <ActivityIndicator color={White} size="small" />
                    <Text style={styles.rematButtonText}>Sending...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="send" size={ms(20)} color={White} />
                    <Text style={styles.rematButtonText}>Send to ReMat</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {rematSent && (
              <View style={styles.rematSentBadge}>
                <MaterialIcons name="check-circle" size={ms(20)} color={SageAccent} />
                <Text style={styles.rematSentText}>Sent to ReMat</Text>
              </View>
            )}

          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CreamBg },
  pageHeader: { paddingHorizontal: s(20), marginBottom: vs(12) },
  pageTitle: { fontSize: ms(26), fontWeight: '800', color: TextDark },
  pageSubtitle: { fontSize: ms(14), color: TextGray, marginTop: vs(4) },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: vs(16), paddingHorizontal: s(60) },
  stepDot: { width: s(10), height: s(10), borderRadius: s(5), backgroundColor: Border },
  stepActive: { backgroundColor: SageAccent },
  stepLine: { flex: 1, height: 2, backgroundColor: Border, marginHorizontal: s(8) },
  stepLineActive: { backgroundColor: SageAccent },
  cameraContainer: { marginHorizontal: s(20), borderRadius: s(16), overflow: 'hidden', height: vs(280), backgroundColor: CameraBg, borderWidth: 2, borderColor: SageAccent },
  cameraSmall: { height: vs(160) },
  camera: { flex: 1 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: vs(20) },
  captureButton: { width: s(64), height: s(64), borderRadius: s(32), backgroundColor: SageAccent, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: White },
  imagePreviewContainer: { flex: 1, position: 'relative' },
  imagePreview: { flex: 1 },
  retakeButton: { position: 'absolute', bottom: vs(10), right: s(10), backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: s(10), paddingHorizontal: s(12), paddingVertical: vs(6), flexDirection: 'row', alignItems: 'center', gap: s(4) },
  retakeText: { color: White, fontWeight: '600', fontSize: ms(12) },
  scanPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: s(20) },
  scanPlaceholderTitle: { fontSize: ms(16), fontWeight: '700', color: TextDark, marginTop: vs(12) },
  scanPlaceholderSub: { fontSize: ms(12), color: TextGray, marginTop: vs(6), textAlign: 'center' },
  scanStartBtn: { marginTop: vs(14), backgroundColor: SageAccent, paddingHorizontal: s(18), paddingVertical: vs(10), borderRadius: s(12), flexDirection: 'row', alignItems: 'center', gap: s(6) },
  scanStartText: { color: White, fontWeight: '700', fontSize: ms(12) },
  permissionCard: { backgroundColor: White, borderRadius: s(16), marginHorizontal: s(20), padding: s(32), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  permTitle: { fontSize: ms(16), fontWeight: '700', color: TextDark, marginTop: vs(16) },
  permSubtitle: { fontSize: ms(13), color: TextGray, textAlign: 'center', marginTop: vs(6) },
  permButton: { backgroundColor: SageAccent, borderRadius: s(12), paddingVertical: vs(12), paddingHorizontal: s(32), marginTop: vs(20) },
  permButtonText: { color: White, fontWeight: '700', fontSize: ms(14) },
  formSection: { marginTop: vs(20), paddingHorizontal: s(20) },
  sectionTitle: { fontSize: ms(18), fontWeight: '800', color: TextDark, marginBottom: vs(12) },
  inputRow: { flexDirection: 'row', marginBottom: vs(12) },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: ms(12), fontWeight: '600', color: TextGray, marginBottom: vs(6) },
  input: { backgroundColor: White, borderRadius: s(12), paddingHorizontal: s(14), paddingVertical: vs(12), fontSize: ms(15), color: TextDark, borderWidth: 1, borderColor: Border },
  analyzeButton: { backgroundColor: SageAccent, borderRadius: s(14), paddingVertical: vs(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: s(8), marginTop: vs(8) },
  buttonDisabled: { opacity: 0.6 },
  analyzeButtonText: { color: White, fontWeight: '700', fontSize: ms(15) },
  resultsSection: { marginTop: vs(24), paddingHorizontal: s(20) },
  detectedName: { fontSize: ms(20), fontWeight: '800', color: SageAccent, marginBottom: vs(8) },
  resultCard: { backgroundColor: White, borderRadius: s(16), padding: s(16), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: vs(10), borderBottomWidth: 1, borderBottomColor: Border },
  resultLabel: { fontSize: ms(13), fontWeight: '600', color: TextGray },
  categoryBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: s(12), paddingVertical: vs(4), borderRadius: s(12) },
  categoryText: { fontSize: ms(12), fontWeight: '700', color: SageAccent },
  materialText: { fontSize: ms(14), fontWeight: '600', color: TextDark, flex: 1, textAlign: 'right', marginLeft: s(12) },
  pricePerKgText: { fontSize: ms(14), fontWeight: '700', color: SageAccent },
  weightText: { fontSize: ms(14), fontWeight: '600', color: TextDark },
  priceText: { fontSize: ms(18), fontWeight: '800', color: TextDark },
  pcfText: { fontSize: ms(14), fontWeight: '700', color: '#4A9F4A' },
  descriptionContainer: { paddingVertical: vs(12), borderBottomWidth: 1, borderBottomColor: Border },
  descriptionText: { fontSize: ms(13), color: TextDark, marginTop: vs(6), lineHeight: ms(18) },
  componentsContainer: { paddingVertical: vs(12), borderBottomWidth: 1, borderBottomColor: Border },
  componentsList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: vs(8), gap: s(6) },
  componentChip: { backgroundColor: '#F0F4F0', paddingHorizontal: s(10), paddingVertical: vs(4), borderRadius: s(8) },
  componentText: { fontSize: ms(11), color: TextDark, fontWeight: '500' },
  pcfBreakdown: { paddingTop: vs(12) },
  pcfRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: vs(6) },
  pcfStage: { fontSize: ms(12), color: TextGray },
  pcfValue: { fontSize: ms(12), fontWeight: '600', color: TextDark },
  pcfCredit: { color: '#4A9F4A' },
  dppCreated: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: vs(16), gap: s(8) },
  dppCreatedText: { fontSize: ms(14), fontWeight: '600', color: SageAccent },
  rematButton: { backgroundColor: '#2E6B8A', borderRadius: s(14), paddingVertical: vs(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: s(8), marginTop: vs(16) },
  rematButtonText: { color: White, fontWeight: '700', fontSize: ms(15) },
  rematSentBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(8), marginTop: vs(16), paddingVertical: vs(12), backgroundColor: '#E8F5E9', borderRadius: s(14) },
  rematSentText: { fontSize: ms(14), fontWeight: '600', color: SageAccent },
  scanNewButton: { backgroundColor: SageAccent, borderRadius: s(14), paddingVertical: vs(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: s(8), marginTop: vs(12) },
  scanNewText: { color: White, fontWeight: '700', fontSize: ms(15) },
});
