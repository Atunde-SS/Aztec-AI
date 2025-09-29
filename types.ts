export interface SubTopic {
  id: string;
  title: string;
}

export interface LearningPath {
  title: string;
  level: string;
  subTopics: SubTopic[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  feedback?: 'good' | 'bad';
}

export type SkillLevel = 'non-technical' | 'technical';

export type Persona = 'Empathetic Mentor' | 'Socratic Questioner' | 'Pragmatic Developer' | 'Conceptual Explainer';

export interface SearchResult {
    topicId: string;
    topicTitle: string;
    sectionTitle: string;
    snippet: string;
}