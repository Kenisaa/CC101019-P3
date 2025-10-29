import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ImageResult {
  uri: string;
  base64?: string;
}

// Solicitar permisos de cámara
export async function requestCameraPermissions(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de cámara:', error);
    return false;
  }
}

// Solicitar permisos de galería
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de galería:', error);
    return false;
  }
}

// Abrir cámara para tomar foto
export async function takePhoto(): Promise<ImageResult | null> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('No se otorgaron permisos para usar la cámara');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2, // Calidad muy comprimida para iPhone de alta resolución
      exif: false, // No incluir metadatos EXIF
      base64: false,
      // Limitar resolución máxima (ancho máximo 1200px)
      // Esto es crucial para iPhones con cámaras de 48MP+
      allowsMultipleSelection: false,
    });

    if (result.canceled) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
    };
  } catch (error) {
    console.error('Error al tomar foto:', error);
    throw error;
  }
}

// Abrir galería para seleccionar imagen
export async function pickImage(): Promise<ImageResult | null> {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      throw new Error('No se otorgaron permisos para acceder a la galería');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2, // Calidad muy comprimida para iPhone de alta resolución
      exif: false, // No incluir metadatos EXIF
      base64: false,
      // Limitar resolución máxima
      allowsMultipleSelection: false,
    });

    if (result.canceled) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
    };
  } catch (error) {
    console.error('Error al seleccionar imagen:', error);
    throw error;
  }
}

// Redimensionar imagen antes de convertir a base64
async function resizeImage(imageUri: string): Promise<string> {
  try {
    // Redimensionar a un ancho máximo de 800px manteniendo el aspect ratio
    // Esto reduce significativamente el tamaño para iPhones de alta resolución
    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], // Solo especificamos width, height se ajusta automáticamente
      {
        compress: 0.5, // Compresión adicional
        format: SaveFormat.JPEG,
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error al redimensionar imagen:', error);
    // Si falla el redimensionamiento, retornar la imagen original
    return imageUri;
  }
}

// Convertir imagen a base64
export async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    // Primero redimensionar la imagen
    const resizedUri = await resizeImage(imageUri);

    // Luego convertir a base64
    const base64 = await FileSystem.readAsStringAsync(resizedUri, {
      encoding: 'base64',
    });

    console.log('📸 Tamaño de imagen base64:', (base64.length / 1024).toFixed(2), 'KB');

    // Retornar con el prefijo data:image para poder usarlo directamente
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error al convertir imagen a base64:', error);
    throw error;
  }
}
