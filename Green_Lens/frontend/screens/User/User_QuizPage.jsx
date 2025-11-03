import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Image, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp, doc, setDoc, updateDoc, increment, getDoc 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export default function User_QuizPage({ navigation }) {
  const [quizVisible, setQuizVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [question, setQuestion] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => setCurrentUser(user));
    return unsubscribe;
  }, []);

  const resolveImageUrl = async (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    try {
      const cleanPath = imagePath.replace(/^gs:\/\/green-lens-47e9b\.appspot\.com\//, '');
      const pathRef = ref(storage, cleanPath);
      const url = await getDownloadURL(pathRef);
      return url;
    } catch {
      return null;
    }
  };

  const fetchQuestion = async (category) => {
    try {
      const q = query(collection(db, 'quizQuestions'), where('category', '==', category));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        const fixedUrl = await resolveImageUrl(randomQuestion.imageUrl);
        setQuestion({ ...randomQuestion, imageUrl: fixedUrl });
      } else {
        setQuestion(null);
      }
    } catch {
      Alert.alert('Error', 'Could not fetch quiz question.');
    }
  };

  const handlePressCategory = async (category) => {
    setSelectedCategory(category);
    setQuizResult(null);
    await fetchQuestion(category);
    setQuizVisible(true);
  };

  const handleAnswer = async (answer) => {
    if (!currentUser || !question) return;

    const result = answer === question.correctAnswer ? 'correct' : 'wrong';
    setQuizResult(result);
    const points = result === 'correct' ? 3 : 0;

    try {
      const userRef = doc(db, 'users', currentUser.uid);

      const userSnap = await getDoc(userRef);
      const savedUsername =
        userSnap.exists() && userSnap.data().username
          ? userSnap.data().username
          : currentUser.displayName || currentUser.email || 'Anonymous';

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

      await setDoc(
        userRef,
        {
          email: currentUser.email || 'anonymous@example.com',
          name: currentUser.displayName || '',
          username: savedUsername,
        },
        { merge: true }
      );

      if (points > 0) {
        await updateDoc(userRef, { totalPoints: increment(points) });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save your quiz result.');
    }
  };

  const handleReturn = () => {
    setQuizVisible(false);
    setQuestion(null);
    setQuizResult(null);
  };

  const goToRanking = () => {
    navigation.navigate('User_RankingPage');
  };

  return (
    <View style={styles.container}>
      {/* Ranking Button */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.rankingButton} onPress={goToRanking}>
          <Ionicons name="trophy-outline" size={18} color="#000" />
          <Text style={styles.rankingText}>Ranking</Text>
        </TouchableOpacity>
      </View>

      {/* Category Cards */}
      <View style={styles.categoryContainer}>
        {[
          { cat: 'Flower', icon: 'flower-outline' },
          { cat: 'Plant', icon: 'leaf-outline' },
          { cat: 'Architecture', icon: 'business-outline' },
        ].map(({ cat, icon }) => (
          <TouchableOpacity key={cat} style={styles.categoryCard} onPress={() => handlePressCategory(cat)}>
            <Ionicons name={icon} size={32} color="#000" style={{ marginBottom: 8 }} />
            <Text style={styles.categoryText}>{cat}</Text>
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

  // Ranking
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  rankingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD43B',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rankingText: {
    fontWeight: '600',
    color: '#000',
    fontSize: 14,
    marginLeft: 4,
  },

  // Category
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  categoryCard: {
    backgroundColor: '#EAF7EA',
    borderRadius: 15,
    width: '30%',
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },

  // Modal
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