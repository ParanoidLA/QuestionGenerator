
import { readFileSync } from 'fs';
import { createInterface } from 'readline';


class Question {
    constructor(question, subject, topic, difficulty, marks) {
        this.question = question || '';
        this.subject = subject || '';
        this.topic = topic || '';
        this.difficulty = difficulty || '';
        this.marks = marks || 0;
}
}

class QuestionStore {
  constructor() {
    this.questions = [];
  }

  addQuestion(question) {
    this.questions.push(question);
  }

  getQuestionsByDifficulty(difficulty) {
    return this.questions.filter((q) => q.difficulty === difficulty);
  }
}

class QuestionPaperGenerator {
  constructor(questionStore) {
    this.questionStore = questionStore;
  }

  generatePaper(totalMarks, difficultyDistribution) {
    const paper = [];

    for (const [difficulty, percentage] of Object.entries(difficultyDistribution)) {
      const difficultyQuestions = this.questionStore.getQuestionsByDifficulty(difficulty);
      const difficultyMarks = Math.ceil((percentage / 100) * totalMarks);

      difficultyQuestions.sort(() => Math.random() - 0.5);

      let currentMarks = 0;
      for (const question of difficultyQuestions) {
        if (currentMarks + question.marks <= difficultyMarks) {
          paper.push(question);
          currentMarks += question.marks;
        }
      }
    }

    return paper;
  }
}

//Json reader
function readQuestionsFromJSON(filePath) {
    try {
      const jsonData = readFileSync(filePath, 'utf8');
      const questionsData = JSON.parse(jsonData);
      const questionStore = new QuestionStore();
  
      for (const questionData of questionsData.questions) {
        const question = new Question(
          questionData.question,
          questionData.subject,
          questionData.topic,
          questionData.difficulty,
          questionData.marks
        );
        questionStore.addQuestion(question);
      }
  
      console.log('Question Store:', questionStore); // Debugging line
  
      return questionStore;
    } catch (error) {
      console.error('Error reading JSON file:', error.message);
      return null;
    }
  }
  
// Input user requiremnts
function getUserInput() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter total marks: ', (totalMarks) => {
      const difficultyDistribution = {};

      rl.question('Enter percentage of Easy questions: ', (easyPercentage) => {
        difficultyDistribution['Easy'] = parseInt(easyPercentage);

        rl.question('Enter percentage of Medium questions: ', (mediumPercentage) => {
          difficultyDistribution['Medium'] = parseInt(mediumPercentage);

          rl.question('Enter percentage of Hard questions: ', (hardPercentage) => {
            difficultyDistribution['Hard'] = parseInt(hardPercentage);

            rl.close();
            resolve({ totalMarks: parseInt(totalMarks), difficultyDistribution });
          });
        });
      });
    });
  });
}

// Example usage:
async function main() {
  const jsonFilePath = '/Users/lakshyaagrawal/Coding/Reelo/questions.json'; 
  const questionStore = readQuestionsFromJSON(jsonFilePath);

  if (questionStore) {
    const { totalMarks, difficultyDistribution } = await getUserInput();

    const generator = new QuestionPaperGenerator(questionStore);
    const questionPaper = generator.generatePaper(totalMarks, difficultyDistribution);

    console.log('Generated Question Paper:');
    console.log(questionPaper);
  }
}

main();
