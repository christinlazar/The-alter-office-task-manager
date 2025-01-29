import {User} from 'firebase/auth'
import {db} from '../firebase/firebaseConfig'
import {collection, doc , addDoc ,getDocs, query, setDoc, where, getDoc, updateDoc,deleteDoc, orderBy, startAt, endAt} from 'firebase/firestore'
import { Task } from '../types/types';

export const saveUserData = async (user:User) => {
    try {
      const userRef = doc(db, "users", user.uid); 
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
        return {success:true,userId:user.uid}
      } else {
        console.log("User data already exists in Firestore");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
};



export const createTask = async (taskData:Task) => {
  try {

    const tasksRef = collection(db,"tasks");
    const q = query(tasksRef, where("title", "==", taskData.title), where("userId", "==", taskData.userId));
    
    const querySnapshot = await getDocs(q);
    console.log("querySnapShot",querySnapshot)
    if (!querySnapshot.empty) {
      console.log("Task already exists!");
      return {success:false};
    }
    taskData.title = taskData.title.toLowerCase()
    const createdTask = await addDoc(tasksRef, {...taskData});
    console.log("Task created successfully!");
    return {success:true,createdTask}
  } catch (error) {
    console.error("Error creating task:", error);
  }
};



export const edittask = async (taskData:Task) =>{
  try {
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("id", "==", taskData.id)); 
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: "No document found with the provided taskData.id" };
    }

    const docRef = querySnapshot.docs[0].ref; 
    await updateDoc(docRef, { ...taskData });
    return { success: true };
  } catch (error) {
    console.error("Error creating task:", error); 
  }
}

export const updatetaskstatus = async ({ taskId, value }: { taskId: string; value: 'in-progress' | 'completed' | 'to-do' | string }) =>{
  try {
    const taskRef = collection(db,"tasks");
    const q = query(taskRef,where("id", "==", taskId))
    const querySnapShot = await getDocs(q)
    const docRef = querySnapShot.docs[0].ref;
    await updateDoc(docRef,{
      isCompleted:value
    })
  } catch (error) {
    console.error(error)
  }
}

export const deletetask = async(taskId:string) =>{
  try {
    const taskRef = collection(db,"tasks");
    const q = query(taskRef,where("id", "==", taskId))
    const querySnapShot = await getDocs(q)
    const docRef = querySnapShot.docs[0].ref;
    await deleteDoc(docRef)
    return {success:true}
  } catch (error) {
    console.error(error)
  }
}

export const fetchTasks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db,"tasks"));
    const tasksData: Task[]   = [];
    querySnapshot.forEach((doc) => {
    tasksData.push(doc.data() as Task);
    });
    return tasksData;
  } catch (error) {
    console.error("Error fetching tasks: ", error);
    throw error;
  }
};


export const searchTasks = async (searchValue: string) => {
  try {
    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      orderBy("title"),
      startAt(searchValue),
      endAt(searchValue + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);

    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {success:true,tasks};
  } catch (error) {
    console.error("Error searching tasks:", error);
  }
};

export const handlebulkEdit = async (taskIdArray:[]) =>{
  try {
  
    const taskRef = collection(db,"tasks");
    for(let taskId of taskIdArray){
      const q = query(taskRef, where("id", "==", taskId))
      const querySnapShot = await getDocs(q)
      const docRef = querySnapShot.docs[0].ref;
      await deleteDoc(docRef)
    }
    return {success:true}
  } catch (error) {
    console.error("Error searching tasks:", error);
  }
}

export const handlebulkChange = async (taskIdArray:[],status:string)=>{
  try {

    const taskRef = collection(db,"tasks");
    for(let taskId of taskIdArray){
      const q = query(taskRef,where("id", "==", taskId))
      const querySnapShot = await getDocs(q)
      const docRef = querySnapShot.docs[0].ref;
      await updateDoc(docRef,{
        isCompleted:status
      })
    }  
    

    return { success: true};
  } catch (error) {
    console.error("Error searching tasks:", error);
  }
}