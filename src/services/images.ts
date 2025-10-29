import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../config/firebase';

const storage = getStorage(app);

export interface ImageResult {
  uri: string;
  downloadURL?: string;
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
      quality: 0.7,
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
      quality: 0.7,
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

// Subir imagen a Firebase Storage
export async function uploadImageToFirebase(
  imageUri: string,
  userId: string,
  mealId: string
): Promise<string> {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create a reference to Firebase Storage
    const filename = `meals/${userId}/${mealId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    // Upload the blob
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    console.log('✅ Imagen subida a Firebase:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error al subir imagen a Firebase:', error);
    throw error;
  }
}

// Función combinada: seleccionar imagen y subirla
export async function selectAndUploadImage(
  userId: string,
  mealId: string,
  source: 'camera' | 'gallery'
): Promise<string | null> {
  try {
    // Seleccionar imagen
    const imageResult = source === 'camera' ? await takePhoto() : await pickImage();

    if (!imageResult) {
      return null;
    }

    // Subir a Firebase
    const downloadURL = await uploadImageToFirebase(imageResult.uri, userId, mealId);

    return downloadURL;
  } catch (error) {
    console.error('Error en selectAndUploadImage:', error);
    throw error;
  }
}
