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
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      if (!photo) return;
      setPhotoUri(photo.uri);

      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPEN_AI}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            input: [
              {
                role: 'user',
                content: [
                  { type: 'input_text', text: "Extract ISBN from this image and provide details" },
                  {
                    type: 'input_image',
                    image_url: `data:image/jpeg;base64,${photo.base64}`,
                  },
                ],
              },
            ],
          }),
        });

        const data = await response.json();
        console.log(data);
        if (data.output_text) {
          Alert.alert('Recognition Result', data.output_text);
        } else {
          Alert.alert('Error', 'No result found.');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while processing the image.');
      }
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
