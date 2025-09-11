// ./screens/User/User_QuizPage.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function User_QuizPage() {
  const navigation = useNavigation();
  const [quizVisible, setQuizVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quizResult, setQuizResult] = useState(null); // 'correct' | 'wrong' | null

  const correctAnswers = {
    Flower: 'Rose',
  };

  const answerOptions = ['Rose', 'Marigold', 'Sunflower', 'Tulip'];

  const handlePressCategory = (category) => {
    setSelectedCategory(category);
    setQuizResult(null);
    setQuizVisible(true);
  };

  const handleAnswer = (answer) => {
    if (answer === correctAnswers[selectedCategory]) {
      setQuizResult('correct');
    } else {
      setQuizResult('wrong');
    }
  };

  const handleReturn = () => {
    setQuizVisible(false);
    setQuizResult(null);
  };

  const hasQuiz = correctAnswers[selectedCategory] !== undefined;

  return (
    <View style={styles.container}>
      {/* Ranking button at top right */}
      <View style={styles.rankingContainer}>
        <TouchableOpacity
          style={styles.rankingButton}
          onPress={() => navigation.navigate('User_RankingPage')}
        >
          <Text style={styles.rankingButtonText}>Ranking</Text>
        </TouchableOpacity>
      </View>

      {/* Category buttons row */}
      <View style={styles.categoryContainer}>
        {['Flower', 'Plant', 'Architecture'].map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.categoryButton}
            onPress={() => handlePressCategory(category)}
          >
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quiz Modal */}
      <Modal
        transparent
        visible={quizVisible}
        animationType="slide"
        onRequestClose={handleReturn}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {!hasQuiz ? (
              // Coming soon screen
              <>
                <Text style={styles.comingSoonTitle}>Coming Soon</Text>
                <Text style={styles.comingSoonText}>No quiz available at this moment.</Text>

                <View style={styles.returnButtonContainer}>
                  <TouchableOpacity
                    style={styles.rankingButton}
                    onPress={handleReturn}
                  >
                    <Text style={styles.rankingButtonText}>Return</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : !quizResult ? (
              <>
                <View style={styles.imagePlaceholder}>
                  <Text style={{ color: '#aaa' }}>Image Placeholder</Text>
                </View>

                <Text style={styles.questionText}>
                  What {selectedCategory.toLowerCase()} is this?
                </Text>

                <View style={styles.answerContainer}>
                  {answerOptions.map((answer) => (
                    <TouchableOpacity
                      key={answer}
                      style={styles.answerButton}
                      onPress={() => handleAnswer(answer)}
                    >
                      <Text style={styles.answerText}>{answer}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              // Result screen
              <>
                <Text style={styles.resultText}>
                  {quizResult === 'correct' ? 'Answer Correct!' : 'Answer Wrong!'}
                </Text>
                <Text style={styles.pointText}>
                  {quizResult === 'correct' ? 'Point +3' : 'Point +0'}
                </Text>

                <View style={styles.returnButtonContainer}>
                  <TouchableOpacity
                    style={styles.rankingButton}
                    onPress={handleReturn}
                  >
                    <Text style={styles.rankingButtonText}>Return</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  
  rankingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  rankingButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rankingButtonText: { color: '#fff', fontWeight: '600' },

  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 50,
    marginBottom: 50,
  },
  categoryButton: {
    width: 100,
    height: 100,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  categoryText: { color: '#fff', fontWeight: '600', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 300, backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
  imagePlaceholder: { width: 250, height: 150, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 15 },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 15, textAlign: 'center' },
  answerContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  answerButton: { width: '48%', height: 50, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 10 },
  answerText: { color: '#fff', fontWeight: '600' },
  resultText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  pointText: { fontSize: 16, fontWeight: '600', color: '#333' },

  comingSoonTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  comingSoonText: { fontSize: 16, color: '#666', textAlign: 'center' },

  returnButtonContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'flex-end', // aligns button to the right
  },
});
