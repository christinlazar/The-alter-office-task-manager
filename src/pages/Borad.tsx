
import  { useState } from 'react'
import { Task } from '../types/types'

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

export default function Board({tasks,handleDragEnd,handleEditTask,handleDeleteTask}:{tasks:Task[],handleDragEnd:any,handleEditTask:any,handleDeleteTask:any}) {

    const [menuOpen,setMenuOpen] = useState<string | null>(null)
    
  
  return (

    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-screen bg-gray-50 p-6">
        <div className="mx-auto w-7xl">
          <div className="grid grid-cols-3 gap-6">
            {["to-do", "in-progress", "completed"].map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="rounded-lg bg-gray-100 p-4 min-h-[200px]"
                  >
                    <h3 className="mb-4 font-medium">{status}</h3>
                    <div className="flex flex-col gap-3">
                      {tasks
                        .filter((task) => task.isCompleted && task.isCompleted === status)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="group relative rounded-lg bg-white p-4 shadow-sm"
                              >
                                <div className="mb-2 flex items-start justify-between">
                                  <h4 className="font-medium">{task.title}</h4>
                                  {/* 3-dot Menu Button */}
                                  <div className="relative">
                                    <button
                                      className="text-gray-500 hover:text-gray-700"
                                      onClick={() =>
                                        setMenuOpen(menuOpen === task.id ? null : task.id)
                                      }
                                    >
                                      ⋮
                                    </button>
                                    {menuOpen === task.id && (
                                      <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-md z-10">
                                        <button
                                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                          onClick={() => {
                                            handleEditTask(task.id)
                                            setMenuOpen(null)
                                        }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                                          onClick={() => {
                                            handleDeleteTask(task.id)
                                            setMenuOpen(null)
                                        }}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`rounded px-2 py-0.5 text-xs ${
                                      task.category === "work"
                                        ? "bg-purple-100 text-purple-600"
                                        : "bg-orange-100 text-orange-600"
                                    }`}
                                  >
                                    {task.category}
                                  </span>
                                  <span className="text-xs text-gray-500">{task.dueDate}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}
