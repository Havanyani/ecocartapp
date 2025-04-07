import { Material } from '@/api/MaterialsApi';
import { BarcodeService } from '@/services/BarcodeService';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import { useCallback, useState } from 'react';

/**
 * Result of a successful material scan
 */
export interface MaterialScanResult {
  barcode: string;
  material: Material;
  confidence: number;
}

/**
 * A hook for scanning barcodes and matching them to materials
 */
export function useMaterialBarcodeScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<MaterialScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request camera permissions
   */
  const requestPermissions = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  /**
   * Handle barcode scanning
   */
  const handleBarCodeScanned = useCallback(({ type, data }: BarCodeScannerResult) => {
    // Only process certain barcode types
    const validTypes = ['org.gs1.EAN-13', 'org.gs1.EAN-8', 'org.gs1.UPC-A', 'org.gs1.UPC-E'];
    if (!validTypes.includes(type)) return;
    
    setScannedCode(data);
    setIsScanning(false);
    scanBarcode(data);
  }, []);

  /**
   * Lookup a material by barcode
   */
  const scanBarcode = useCallback(async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await BarcodeService.lookupMaterial(barcode);
      
      if (result) {
        setScanResult({
          barcode,
          material: result.material,
          confidence: result.confidence
        });
      } else {
        setError('Material not found for this barcode');
      }
    } catch (err) {
      console.error('Error looking up barcode:', err);
      setError('Failed to lookup material');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset the scan state
   */
  const resetScan = useCallback(() => {
    setScannedCode(null);
    setIsScanning(true);
    setScanResult(null);
    setError(null);
  }, []);

  /**
   * Contribute a barcode-material mapping
   */
  const contributeBarcode = useCallback(async (barcode: string, materialType: string) => {
    try {
      await BarcodeService.contributeMaterial(barcode, materialType);
      return true;
    } catch (err) {
      console.error('Error contributing barcode:', err);
      throw err;
    }
  }, []);

  return {
    hasPermission,
    scannedCode,
    isScanning,
    isLoading,
    scanResult,
    error,
    scanBarcode,
    resetScan,
    requestPermissions,
    handleBarCodeScanned,
    contributeBarcode
  };
} 