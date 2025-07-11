const examples: Record<string, string> = {
  javascript: `// Simple Todo App
class TodoApp {
  constructor() {
    this.todos = [];
  }

  addTodo(text) {
    this.todos.push({ id: Date.now(), text, completed: false });
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
  }
}

// Usage
const app = new TodoApp();
app.addTodo("Learn TypeScript");
app.addTodo("Build a project");
app.toggleTodo(1);`,

  typescript: `// Simple Todo App
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

class TodoApp {
  private todos: Todo[] = [];

  addTodo(text: string): void {
    this.todos.push({ id: Date.now(), text, completed: false });
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter(t => t.id !== id);
  }
}`,

  python: `# Simple Todo App
from dataclasses import dataclass
from typing import List
import time

@dataclass
class Todo:
    id: int
    text: str
    completed: bool

class TodoApp:
    def __init__(self):
        self.todos: List[Todo] = []
    
    def add_todo(self, text: str) -> None:
        self.todos.append(Todo(
            id=int(time.time() * 1000),
            text=text,
            completed=False
        ))
    
    def toggle_todo(self, id: int) -> None:
        for todo in self.todos:
            if todo.id == id:
                todo.completed = not todo.completed
                break
    
    def delete_todo(self, id: int) -> None:
        self.todos = [t for t in self.todos if t.id != id]`,

  rust: `// Simple Todo App
use std::time::{SystemTime, UNIX_EPOCH};

struct Todo {
    id: u64,
    text: String,
    completed: bool,
}

struct TodoApp {
    todos: Vec<Todo>,
}

impl TodoApp {
    fn new() -> Self {
        TodoApp { todos: Vec::new() }
    }

    fn add_todo(&mut self, text: String) {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
            
        self.todos.push(Todo {
            id: now,
            text,
            completed: false,
        });
    }

    fn toggle_todo(&mut self, id: u64) {
        if let Some(todo) = self.todos.iter_mut().find(|t| t.id == id) {
            todo.completed = !todo.completed;
        }
    }

    fn delete_todo(&mut self, id: u64) {
        self.todos.retain(|t| t.id != id);
    }
}`,

  go: `// Simple Todo App
package main

import (
    "time"
)

type Todo struct {
    ID        int64
    Text      string
    Completed bool
}

type TodoApp struct {
    todos []Todo
}

func NewTodoApp() *TodoApp {
    return &TodoApp{
        todos: make([]Todo, 0),
    }
}

func (app *TodoApp) AddTodo(text string) {
    todo := Todo{
        ID:        time.Now().UnixNano(),
        Text:      text,
        Completed: false,
    }
    app.todos = append(app.todos, todo)
}

func (app *TodoApp) ToggleTodo(id int64) {
    for i := range app.todos {
        if app.todos[i].ID == id {
            app.todos[i].Completed = !app.todos[i].Completed
            break
        }
    }
}

func (app *TodoApp) DeleteTodo(id int64) {
    newTodos := make([]Todo, 0)
    for _, todo := range app.todos {
        if todo.ID != id {
            newTodos = append(newTodos, todo)
        }
    }
    app.todos = newTodos
}`
};

export function getCodeExample(language: string): string {
  return examples[language.toLowerCase()] || '// No example available for this language';
}
