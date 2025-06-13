"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed: npm install uuid @types/uuid
import type { Task, FilterType, SortByType } from "@/types";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AddTaskForm } from "./AddTaskForm";
import { TaskItem } from "./TaskItem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { ListFilter, Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Helper function to generate unique IDs, if uuid is not preferred or available
// const generateId = () => Math.random().toString(36).substr(2, 9);

export function TodoList() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("taskmaster-tasks", []);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortByType>("newest");
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [tasksToRemove, setTasksToRemove] = useState<Set<string>>(new Set());


  useEffect(() => {
    setMounted(true); // Ensures localStorage is read only on client
  }, []);

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: uuidv4(), // or generateId()
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    const task = tasks.find(t => t.id === id);
    if (task) {
      toast({
        title: `Task ${task.completed ? "Marked Incomplete" : "Completed"}`,
        description: `"${task.text.substring(0,20)}${task.text.length > 20 ? "..." : ""}" status updated.`,
      });
    }
  };

  const handleRemoveTask = (id: string) => {
    setTasksToRemove(prev => new Set(prev).add(id));
    // Delay actual removal to allow for animation
    setTimeout(() => {
      const taskToRemove = tasks.find(task => task.id === id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setTasksToRemove(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (taskToRemove) {
        toast({
          title: "Task Removed",
          description: `"${taskToRemove.text.substring(0,20)}${taskToRemove.text.length > 20 ? "..." : ""}" removed.`,
          variant: "destructive"
        });
      }
    }, 300); // Match animation duration
  };

  const filteredTasks = useMemo(() => {
    if (!mounted) return []; // Don't render based on initial (potentially empty) state from SSR
    return tasks.filter(task => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    });
  }, [tasks, filter, mounted]);

  const sortedTasks = useMemo(() => {
    const tasksToSort = [...filteredTasks];
    switch (sortBy) {
      case "oldest":
        return tasksToSort.sort((a, b) => a.createdAt - b.createdAt);
      case "alphabetical":
        return tasksToSort.sort((a, b) => a.text.localeCompare(b.text));
      case "newest":
      default:
        return tasksToSort.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [filteredTasks, sortBy]);

  if (!mounted) {
    // Optional: show a loading skeleton or null during SSR/initial client mount
    return (
        <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle className="text-center font-headline text-2xl">Loading Tasks...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-10 bg-muted rounded animate-pulse"></div>
                <div className="h-16 bg-muted rounded animate-pulse"></div>
                <div className="h-16 bg-muted rounded animate-pulse"></div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary to-blue-500 p-6">
        <CardTitle className="text-center font-headline text-3xl font-bold text-primary-foreground">
          TaskMaster
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AddTaskForm onAddTask={handleAddTask} />
        
        {tasks.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortByType)}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder="Sort tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {sortedTasks.length === 0 && tasks.length > 0 && (
          <p className="text-center text-muted-foreground py-8">No tasks match your current filters. Try a different filter!</p>
        )}

        {tasks.length === 0 && (
            <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-foreground">No tasks yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first task above.</p>
            </div>
        )}
        
        <div className="space-y-3">
          {sortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onRemoveTask={handleRemoveTask}
              isBeingRemoved={tasksToRemove.has(task.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
