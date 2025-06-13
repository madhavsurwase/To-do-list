"use client";

import type * as React from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const taskFormSchema = z.object({
  text: z.string().min(1, { message: "Task description cannot be empty." }).max(100, { message: "Task description must be 100 characters or less." }),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface AddTaskFormProps {
  onAddTask: (text: string) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const { toast } = useToast();
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit: SubmitHandler<TaskFormData> = (data) => {
    onAddTask(data.text);
    form.reset();
    toast({
      title: "Task Added",
      description: `"${data.text.substring(0,20)}${data.text.length > 20 ? "..." : ""}" successfully added.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-start mb-6">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input placeholder="What needs to be done?" {...field} className="text-base"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" aria-label="Add task">
          <Plus className="h-5 w-5 mr-2" />
          Add
        </Button>
      </form>
    </Form>
  );
}
