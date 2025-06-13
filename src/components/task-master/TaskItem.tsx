"use client";

import type * as React from 'react';
import { Trash2 } from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from '@/components/ui/card';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onRemoveTask: (id: string) => void;
  isBeingRemoved: boolean;
}

export function TaskItem({ task, onToggleComplete, onRemoveTask, isBeingRemoved }: TaskItemProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleRemove = () => {
    setIsVisible(false); // Start fade-out animation
    // Actual removal from state will be handled by parent after animation
    onRemoveTask(task.id); 
  };
  
  // This effect is for the initial appear animation
  const [appeared, setAppeared] = React.useState(false);
  React.useEffect(() => {
    setAppeared(true);
  }, []);

  return (
    <Card 
      className={cn(
        "flex items-center gap-3 p-4 transition-all duration-300 ease-in-out transform",
        task.completed ? "bg-muted/50" : "bg-card",
        isBeingRemoved ? "animate-item-remove" : (appeared ? "animate-item-add" : "opacity-0"),
        !isVisible && "opacity-0 scale-95" 
      )}
      aria-live="polite"
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggleComplete(task.id)}
        aria-label={task.completed ? `Mark ${task.text} as incomplete` : `Mark ${task.text} as complete`}
        className="transform scale-110"
      />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          "flex-grow text-base cursor-pointer",
          task.completed ? "line-through text-muted-foreground" : "text-card-foreground"
        )}
      >
        {task.text}
      </label>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        aria-label={`Remove task: ${task.text}`}
        className="text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </Card>
  );
}
