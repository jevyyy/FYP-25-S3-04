import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = () => {
    if (!rating && !suggestion.trim()) {
      Alert.alert('Incomplete Feedback', 'Please provide at least a rating or feedback.');
      return;
    }

    console.log('User Rating:', rating);
    console.log('User Suggestions:', suggestion);

    Alert.alert('Thank You!', 'Your feedback has been submitted.');
    setRating(0);
    setSuggestion('');
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.header}>Give Feedback</Text>

      {/* Rating Section */}
      <Text style={styles.label}>How would you rate us?</Text>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Review Section */}
      <Text style={styles.header}>Write a Review</Text>

      {/* Suggestions Section */}
      <Text style={styles.label}>Any suggestions and feedback?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Add review..."
        placeholderTextColor="#888"
        value={suggestion}
        onChangeText={setSuggestion}
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'left', // ⬅️ Changed from center to left
    color: '#222',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
    color: '#333',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // ⬅️ Left aligned stars
    marginBottom: 20,
  },
  star: {
    fontSize: 32,
    color: '#FFD700',
    marginHorizontal: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: '#000',
    minHeight: 250,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
