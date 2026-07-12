export type TabType =
  | "dashboard"
  | "subjects"
  | "notes"
  | "mission-control"
  | "pomodoro"
  | "flashcards"
  | "quiz"
  | "calendar"
  | "resources"
  | "profile"
  | "settings";

export interface Subject {
  id: string;
  name: string;
  category: string;
  mastery: number;
  color: string;
  examDate: string;
  notesCount: number;
  pendingCount: number;
}

export interface Note {
  id: string;
  title: string;
  subjectId: string;
  folder: string;
  content: string;
  pinned: boolean;
  tags: string[];
  lastModified: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  status: "todo" | "progress" | "review" | "completed";
  dueDate: string;
  priority: "low" | "medium" | "high";
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  status?: "again" | "hard" | "good" | "easy";
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subjectId: string;
  description: string;
  category: string;
  progress: number;
  cards: Flashcard[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "exam" | "assignment" | "study" | "other";
  date: string;
  time: string;
  description: string;
  subjectId?: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: "pdf" | "video" | "document" | "archive";
  folder: string;
  url: string;
  dateAdded: string;
  size: string;
  subjectId?: string;
}

export interface UserStats {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpNext: number;
  streak: number;
  totalFocusTime: number;
  completedSessions: number;
  effortIncrease: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface SystemSettings {
  language: string;
  autoSave: boolean;
  soundEnabled: boolean;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  pushNotifications: boolean;
  publicProfile: boolean;
  shareProgress: boolean;
}

export interface PomodoroState {
  isRunning: boolean;
  timeLeft: number;
  mode: "focus" | "shortBreak" | "longBreak";
}
