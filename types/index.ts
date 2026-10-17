export interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  notes?: string;
  category: 'CPLT' | 'FOA' | 'MATHS' | 'PHYSICS' | 'CS';
  filePath?: string;
}
