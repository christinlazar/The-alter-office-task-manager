export interface User {
    uid:string,
    name:string,
    email:string,
    photoUrl:string
}

export interface Task {
    id: string ;
    title: string; 
    description?: string; 
    category: "work" | "personal" | "other"; 
    tags: string[]; 
    dueDate: string; 
    createdAt: string; 
    file?:any[];
    updatedAt?: []  ;
    isCompleted: 'to-do' | 'in-progress' | 'completed' | string; 
    priority?: "low" | "medium" | "high";
    userId: string | undefined; 
  }
  