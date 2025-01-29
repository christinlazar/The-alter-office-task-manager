
import { useAuth } from '../context/authContext'
import { db, logOut } from '../firebase/firebaseConfig'
import {createPortal} from 'react-dom'
import React, {  useEffect, useState } from "react"
import { Task } from '../types/types'
import { v4 as uuidV4 } from 'uuid'
import { createTask, deletetask, edittask, fetchTasks, handlebulkChange, handlebulkEdit, searchTasks, updatetaskstatus } from '../services/firebaseServices'
import { toast, Toaster } from 'sonner'
import { useQuery,useMutation,useQueryClient } from 'react-query'
import { PencilIcon, TrashIcon } from '@heroicons/react/16/solid'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { collection, getDocs, query, where, } from 'firebase/firestore'
import { AlignLeft, Bold, Calendar, Italic, List, Strikethrough, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Board from './Borad'
import NoResults from '../components/notResult'


export default function Dashboard() {

  const user = useAuth()
  const [activeTab, setActiveTab] = useState("list")
  const [expandedSection, setExpandedSection] = useState<string[]>(["todo", "in-progress", "completed"])
  const [modal,setModalOpen] = useState<boolean>(false)
  const [editModal,setEditModalOpen] = useState(false)
  const [tagInput, setTagInput] = useState<string>("");
  const [reload,setReload] = useState(false)
  const [searchValue,setSearchValue] = useState('')
  const [file,setFile] = useState<File | null>(null)
  const [isChecked,setIsChecked] = useState<boolean>(false)
  const [bulkSelected,setBulkSelected] = useState<[]>([])
  const [selectedStatus,handleSelect] = useState('')
  const [boradView,setBoardView] = useState<boolean>(false)
  const [noresult,setNoResult] = useState<boolean>(false)
  const navigate = useNavigate()

  const [task, setTask] = useState<Task>({
      id:"",
      title: "",
      description: "",
      category: "work",
      tags: [],
      dueDate: "",
      createdAt:"",
      updatedAt:[],
      isCompleted:'to-do',
      priority: "low",
      userId:''
    });



    const queryClient = useQueryClient();
    const {data:tasks,isLoading,error} = useQuery<Task[] | undefined>('tasks',fetchTasks)
    const [taskList, setTaskList] = useState<Task[] | undefined | any>(tasks);

    const today = new Date().toISOString().split("T")[0]

   
    useEffect(() => {
      const fetchTasks = async () => {
        // Add a where clause to filter by userId
        const tasksQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user?.user?.uid) // Ensure your tasks collection has a field called userId
        );
        
        const querySnapshot = await getDocs(tasksQuery);
        const tasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
    
        setTaskList(tasks);
      };
    
      fetchTasks();
    
      return () => {
        setReload(false);
        setNoResult(false)
      };
    }, [reload, user.user?.uid]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        setFile(selectedFile); 
      } else {
        setFile(null); // Reset state if no file is selected
      }
    };
  
  
   
    const { mutate: addTask } = useMutation(createTask, {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
        toast.success("Task created successfully");
        setReload(true)
        setTask({
          id: "",
          title: "",
          description: "",
          category: "work",
          tags: [],
          dueDate: "",
          createdAt: "",
          updatedAt: [],
          isCompleted: 'to-do',
          priority: "low",
          userId: "",
        });
        setModalOpen(false);
      },
      onError: (error) => {
        toast.error("Error creating task");
        console.error(error);
      },
    });

    const { mutate: editTask } = useMutation(edittask, {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
        setReload(true)
        toast.success("Task edited successfully");
        setTask({
          id: "",
          title: "",
          description: "",
          category: "work",
          tags: [],
          dueDate: "",
          createdAt: "",
          updatedAt: [],
          isCompleted: 'to-do',
          priority: "low",
          userId: "",
        });
        setEditModalOpen(false);
      },
      onError: (error) => {
        toast.error("Error creating task");
        console.error(error);
      },
    });


  const { mutate: updateStatus } = useMutation(updatetaskstatus,
  {
    onSuccess: () => {
      queryClient.invalidateQueries("tasks");
      setReload(true)
      toast.success("Status changed successfully");
    },
    onError: (error) => {
      toast.error("Error editing task");
      console.error(error);
    },
  }
);

  const { mutate: deleteTask } = useMutation(deletetask,
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries("tasks");
      if(data?.success){
        setReload(true)
        toast.success("Task deleted successfully");
      }
    },
    onError: (error) => {
      toast.error("Error while deleting task");
      console.error(error);
    },
  }
);

const {mutate : handleSearch} = useMutation(searchTasks,{
  onSuccess: (data) => {
    queryClient.invalidateQueries("tasks");
    if(data?.success && data.tasks.length > 0){
      setTaskList(data.tasks)
    }else if(data?.tasks.length == 0){
      setNoResult(true)
        // toast.error("Can't find tasks with corresponding seach value")
    }
  },
  onError: (error) => {
    toast.error("Error while deleting task");
    console.error(error);
  },
})

   
    const toggleSection = (section: string) => {
      setExpandedSection((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      console.log(e.target.value)
      const { name, value } = e.target;
      setTask({ ...task, [name]: value });
    };
 
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {

        const formData = new FormData()
        if(file){
        formData.append('file',file) 
        formData.append('upload_preset', 'taskManager');
        }
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dermg83ju/image/upload`, 
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        if(editModal){
          task.updatedAt?.push(`Updated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` as never)
          editTask(task)
        console.log("Task Submitted:", task);
        }else{
          task.updatedAt?.push(`Updated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}` as never)
          task.id = uuidV4()
          task.createdAt = new Date().toLocaleDateString() as never
          task.userId = user.user?.uid
          let newTask;
          if(file){
             newTask = {
              ...task,
              file:[data.url]
            }
          }else{
            newTask = {
              ...task
            }
          }
         
          addTask(newTask)
        console.log("Task Submitted:",task);
        }
      } catch (error) {
        toast.error("Something unexpected happend")
      }
    };

  
    const handleEditTask = async (taskId :string) =>{
      try {
        tasks?.forEach((task)=> {
          if(task.id == taskId){
            setTask({
              id: task.id,
              title: task.title,
              description: task.description,
              category: task.category,
              tags: task.tags,
              dueDate: task.dueDate,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
              isCompleted: task.isCompleted,
              priority:task.priority,
              userId: task.userId,
            });
          }
        })
        setEditModalOpen(true)
      } catch (error) {
        toast.error("something unexpected happend")
      }
    }


    const updateTaskStatus = (taskId:string | any,value:string | any) =>{
      updateStatus({taskId,value})
    }

    const handleDeleteTask = (taskId:string) =>{
        deleteTask(taskId)
    }

  
   
  
    const handleDragEnd = (result: any) => {
      if (!result.destination) return;
      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;
      console.log(sourceIndex,destinationIndex)
      if(sourceIndex == destinationIndex){
        return 
      }

      let filteredTasks = []
      if(result.destination.droppableId == 'to-do-tasks' || result.destination.droppableId == 'to-do'){
         filteredTasks = taskList.filter((task:any) => task.isCompleted === "to-do");
      }else if(result.destination.droppableId == 'in-progress-tasks' || result.destination.droppableId == 'in-progress'){
         filteredTasks =  taskList.filter((task:any) => task.isCompleted == 'in-progress');
      }else if(result.destination.droppableId == 'completed-tasks' || result.destination.droppableId == 'completed'){
        filteredTasks = taskList.filter((task:any) => task?.isCompleted == 'completed')
      }
 
      const todoTasks = taskList.filter((task:any) => task.isCompleted === "to-do");
      const progressTasks = taskList.filter((task:any) => task.isCompleted == 'in-progress')
      const completedTasks = taskList.filter((task:any) => task.isCompleted == 'completed')

      let temp = filteredTasks[sourceIndex]
      filteredTasks[sourceIndex] = filteredTasks[destinationIndex]
      filteredTasks[destinationIndex] = temp

      console.log("filtered after swapping",filteredTasks)
    
      setTaskList(Array.from(new Set([...filteredTasks,...todoTasks,...progressTasks,...completedTasks])));

    };

    const sortbyDuedate = (targetValue: string) => {
      try {
        console.log("Sorting by", targetValue);
        if (!targetValue.trim()) {
          setReload(true)
          return toast.error("Sorting can't be done");
        }
        const sortedTasks = [...taskList].sort((a, b) => {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          if (targetValue === "ascending") {
            return dateA - dateB; 
          } else if (targetValue === "descending") {
            return dateB - dateA; 
          } else {
            throw new Error("Invalid sorting order");
          }
        });
        console.log("sorted",sortedTasks)
        setTaskList(sortedTasks);

        toast.success(`Tasks sorted in ${targetValue} order`);
      } catch (error) {
        console.error("Sorting error:", error);
        toast.error("Something unexpected happened while sorting");
      }
    };
    
    const handleCategorySorting = (e:React.ChangeEvent<HTMLSelectElement>) =>{
      try {
        const targetValue = e.target.value
        console.log(targetValue)
        if(!targetValue.trim()){
          setReload(true)
        }
        const data = [...taskList].filter((task)=>task.category == targetValue)
        setTaskList(data)
      } catch (error) {
        toast.error("Something unexpected happend")
      }
    }

     const handlesearch = () =>{
      if(!searchValue.trim()){
        return toast.error("Please do a valid search")
      }
      handleSearch(searchValue)
      setSearchValue('')
    }

    const handleCheckboxChange = (checkedvalue: boolean, taskId: string) => {
      setBulkSelected((prev:any) => {
        if (checkedvalue) {
          return [...prev, taskId];
        } else {
          return prev.filter((id:string) => id !== taskId);
        }
      });
    };

    const handleBulkEdit = async () => {
      try {
        const response = await handlebulkEdit(bulkSelected)
        if(response?.success){
          toast.error("Deleted successfully")
        }
        setReload(true)
        setBulkSelected([])
      } catch (error) {
        toast.error("Something unexpected happend")
      }
    }

    const handleBulkChange = async (e:React.ChangeEvent<HTMLSelectElement>) =>{
      try {
        if(!e.target.value.trim()){
          return 
        }
        const value = e.target.value
        console.log(value)
        const response = await handlebulkChange(bulkSelected,value)
        if(response?.success){ 
        toast.success("Status changed successfully")
        queryClient.invalidateQueries("tasks");
        setReload(true)
        setBulkSelected([])
        }
        
      } catch (error) {
        toast.error("Something unexpected happend")
      }
    }
    

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster richColors position='bottom-right'/>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
        <span className="text-xl font-semibold">📋 TaskBuddy</span>
        </div>
        <div className="flex items-center gap-4">
          <img
            src={user.user?.photoURL || '' }
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <button onClick={logOut} className="text-gray-600 hover:text-gray-800">Logout</button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex gap-6 mb-6 border-b">
        <button
          onClick={() => {
            setActiveTab("list")
            setBoardView(false)
          }}
          className={`pb-2 px-1 ${
            activeTab === "list" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500"
          }`}
        >
          List
        </button>
        <button
          onClick={() =>{
            setActiveTab("board")
            setBoardView(true)
          }}
          className={`pb-2 px-1 ${
            activeTab === "board" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500"
          }`}
        >
          Board
        </button>
      </nav>

      {/* Filters and Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <select onChange={handleCategorySorting} className="appearance-none bg-white border rounded-md px-3 py-2 pr-8 text-gray-700">
              <option value='' >Category</option>
              <option value='work'>Work</option>
              <option value='personal'>Personal</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <select onChange={(e)=>sortbyDuedate(e.target.value)} className="appearance-none bg-white border rounded-md px-3 py-2 pr-8 text-gray-700">
              <option value='' >Due Date</option>
              <option value='ascending'>From today to due-date</option>
              <option value='descending'>From due-date to today</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="relative">

            <input
            value={searchValue}
            onChange={(e)=>setSearchValue(e.target.value)}
              type="search"
              placeholder="Search"
              className="pl-8 pr-3 py-2 border rounded-full text-gray-700 focus:outline-none focus:border-purple-500"
            />
            <svg
            onClick={handlesearch}
              className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 hover:cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button onClick={()=>{setModalOpen(true)}} className="bg-purple-900 text-white px-4 py-2 rounded-3xl hover:bg-purple-950 transition-colors">
            ADD TASK
          </button>
        </div>
      </div>

      {/* Task Sections */}
  {
    !boradView && !noresult ? (
      <div className="space-y-4">  
  <div className="bg-white rounded-lg shadow">
  <button
    onClick={() => toggleSection("todo")}
    className="w-full flex items-center justify-between p-4 bg-pink-300 rounded-t-lg"
  >
    <span className="font-medium">
      Todo({tasks?.filter(task => task.isCompleted === 'to-do').length || 0})
    </span>
    <svg
      className={`w-5 h-5 transition-transform ${expandedSection.includes("todo") ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  {expandedSection.includes('todo') && (
    <div className="p-4">
      {tasks?.filter(task => task.isCompleted === 'to-do').length === 0 ? (
        <div className="text-gray-500 text-center py-8">No Tasks in Progress</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-r-0 border-l-0 border-gray-300 p-2"></th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Name</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Due on</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Status</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Category</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <Droppable droppableId="to-do-tasks">
            {(provided) => (
              <tbody
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {taskList?.filter((task:any)=> task.isCompleted == 'to-do').map((task:any, index:any) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="hover:bg-gray-50 text-center"
                      >
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          <input type="checkbox"   onChange={(e)=>handleCheckboxChange(e.target.checked,task.id)} />
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          {task.title}
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          {task.dueDate == today ? 'Today' : task.dueDate|| "N/A"}
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          <select
                            className="border border-r-0 border-l-0 rounded p-1"
                            value={task.isCompleted}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          >
                            <option value="to-do">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 p-2 text-center">
                          {task.category || "N/A"}
                        </td>
                        <td className="border border-r-0 border-l-0 flex flex-col border-gray-300 p-2 text-center">
                          <div className="flex justify-center">
                            <PencilIcon className="h-4 w-4 mt-2 mr-3 text-black" />
                            <button
                              className="text-blue-500 mr-5"
                              onClick={() => handleEditTask(task.id)}
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex justify-center">
                            <TrashIcon className="h-4 w-4 mt-2 mr-2 text-red-500" />
                            <button
                              className="text-red-500 mt-1"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
        
      )}
    </div>
  )}
</div>
  {/*  */}
  <div className="bg-white rounded-lg shadow">
  <button
    onClick={() => toggleSection("in-progress")}
    className="w-full flex items-center justify-between p-4 bg-blue-300 rounded-t-lg"
  >
    <span className="font-medium">
      In-Progress ({tasks?.filter(task => task.isCompleted === 'in-progress').length || 0})
    </span>
    <svg
      className={`w-5 h-5 transition-transform ${expandedSection.includes("in-progress") ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  {expandedSection.includes("in-progress") && (
    <div className="p-4">
      {tasks?.filter(task => task.isCompleted === 'in-progress').length === 0 ? (
        <div className="text-gray-500 text-center py-8">No Tasks in Progress</div>
      ) : (
 
        <DragDropContext onDragEnd={handleDragEnd}>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-r-0 border-l-0 border-gray-300 p-2"></th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Name</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Due on</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Status</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Category</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <Droppable droppableId="in-progress-tasks">
            {(provided) => (
              <tbody
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {taskList?.filter((task:any)=> task.isCompleted == 'in-progress').map((task:any, index:any) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="hover:bg-gray-50 text-center"
                      >
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          <input type="checkbox" onChange={(e)=>handleCheckboxChange(e.target.checked,task.id)} />
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          {task.title}
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          {task.dueDate == today ? 'Today' : task.dueDate || "N/A"}
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          <select
                            className="border border-r-0 border-l-0 rounded p-1"
                            value={task.isCompleted}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          >
                            <option value="to-do">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 p-2 text-center">
                          {task.category || "N/A"}
                        </td>
                        <td className="border border-r-0 border-l-0 flex flex-col border-gray-300 p-2 text-center">
                          <div className="flex justify-center">
                            <PencilIcon className="h-4 w-4 mt-2 mr-3 text-black" />
                            <button
                              className="text-blue-500 mr-5"
                              onClick={() => handleEditTask(task.id)}
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex justify-center">
                            <TrashIcon className="h-4 w-4 mt-2 mr-2 text-red-500" />
                            <button
                              className="text-red-500 mt-1"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
      )}
    </div>
  )}
</div>
<div className="bg-white rounded-lg shadow">
  <button
    onClick={() => toggleSection("completed")}
    className="w-full flex items-center justify-between p-4 bg-green-300 rounded-t-lg"
  >
    <span className="font-medium">
      Completed ({tasks?.filter(task => task.isCompleted === 'completed').length || ''})
    </span>
    <svg
      className={`w-5 h-5 transition-transform ${expandedSection.includes("completed") ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  {expandedSection.includes("completed") && (
    <div className="p-4">
      {tasks?.filter(task => task.isCompleted === 'completed').length === 0 ? (
        <div className="text-gray-500 text-center py-8">No Tasks in Progress</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-r-0 border-l-0 border-gray-300 p-2"></th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Name</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Due on</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Status</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Task Category</th>
              <th className="border border-r-0 border-l-0 border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <Droppable droppableId="completed-tasks">
            {(provided) => (
              <tbody
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {taskList?.filter((task:any)=> task.isCompleted == 'completed').map((task:any, index:any) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="hover:bg-gray-50 text-center"
                      >
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          <input type="checkbox" onChange={(e)=>handleCheckboxChange(e.target.checked,task.id)} />
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          {task.title}
                        </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 text-center">
                          {task.dueDate == today ? 'Today' : task.dueDate|| "N/A"}
                        </td>
                      <td className="border border-gray-300 text-center">
                    <div className='bg-gray-300 h-8 w-[50%] ms-[25%]'>
                      <span className='text-center mt-4 text-sm' >Completed</span>
                    </div>
                    </td>
                        <td className="border border-r-0 border-l-0 border-gray-300 p-2 text-center">
                          {task.category || "N/A"}
                        </td>
                        <td className="border border-r-0 border-l-0 flex flex-col border-gray-300 p-2 text-center">
                          <div className="flex justify-center">
                            <PencilIcon className="h-4 w-4 mt-2 mr-3 text-black" />
                            <button
                            disabled={true}
                              className="text-blue-500 mr-5 line-through"
                              onClick={() => handleEditTask(task.id)}
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex justify-center">
                            <TrashIcon className="h-4 w-4 mt-2 mr-2 text-red-500" />
                            <button
                            disabled={true}
                              className="text-red-500 mt-1 line-through"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
      )}
    </div>
  )}
</div>


  {/* Completed Section */}

      </div>
    ) : !noresult && boradView ? (
      <Board 
       tasks={taskList}
       handleDragEnd={handleDragEnd}
       handleEditTask={handleEditTask}
       handleDeleteTask={handleDeleteTask}
       />
    ):(
      <NoResults/>
    )
  }
{
            (modal || editModal) &&  createPortal(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-[1000px] flex">
        {/* Main Form Section */}
        <div className="flex-1 border-r">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Create Task</h2>
            <button  onClick={()=>{
                setTask({
                  id: "",
                  title: "",
                  description: "",
                  category: "work",
                  tags: [],
                  dueDate: "",
                  createdAt: "",
                  updatedAt: [],
                  isCompleted: 'to-do',
                  priority: "low",
                  userId: "",
                });
      modal ? setModalOpen(false) : setEditModalOpen(false)
    }}
     className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <input
              type="text"
              name="title"
              value={task.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"
              placeholder="Task title"
              required
            />

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b">
                <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                  <Italic className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                  <Strikethrough className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                  <List className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                  <AlignLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <textarea
                  name="description"
                  value={task.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 min-h-[100px]"
                  placeholder="Description"
                ></textarea>
                <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {''}/300 characters
                </span>
              </div>
            </div>

            {/* Category and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Task Category*</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: "category", value: "work" } } as any)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      task.category === "work"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Work
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: "category", value: "personal" } } as any)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      task.category === "personal"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Personal
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Due on*</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dueDate"
                    value={task.dueDate}
                    onChange={handleInputChange}
                    min={today}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Task Status */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Task Status*</label>
              <select
                name="isCompleted"
                value={task.isCompleted}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 appearance-none"
              >
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Attachment */}
            <div>
            <label className="block text-sm text-gray-600 mb-1">Attachment</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-500">
                        <input
                        value={task.file }
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                Drop your files here or <span className="text-blue-500 cursor-pointer">Update</span>
              </p>
            </div>
          </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={()=>{
                  setTask({
                    id: "",
                    title: "",
                    description: "",
                    category: "work",
                    tags: [],
                    dueDate: "",
                    createdAt: "",
                    updatedAt: [],
                    isCompleted: 'to-do',
                    priority: "low",
                    userId: "",
                  });
                  modal ? setModalOpen(false) : setEditModalOpen(false)
                }}
                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                CANCEL
              </button>
              {
                editModal ? (
                  <button type="submit" className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                  Update
                </button>
                ):(
                  <button type="submit" className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                  CREATE
                </button>
                )
              }
            
            </div>
          </form>
        </div>

        {/* Activity Sidebar */}
        {
          editModal && (
            <div className="w-80 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity</h3>
            <div className="space-y-4">
              {task.updatedAt && task?.updatedAt.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                  <div className="flex-1">
                   <p>{activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          )
        }
        
      </div>
    </div>
,
document.body

            )
          }

          {
          
            bulkSelected.length && bulkSelected.length > 0 && createPortal(
           
                  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1C1C1C] rounded-lg py-2 px-4 flex items-center gap-4 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-white text-sm">{bulkSelected?.length> 0 ? bulkSelected?.length : '' } Tasks Selected</span>
        <button  className="text-gray-400 hover:text-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <button className="text-gray-400 hover:text-white transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>

      <div className="relative inline-block">
  <select
    className="px-4 py-1.5 text-sm text-white bg-[#2C2C2C] rounded-md hover:bg-[#3C3C3C] transition-colors appearance-none"
    id="status-dropdown"
    onChange={handleBulkChange}
  >
    <option value="" disabled selected>
      Status
    </option>
    {["to-do", "in-progress", "completed"].map((option, index) => (
      <option key={option} value={option} className="bg-black text-white">
        {option}
      </option>
    ))}
  </select>
</div>


      <button onClick={handleBulkEdit} className="text-sm text-red-500 hover:text-red-400 transition-colors">Delete</button>
    </div>
            ,document.body
            )
          }
    </div>
  )
}



