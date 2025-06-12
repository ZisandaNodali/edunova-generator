// Prompt templates
export const promptTemplates = {
  lesson_plan: ({ ageGroup, topic }) => `
Create an engaging STEM lesson plan for children aged ${ageGroup}.
Topic: ${topic}
Include: 
- Objective
- Materials Needed
- Step-by-step Instructions
- A fun hands-on activity
Use simple, kid-friendly language.
Format the response in plain text without markdown formatting.
  `,

  flashcards: ({ ageGroup, topic }) => `
Generate 5 flashcards for children aged ${ageGroup}.
Topic: ${topic}
Each flashcard should have:
- A simple STEM or digital literacy term
- A short, age-appropriate definition
Format each flashcard exactly like this:
CARD 1:
TERM: [term here]
DEFINITION: [definition here]

CARD 2:
TERM: [term here]  
DEFINITION: [definition here]

Continue this format for all 5 cards.
Format the response in plain text without markdown formatting.
  `,

  quiz: ({ ageGroup, topic }) => `
Create a short quiz for children aged ${ageGroup} on the topic: ${topic}.
Include 5 multiple choice questions with 4 options each and the correct answer.
Format each question exactly like this:
QUESTION 1: [question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
CORRECT: [A, B, C, or D]

QUESTION 2: [question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
CORRECT: [A, B, C, or D]

Continue this format for all 5 questions.
Keep the tone light and fun.
Format the response in plain text without markdown formatting.
  `,

  study_guide: ({ ageGroup, topic }) => `
Write a study guide for children aged ${ageGroup}.
Topic: ${topic}
Include:
- A short explanation
- A visual or analogy
- A practice activity
Use age-appropriate and interactive language.
Format the response in plain text without markdown formatting.
  `,

  tutorial: ({ ageGroup, topic }) => `
Write a kid-friendly step-by-step tutorial for children aged ${ageGroup}.
Topic: ${topic}
Use numbered steps, simple terms, and suggest interactive elements if possible.
Keep it playful and educational.
Format the response in plain text without markdown formatting.
  `,
};
