import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCamera } from '../../src/hooks/useCamera';
import { analyzeAndCreateCircuitBoard } from '../../src/utils/circuitBoardApi';
import { CircuitBoardAnalysis } from '../../src/types/CircuitBoard';
import { s, vs, ms } from '../../src/utils/scale';

// Theme colors
const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const SageLight = '#7BAF7B';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMutedLight = 'rgba(44,62,45,0.4)';
const CameraBg = '#2C3E2D';
const Border = 'rgba(44,62,45,0.1)';
const ErrorRed = '#D9534F';

export default function CircuitBoardScreen() {
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCamera();
  const cameraRef = useRef<CameraView>(null);

  // State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CircuitBoardAnalysis | null>(null);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (photo?.base64) {
        setCapturedImage(photo.base64);
        setIsCameraActive(false);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setIsCameraActive(true);
  };

  const handleAnalyzeAndCreate = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    const weightNum = parseFloat(weight);
    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

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
      const result = await analyzeAndCreateCircuitBoard(
        capturedImage,
        weightNum,
        widthNum,
        heightNum
      );
      setAnalysis(result);
      Alert.alert('Success', `DPP Created!\nID: ${result.productId}`);
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze circuit board. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setWeight('');
    setWidth('');
    setHeight('');
    setAnalysis(null);
    setIsCameraActive(false);
  };

  const handleOpenProductUrl = () => {
    if (analysis?.productUrl) {
      // Build full URL - adjust host for your DPP server
      const fullUrl = `https://solai.se/dpp/product/${analysis.productDbId}/`;
      Linking.openURL(fullUrl).catch(() => {
        Alert.alert('Info', `Product URL: ${analysis.productUrl}`);
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vs(30) }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.pageHeader, { paddingTop: insets.top + vs(12) }]}>
          <Text style={styles.pageTitle}>Circuit Board Scanner</Text>
          <Text style={styles.pageSubtitle}>
            Analyze PCB and generate Digital Product Passport
          </Text>
        </View>

        {/* Camera / Image Section */}
        {hasPermission ? (
          <View style={styles.cameraContainer}>
            {isCameraActive ? (
              <>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                />
                <View style={styles.cameraOverlay}>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="camera" size={ms(32)} color={White} />
                  </TouchableOpacity>
                </View>
              </>
            ) : capturedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
                  style={styles.imagePreview}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetakePhoto}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="refresh" size={ms(20)} color={White} />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.scanPlaceholder}>
                <MaterialIcons name="developer-board" size={ms(48)} color={SageAccent} />
                <Text style={styles.scanPlaceholderTitle}>Take Photo of Circuit Board</Text>
                <Text style={styles.scanPlaceholderSub}>
                  Capture a clear image of the PCB for analysis
                </Text>
                <TouchableOpacity
                  style={styles.scanStartBtn}
                  onPress={() => setIsCameraActive(true)}
                  activeOpacity={0.85}
                >
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
            <Text style={styles.permSubtitle}>
              CirTag needs camera access to capture circuit board images
            </Text>
            <TouchableOpacity
              style={styles.permButton}
              onPress={requestPermission}
            >
              <Text style={styles.permButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Board Specifications</Text>

          <View style={styles.inputRow}>
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

          {/* Analyze & Create DPP Button (single action) */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!capturedImage || isAnalyzing) && styles.buttonDisabled,
            ]}
            onPress={handleAnalyzeAndCreate}
            disabled={!capturedImage || isAnalyzing}
            activeOpacity={0.85}
          >
            {isAnalyzing ? (
              <ActivityIndicator color={White} size="small" />
            ) : (
              <>
                <MaterialIcons name="analytics" size={ms(20)} color={White} />
                <Text style={styles.analyzeButtonText}>Analyze & Create DPP</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Analysis Results */}
        {analysis && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>

            <View style={styles.resultCard}>
              {/* Material */}
              {analysis.material && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Material</Text>
                  <Text style={styles.materialText}>{analysis.material}</Text>
                </View>
              )}

              {/* Category */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Category</Text>
                <View style={[
                  styles.categoryBadge,
                  analysis.category === 2 && styles.categoryBadge2
                ]}>
                  <Text style={styles.categoryText}>
                    {typeof analysis.category === 'string' ? analysis.category : `Category ${analysis.category}`}
                  </Text>
                </View>
              </View>

              {/* Price per kg */}
              {analysis.pricePerKg && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Price/kg</Text>
                  <Text style={styles.pricePerKgText}>{analysis.pricePerKg} kr/kg</Text>
                </View>
              )}

              {/* Weight */}
              {analysis.weight && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Weight</Text>
                  <Text style={styles.weightText}>{analysis.weight} kg</Text>
                </View>
              )}

              {/* Total Price */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Price</Text>
                <Text style={styles.priceText}>{analysis.price.toFixed(2)} kr</Text>
              </View>

              {/* PCF */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Carbon Footprint (PCF)</Text>
                <Text style={styles.pcfText}>{typeof analysis.pcf === 'number' ? analysis.pcf.toFixed(2) : analysis.pcf} kg CO2</Text>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.resultLabel}>Description</Text>
                <Text style={styles.descriptionText}>{analysis.description}</Text>
              </View>

              {/* Components */}
              {analysis.components.length > 0 && (
                <View style={styles.componentsContainer}>
                  <Text style={styles.resultLabel}>Detected Components</Text>
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
                  <Text style={styles.resultLabel}>CO2 Breakdown</Text>
                  {analysis.pcfBreakdown.map((item, idx) => (
                    <View key={idx} style={styles.pcfRow}>
                      <Text style={styles.pcfStage}>{item.stage}</Text>
                      <Text style={[
                        styles.pcfValue,
                        item.value < 0 && styles.pcfCredit
                      ]}>
                        {item.value > 0 ? '+' : ''}{item.value.toFixed(2)} kg
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* DPP Created Info */}
            {analysis.productId && (
              <View style={styles.dppCreated}>
                <MaterialIcons name="check-circle" size={ms(24)} color={SageAccent} />
                <Text style={styles.dppCreatedText}>DPP Created: {analysis.productId}</Text>
              </View>
            )}

            {/* View in DPP Button */}
            {analysis.productUrl && (
              <TouchableOpacity
                style={styles.createDppButton}
                onPress={handleOpenProductUrl}
                activeOpacity={0.85}
              >
                <MaterialIcons name="open-in-new" size={ms(20)} color={White} />
                <Text style={styles.createDppText}>View in DPP</Text>
              </TouchableOpacity>
            )}

            {/* Reset Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.85}
            >
              <MaterialIcons name="refresh" size={ms(18)} color={SageAccent} />
              <Text style={styles.resetText}>Scan New Board</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CreamBg,
  },
  pageHeader: {
    paddingHorizontal: s(20),
    marginBottom: vs(16),
  },
  pageTitle: {
    fontSize: ms(26),
    fontWeight: '800',
    color: TextDark,
  },
  pageSubtitle: {
    fontSize: ms(14),
    color: TextGray,
    marginTop: vs(4),
  },
  cameraContainer: {
    marginHorizontal: s(20),
    borderRadius: s(16),
    overflow: 'hidden',
    height: vs(280),
    backgroundColor: CameraBg,
    borderWidth: 2,
    borderColor: SageAccent,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: vs(20),
  },
  captureButton: {
    width: s(64),
    height: s(64),
    borderRadius: s(32),
    backgroundColor: SageAccent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: White,
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    flex: 1,
  },
  retakeButton: {
    position: 'absolute',
    bottom: vs(16),
    right: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderRadius: s(20),
  },
  retakeText: {
    color: White,
    fontWeight: '600',
    fontSize: ms(12),
    marginLeft: s(4),
  },
  scanPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
  },
  scanPlaceholderTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: TextDark,
    marginTop: vs(12),
  },
  scanPlaceholderSub: {
    fontSize: ms(12),
    color: TextGray,
    marginTop: vs(6),
    textAlign: 'center',
  },
  scanStartBtn: {
    marginTop: vs(14),
    backgroundColor: SageAccent,
    paddingHorizontal: s(18),
    paddingVertical: vs(10),
    borderRadius: s(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  scanStartText: {
    color: White,
    fontWeight: '700',
    fontSize: ms(12),
  },
  permissionCard: {
    backgroundColor: White,
    borderRadius: s(16),
    marginHorizontal: s(20),
    padding: s(32),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  permTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: TextDark,
    marginTop: vs(16),
  },
  permSubtitle: {
    fontSize: ms(13),
    color: TextGray,
    textAlign: 'center',
    marginTop: vs(6),
  },
  permButton: {
    backgroundColor: SageAccent,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(32),
    marginTop: vs(20),
  },
  permButtonText: {
    color: White,
    fontWeight: '700',
    fontSize: ms(14),
  },
  formSection: {
    marginTop: vs(24),
    paddingHorizontal: s(20),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: '800',
    color: TextDark,
    marginBottom: vs(12),
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: vs(12),
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: ms(12),
    fontWeight: '600',
    color: TextGray,
    marginBottom: vs(6),
  },
  input: {
    backgroundColor: White,
    borderRadius: s(12),
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    fontSize: ms(15),
    color: TextDark,
    borderWidth: 1,
    borderColor: Border,
  },
  analyzeButton: {
    backgroundColor: SageAccent,
    borderRadius: s(12),
    paddingVertical: vs(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: s(8),
    marginTop: vs(8),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: White,
    fontWeight: '700',
    fontSize: ms(14),
  },
  resultsSection: {
    marginTop: vs(24),
    paddingHorizontal: s(20),
  },
  resultCard: {
    backgroundColor: White,
    borderRadius: s(16),
    padding: s(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: Border,
  },
  resultLabel: {
    fontSize: ms(13),
    fontWeight: '600',
    color: TextGray,
  },
  categoryBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },
  categoryBadge2: {
    backgroundColor: '#FFF3E0',
  },
  categoryText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: SageAccent,
  },
  materialText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: TextDark,
    flex: 1,
    textAlign: 'right',
    marginLeft: s(12),
  },
  pricePerKgText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: SageAccent,
  },
  weightText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: TextDark,
  },
  priceText: {
    fontSize: ms(18),
    fontWeight: '800',
    color: TextDark,
  },
  pcfText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: '#4A9F4A',
  },
  descriptionContainer: {
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: Border,
  },
  descriptionText: {
    fontSize: ms(13),
    color: TextDark,
    marginTop: vs(6),
    lineHeight: ms(18),
  },
  componentsContainer: {
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: Border,
  },
  componentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: vs(8),
    gap: s(6),
  },
  componentChip: {
    backgroundColor: '#F0F4F0',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
  },
  componentText: {
    fontSize: ms(11),
    color: TextDark,
    fontWeight: '500',
  },
  pcfBreakdown: {
    paddingTop: vs(12),
  },
  pcfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: vs(6),
  },
  pcfStage: {
    fontSize: ms(12),
    color: TextGray,
  },
  pcfValue: {
    fontSize: ms(12),
    fontWeight: '600',
    color: TextDark,
  },
  pcfCredit: {
    color: '#4A9F4A',
  },
  createDppButton: {
    backgroundColor: '#2E7D32',
    borderRadius: s(12),
    paddingVertical: vs(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: s(8),
    marginTop: vs(16),
  },
  createDppText: {
    color: White,
    fontWeight: '700',
    fontSize: ms(14),
  },
  dppCreated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(12),
    gap: s(8),
  },
  dppCreatedText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: SageAccent,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(16),
    paddingVertical: vs(12),
    gap: s(6),
  },
  resetText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: SageAccent,
  },
});
