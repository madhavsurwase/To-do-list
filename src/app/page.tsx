import { TodoList } from "@/components/task-master/TodoList";

export default function Home() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-blue-50 to-orange-50">
      <div className="w-full max-w-2xl">
        <TodoList />
      </div>
    </main>
  );
}
