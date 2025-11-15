import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const db = getFirestore(app);
const auth = getAuth(app);

export default function FeedbackPage() {
  const navigation = useNavigation();
  
  // State to hold star rating, user input, error message, and current user info
  const [rating, setRating] = useState(1); 
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Listen for Firebase auth state changes to get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Handle feedback submission
  const handleSubmit = async () => {
    if (!suggestion.trim()) {
      setError('*This Box Cannot Be Empty.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to submit feedback.');
      return;
    }

    try {
      // Add feedback to Firestore with user info, rating, suggestion, and timestamp
      await addDoc(collection(db, 'feedback'), {
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.email || 'Anonymous',
        email: currentUser.email || 'anonymous@example.com',
        rating,
        suggestion: suggestion.trim(),
        createdAt: serverTimestamp(),
      });

      // Show confirmation and navigate back after submission
      Alert.alert('Thank You!', 'Your feedback has been submitted.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);

      // Reset form
      setRating(1);
      setSuggestion('');
      setError('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Give Feedback</Text>

      <Text style={styles.label}>How would you rate us?</Text>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.header}>Write a Review</Text>
      <Text style={styles.label}>Any suggestions and feedback?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Add review..."
        placeholderTextColor="#888"
        value={suggestion}
        onChangeText={text => {
          setSuggestion(text);
          if (text.trim()) setError('');
        }}
        multiline
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 27, fontWeight: 'bold', marginVertical: 15, color: '#222' },
  label: { fontSize: 16, fontWeight: '600', marginVertical: 8, color: '#333' },
  starContainer: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 20 },
  star: { fontSize: 32, color: '#FFD700', marginHorizontal: 6 },
  textInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, fontSize: 16, textAlignVertical: 'top', marginBottom: 5, color: '#000', minHeight: 250 },
  errorText: { color: 'red', fontSize: 14, marginBottom: 15, marginLeft: 5 },
  button: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 8, alignItems: 'center', elevation: 2 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});