import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Image, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp, doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebaseConfig';

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export default function User_QuizPage({ navigation }) {
  const [quizVisible, setQuizVisible] = useState(false); // Controls modal visibility
  const [selectedCategory, setSelectedCategory] = useState(''); // Stores chosen quiz category
  const [question, setQuestion] = useState(null); // Stores the current quiz question
  const [quizResult, setQuizResult] = useState(null); // Stores result after answering
  const [currentUser, setCurrentUser] = useState(null); // Stores currently logged-in user

  // Listen for auth state changes and store current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => setCurrentUser(user));
    return unsubscribe;
  }, []);

  // Converts Firebase Storage paths to download URLs for images
  const resolveImageUrl = async (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath; // Already a URL

    try {
      const cleanPath = imagePath.replace(/^gs:\/\/green-lens-47e9b\.appspot\.com\//, '');
      const pathRef = ref(storage, cleanPath);
      const url = await getDownloadURL(pathRef);
      return url;
    } catch {
      return null;
    }
  };

  // Fetch a random question for a given category from Firestore
  const fetchQuestion = async (category) => {
    try {
      const q = query(collection(db, 'quizQuestions'), where('category', '==', category));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        const fixedUrl = await resolveImageUrl(randomQuestion.imageUrl); // Resolve image URL
        setQuestion({ ...randomQuestion, imageUrl: fixedUrl });
      } else {
        setQuestion(null); // No question found
      }
    } catch {
      Alert.alert('Error', 'Could not fetch quiz question.');
    }
  };

  // Handle user selecting a quiz category
  const handlePressCategory = async (category) => {
    setSelectedCategory(category);
    setQuizResult(null); // Reset previous result
    await fetchQuestion(category);
    setQuizVisible(true); // Show quiz modal
  };

  // Handle user answering a question
  const handleAnswer = async (answer) => {
    if (!currentUser || !question) return;

    const result = answer === question.correctAnswer ? 'correct' : 'wrong';
    setQuizResult(result);
    const points = result === 'correct' ? 3 : 0; // Assign points for correct answers

    try {
      const userRef = doc(db, 'users', currentUser.uid);

      // Retrieve username for logging
      const userSnap = await getDoc(userRef);
      const savedUsername =
        userSnap.exists() && userSnap.data().username
          ? userSnap.data().username
          : currentUser.displayName || currentUser.email || 'Anonymous';

      // Save the quiz attempt to Firestore
      await addDoc(collection(db, 'quizResults'), {
        userId: currentUser.uid,
        email: currentUser.email || 'anonymous@example.com',
        name: currentUser.displayName || '',
        username: savedUsername,
        category: selectedCategory,
        questionId: question.id,
        answer,
        correctAnswer: question.correctAnswer,
        result,
        points,
        createdAt: serverTimestamp(),
      });

      // Update user data in Firestore
      await setDoc(
        userRef,
        {
          email: currentUser.email || 'anonymous@example.com',
          name: currentUser.displayName || '',
          username: savedUsername,
        },
        { merge: true }
      );

      // Increment total points if correct
      if (points > 0) {
        await updateDoc(userRef, { totalPoints: increment(points) });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save your quiz result.');
    }
  };

  // Close quiz modal and reset state
  const handleReturn = () => {
    setQuizVisible(false);
    setQuestion(null);
    setQuizResult(null);
  };

  // Navigate to ranking page
  const goToRanking = () => {
    navigation.navigate('User_RankingPage');
  };

  return (
    <View style={styles.container}>
      {/* Top row with ranking button */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.rankingButton} onPress={goToRanking}>
          <Ionicons name="trophy-outline" size={18} color="#000" />
          <Text style={styles.rankingText}>Ranking</Text>
        </TouchableOpacity>
      </View>

      {/* Category selection cards */}
      <View style={styles.categoryContainer}>
        {[
          { cat: 'Flower', label: 'Flowers', img: require('../../assets/quiz_flowers.jpg') },
          { cat: 'Plant', label: 'Plants', img: require('../../assets/quiz_plants.jpg') },
          { cat: 'Architecture', label: 'Architecture', img: require('../../assets/quiz_architecture.jpg') },
        ].map(({ cat, label, img }) => (
          <TouchableOpacity key={cat} style={styles.imageCard} onPress={() => handlePressCategory(cat)}>
            <Image source={img} style={styles.imageBackground} />
            <View style={styles.overlay} />
            <Text style={styles.imageText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quiz Modal */}
      <Modal transparent visible={quizVisible} animationType="slide" onRequestClose={handleReturn}>
        <TouchableWithoutFeedback onPress={handleReturn}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalBox}>
                {!question ? (
                  <Text>Coming Soon{'\n'}No quiz available at this moment.</Text>
                ) : !quizResult ? (
                  <>
                    {question.imageUrl && (
                      <Image source={{ uri: question.imageUrl }} style={{ width: 250, height: 150, marginBottom: 15 }} />
                    )}
                    <Text style={styles.questionText}>{question.question}</Text>
                    {question.options.map((opt) => (
                      <TouchableOpacity key={opt} style={styles.answerButton} onPress={() => handleAnswer(opt)}>
                        <Text style={styles.answerText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <>
                    <Text style={styles.resultText}>{quizResult === 'correct' ? 'Correct!' : 'Wrong!'}</Text>
                    <Text style={styles.pointText}>Points: {quizResult === 'correct' ? 3 : 0}</Text>
                    <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
                      <Text style={styles.returnButtonText}>Return</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  rankingButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD43B', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  rankingText: { fontWeight: '600', color: '#000', fontSize: 14, marginLeft: 4 },
  categoryContainer: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  imageCard: { width: '95%', height: 100, borderRadius: 25, marginBottom: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imageBackground: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  imageText: { position: 'absolute', color: '#fff', fontSize: 24, fontWeight: '700' },
  categoryCard: { backgroundColor: '#EAF7EA', borderRadius: 15, width: '30%', paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 300, backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 15, textAlign: 'center' },
  answerButton: { width: '100%', padding: 12, backgroundColor: '#000', borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  answerText: { color: '#fff', fontWeight: '600' },
  resultText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  pointText: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  returnButton: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#000', borderRadius: 8 },
  returnButtonText: { color: '#fff', fontWeight: '600' },
});