import React, { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { router } from 'expo-router';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      base64: true,
    });
    
    if (!photo) return;
    setPhotoUri(photo.uri);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.5-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Extract ISBN number from this image. It should match this regex /(?:ISBN(?:-13)?:?\\s*)?(\\d{10,13})/i' },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${photo.base64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });
      
      const data = await response.json();
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        Alert.alert('Error', 'No result from OpenAI.');
        return;
      }
      const isbnMatch = data.choices[0].message.content.match(/(?:ISBN(?:-13)?:?\s*)?(\d{10,13})/i);
      
      if (!isbnMatch) {
        Alert.alert('Error', 'ISBN not found in the image.');
        return;
      }
      const isbn = isbnMatch[1];
      const bookResponse = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const bookData = await bookResponse.json();
      const bookInfo = bookData[`ISBN:${isbn}`];
      
      if (!bookInfo) {
        Alert.alert('Error', 'Book details not found.');
        return;
      }
      
      Alert.alert('Book Details', `Title: ${bookInfo.title}\nAuthor: ${bookInfo.authors?.[0]?.name}\nNumber of pages: ${bookInfo.number_of_pages}`);
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while processing the image.');
    }
  };
  
  
  const handleCancel = () => {
    router.replace('/dashboard');
};

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing='back'>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleCancel}>
            <Text style={styles.text}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {photoUri && (
        <View style={styles.photoContainer}>
          <Text>Captured Image:</Text>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreview: {
    width: 200,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
});
