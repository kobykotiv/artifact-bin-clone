import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Trash2, CheckCircle, Circle, Save, CalendarDays, Loader2Icon, Pencil, User, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { type ArtifactData } from '@/lib/services/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactMarkdown from 'react-markdown'; // Import react-markdown

interface SprintPlannerProps {
  artifact: ArtifactData;
  onSave: (updatedArtifact: ArtifactData) => Promise<void> | void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  points: number;
  assignee?: string;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  tasks: Task[];
}

interface SprintPlanData {
  id: string;
  name: string;
  projectName: string;
  description?: string;
  sprints: Sprint[];
}

// Add a type for drag item
interface DragItem {
  id: string;
  type: string;
  originalStatus: 'todo' | 'in-progress' | 'done';
}

// Default values for a new sprint
const defaultNewSprintData = {
  name: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 2 weeks
  goal: '',
};

export function SprintPlanner({ artifact, onSave }: SprintPlannerProps) {
  const [planData, setPlanData] = useState<SprintPlanData>({
    id: '',
    name: '',
    projectName: '',
    description: '',
    sprints: []
  });
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    status: 'todo',
    points: 1,
    assignee: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false); // New state for edit dialog
  const [editingTask, setEditingTask] = useState<Task | null>(null); // New state for task being edited
  const [newSprintDialogOpen, setNewSprintDialogOpen] = useState(false); // State for new sprint dialog
  const [newSprintData, setNewSprintData] = useState(defaultNewSprintData); // State for new sprint form data

  // Parse artifact content on load
  useEffect(() => {
    try {
      const content = JSON.parse(artifact.content || '{}');
      setPlanData({
        id: content.id || artifact.id,
        name: content.name || artifact.title || 'Sprint Plan',
        projectName: content.projectName || '',
        description: content.description || '',
        sprints: Array.isArray(content.sprints) ? content.sprints : []
      });
      
      // Select first sprint if available
      if (content.sprints?.length > 0 && !selectedSprintId) {
        setSelectedSprintId(content.sprints[0].id);
      }
    } catch (error) {
      console.error('Failed to parse sprint plan data:', error);
      toast.error('Failed to load sprint plan data');
    }
  }, [artifact, selectedSprintId]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedArtifact = {
        ...artifact,
        title: planData.name,
        content: JSON.stringify(planData, null, 2),
      };
      await onSave(updatedArtifact);
      toast.success('Sprint plan saved successfully');
    } catch (error) {
      console.error('Failed to save sprint plan:', error);
      toast.error('Failed to save sprint plan');
    } finally {
      setIsLoading(false);
    }
  };

  // Renamed original createNewSprint to handleCreateSprint, now triggered by dialog
  const handleCreateSprint = () => {
    if (!newSprintData.name.trim()) {
      toast.error('Sprint name is required');
      return;
    }
    // Basic date validation
    if (newSprintData.startDate && newSprintData.endDate && newSprintData.startDate > newSprintData.endDate) {
        toast.error('End date must be after start date');
        return;
    }

    const newSprint: Sprint = {
      id: crypto.randomUUID(),
      name: newSprintData.name.trim(),
      startDate: newSprintData.startDate,
      endDate: newSprintData.endDate,
      goal: newSprintData.goal.trim(),
      tasks: []
    };

    setPlanData(prev => ({
      ...prev,
      sprints: [...prev.sprints, newSprint]
    }));

    setSelectedSprintId(newSprint.id);
    setNewSprintData(defaultNewSprintData); // Reset form
    setNewSprintDialogOpen(false); // Close dialog
    toast.success(`Sprint "${newSprint.name}" created`);
  };

  const createNewTask = () => {
    if (!selectedSprintId) return;
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      assignee: newTask.assignee?.trim() || undefined,
    };
    
    setPlanData(prev => ({
      ...prev,
      sprints: prev.sprints.map(sprint => 
        sprint.id === selectedSprintId 
          ? { ...sprint, tasks: [...sprint.tasks, task] }
          : sprint
      )
    }));
    
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      points: 1,
      assignee: '',
    });
    
    setNewTaskDialogOpen(false);
  };

  const updateTaskStatus = (sprintId: string, taskId: string, status: Task['status']) => {
    setPlanData(prev => ({
      ...prev,
      sprints: prev.sprints.map(sprint => 
        sprint.id === sprintId 
          ? {
              ...sprint,
              tasks: sprint.tasks.map(task => 
                task.id === taskId ? { ...task, status } : task
              )
            }
          : sprint
      )
    }));
  };

  // New function to update a task's details
  const updateTask = (updatedTask: Task) => {
    if (!selectedSprintId || !updatedTask) return;
    if (!updatedTask.title.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }

    const taskToSave: Task = {
        ...updatedTask,
        assignee: updatedTask.assignee?.trim() || undefined,
    };

    setPlanData(prev => ({
      ...prev,
      sprints: prev.sprints.map(sprint =>
        sprint.id === selectedSprintId
          ? {
              ...sprint,
              tasks: sprint.tasks.map(task =>
                task.id === taskToSave.id ? taskToSave : task
              )
            }
          : sprint
      )
    }));
    setEditTaskDialogOpen(false);
    setEditingTask(null);
    toast.success('Task updated successfully');
  };

  // Function to open the edit dialog
  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    setEditTaskDialogOpen(true);
  };

  const deleteTask = (sprintId: string, taskId: string) => {
    setPlanData(prev => ({
      ...prev,
      sprints: prev.sprints.map(sprint => 
        sprint.id === sprintId 
          ? {
              ...sprint,
              tasks: sprint.tasks.filter(task => task.id !== taskId)
            }
          : sprint
      )
    }));
  };

  const deleteSprint = (sprintId: string) => {
    setPlanData(prev => ({
      ...prev,
      sprints: prev.sprints.filter(sprint => sprint.id !== sprintId)
    }));
    
    if (selectedSprintId === sprintId) {
      const remainingSprints = planData.sprints.filter(s => s.id !== sprintId);
      setSelectedSprintId(remainingSprints.length > 0 ? remainingSprints[0].id : null);
    }
  };

  const selectedSprint = planData.sprints.find(sprint => sprint.id === selectedSprintId);
  
  const sprintProgress = selectedSprint 
    ? Math.round((selectedSprint.tasks.filter(t => t.status === 'done').length / (selectedSprint.tasks.length || 1)) * 100) 
    : 0;
  
  const totalPoints = selectedSprint 
    ? selectedSprint.tasks.reduce((sum, task) => sum + task.points, 0) 
    : 0;
  
  const completedPoints = selectedSprint 
    ? selectedSprint.tasks.filter(t => t.status === 'done').reduce((sum, task) => sum + task.points, 0) 
    : 0;

  // New handler for drag and drop task updates
  const handleTaskDrop = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    if (!selectedSprintId) return;
    
    const task = selectedSprint?.tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    updateTaskStatus(selectedSprintId, taskId, newStatus);
    toast.success(`Task moved to ${newStatus.replace('-', ' ')}`);
  };

  // Task component with drag functionality
  const TaskCard = ({ task, sprintId, columnType }: { 
    task: Task, 
    sprintId: string,
    columnType: 'todo' | 'in-progress' | 'done'
  }) => {
    const [{ isDragging }, dragRef, previewRef] = useDrag({
      type: 'TASK',
      item: { id: task.id, type: 'TASK', originalStatus: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const opacity = isDragging ? 0.4 : 1;
    const isCompleted = task.status === 'done';

    return (
      <Card 
        key={task.id} 
        className="p-3 cursor-move" 
        style={{ opacity }}
        ref={previewRef}
      >
        <div className="flex items-center gap-2">
          <div ref={dragRef} className="cursor-grab hover:text-primary">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h5 className={`font-medium ${isCompleted ? 'line-through opacity-70' : ''}`}>{task.title}</h5>
              <Badge variant="outline">{task.points}</Badge>
            </div>
            {task.description && (
              // Wrap description in ReactMarkdown
              <div className={`text-sm text-muted-foreground mt-1 prose prose-sm dark:prose-invert max-w-none ${isCompleted ? 'opacity-70' : ''}`}>
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>
            )}
            {task.assignee && (
              <div className={`flex items-center gap-1 text-xs text-muted-foreground mt-2 ${isCompleted ? 'opacity-70' : ''}`}>
                <User className="w-3 h-3" />
                <span>{task.assignee}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-1">
            {columnType === 'todo' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTaskStatus(sprintId, task.id, 'in-progress')}
              >
                Start
              </Button>
            )}
            {columnType === 'in-progress' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTaskStatus(sprintId, task.id, 'done')}
              >
                Complete
              </Button>
            )}
            {columnType === 'done' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTaskStatus(sprintId, task.id, 'todo')}
              >
                Reopen
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditTaskClick(task)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => deleteTask(sprintId, task.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  };

  // Column component with drop functionality
  const TaskColumn = ({ title, tasks, status, sprintId }: {
    title: string;
    tasks: Task[];
    status: 'todo' | 'in-progress' | 'done';
    sprintId: string;
  }) => {
    const [{ isOver }, dropRef] = useDrop({
      accept: 'TASK',
      drop: (item: DragItem) => {
        if (item.originalStatus !== status) {
          handleTaskDrop(item.id, status);
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });
    
    return (
      <div 
        className={`border-r last:border-r-0 p-2 flex flex-col h-full ${isOver ? 'bg-muted/50' : ''}`}
        ref={dropRef}
      >
        <h4 className="font-medium p-2">{title}</h4>
        <div className="flex-grow space-y-2 p-2">
          {tasks.map(task => (
            <TaskCard 
              key={task.id}
              task={task}
              sprintId={sprintId}
              columnType={status}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-4">
              No tasks in {title.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4 border-b">
        <div className="space-y-1 flex-grow">
          <div className="flex items-center gap-2">
            <Input
              value={planData.name}
              onChange={(e) => setPlanData(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-semibold bg-transparent border-0 px-0 h-auto max-w-md"
              placeholder="Sprint Plan Title"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Input
              value={planData.projectName}
              onChange={(e) => setPlanData(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="Project Name"
              className="text-sm border-0 px-0 h-auto"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {/* Updated Button to trigger Dialog */}
          <Dialog open={newSprintDialogOpen} onOpenChange={setNewSprintDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-1" /> New Sprint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Sprint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sprint Name</label>
                  <Input
                    value={newSprintData.name}
                    onChange={(e) => setNewSprintData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={`Sprint ${planData.sprints.length + 1}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                     <Input
                        type="date"
                        value={newSprintData.startDate}
                        onChange={(e) => setNewSprintData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                     <Input
                        type="date"
                        value={newSprintData.endDate}
                        onChange={(e) => setNewSprintData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sprint Goal (Optional)</label>
                  <Textarea
                    value={newSprintData.goal}
                    onChange={(e) => setNewSprintData(prev => ({ ...prev, goal: e.target.value }))}
                    placeholder="What is the primary objective of this sprint?"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setNewSprintDialogOpen(false); setNewSprintData(defaultNewSprintData); }}>Cancel</Button>
                <Button onClick={handleCreateSprint}>Create Sprint</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Plan</>}
          </Button>
        </div>
      </div>

      {/* Sprint Selection */}
      <div className="border-b">
        {planData.sprints.length > 0 ? (
          <ScrollArea className="whitespace-nowrap">
            <div className="flex p-2">
              <Tabs value={selectedSprintId || ''} onValueChange={setSelectedSprintId}>
                <TabsList>
                  {planData.sprints.map(sprint => (
                    <TabsTrigger key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex justify-center p-4 text-muted-foreground">
            No sprints yet. Create a new sprint to get started.
          </div>
        )}
      </div>

      {/* Sprint Content */}
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        {selectedSprint ? (
          <div className="flex flex-col h-full gap-4">
            {/* Sprint Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sprint Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Sprint Name</label>
                    <Input
                      value={selectedSprint.name}
                      onChange={(e) => setPlanData(prev => ({
                        ...prev,
                        sprints: prev.sprints.map(sprint => 
                          sprint.id === selectedSprintId 
                            ? { ...sprint, name: e.target.value }
                            : sprint
                        )
                      }))}
                      placeholder="Sprint Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <div className="flex">
                        <span className="bg-muted flex items-center px-2 rounded-l-md border border-r-0"><Calendar className="h-4 w-4 text-muted-foreground" /></span>
                        <Input
                          type="date"
                          value={selectedSprint.startDate}
                          onChange={(e) => setPlanData(prev => ({
                            ...prev,
                            sprints: prev.sprints.map(sprint => 
                              sprint.id === selectedSprintId 
                                ? { ...sprint, startDate: e.target.value }
                                : sprint
                            )
                          }))}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <div className="flex">
                        <span className="bg-muted flex items-center px-2 rounded-l-md border border-r-0"><Calendar className="h-4 w-4 text-muted-foreground" /></span>
                        <Input
                          type="date"
                          value={selectedSprint.endDate}
                          onChange={(e) => setPlanData(prev => ({
                            ...prev,
                            sprints: prev.sprints.map(sprint => 
                              sprint.id === selectedSprintId 
                                ? { ...sprint, endDate: e.target.value }
                                : sprint
                            )
                          }))}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sprint Goal</label>
                    <Textarea
                      value={selectedSprint.goal}
                      onChange={(e) => setPlanData(prev => ({
                        ...prev,
                        sprints: prev.sprints.map(sprint => 
                          sprint.id === selectedSprintId 
                            ? { ...sprint, goal: e.target.value }
                            : sprint
                        )
                      }))}
                      placeholder="What is the goal of this sprint?"
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" size="sm" onClick={() => deleteSprint(selectedSprint.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Sprint
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sprint Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{sprintProgress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${sprintProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <h4 className="text-sm text-muted-foreground">Story Points</h4>
                        <p className="text-2xl font-bold">{completedPoints}/{totalPoints}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <h4 className="text-sm text-muted-foreground">Tasks</h4>
                        <p className="text-2xl font-bold">
                          {selectedSprint.tasks.filter(t => t.status === 'done').length}/{selectedSprint.tasks.length}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Status Breakdown</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center justify-center flex-col bg-muted/50 p-2 rounded">
                          <span className="text-sm text-muted-foreground">Todo</span>
                          <span className="font-bold">{selectedSprint.tasks.filter(t => t.status === 'todo').length}</span>
                        </div>
                        <div className="flex items-center justify-center flex-col bg-muted/50 p-2 rounded">
                          <span className="text-sm text-muted-foreground">In Progress</span>
                          <span className="font-bold">{selectedSprint.tasks.filter(t => t.status === 'in-progress').length}</span>
                        </div>
                        <div className="flex items-center justify-center flex-col bg-muted/50 p-2 rounded">
                          <span className="text-sm text-muted-foreground">Done</span>
                          <span className="font-bold">{selectedSprint.tasks.filter(t => t.status === 'done').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Task Board */}
            <Card className="flex-grow overflow-hidden">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tasks</CardTitle>
                <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={newTask.title}
                          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Task title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newTask.description}
                          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Task description"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Points</label>
                          <Select 
                            value={newTask.points.toString()} 
                            onValueChange={(value) => setNewTask(prev => ({ ...prev, points: parseInt(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Points" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 5, 8, 13].map(points => (
                                <SelectItem key={points} value={points.toString()}>{points}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select 
                            value={newTask.status} 
                            onValueChange={(value: Task['status']) => setNewTask(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">Todo</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                       {/* Assignee Input */}
                       <div className="space-y-2">
                        <label className="text-sm font-medium">Assignee (Optional)</label>
                        <Input
                          value={newTask.assignee || ''}
                          onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                          placeholder="Assignee name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewTaskDialogOpen(false)}>Cancel</Button>
                      <Button onClick={createNewTask}>Create Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-hidden">
                <DndProvider backend={HTML5Backend}>
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                      <TaskColumn
                        title="Todo"
                        tasks={selectedSprint.tasks.filter(task => task.status === 'todo')}
                        status="todo"
                        sprintId={selectedSprint.id}
                      />
                      <TaskColumn
                        title="In Progress"
                        tasks={selectedSprint.tasks.filter(task => task.status === 'in-progress')}
                        status="in-progress"
                        sprintId={selectedSprint.id}
                      />
                      <TaskColumn
                        title="Done"
                        tasks={selectedSprint.tasks.filter(task => task.status === 'done')}
                        status="done"
                        sprintId={selectedSprint.id}
                      />
                    </div>
                  </ScrollArea>
                </DndProvider>
              </CardContent>
            </Card>

            {/* Edit Task Dialog */}
            <Dialog open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                {editingTask && ( // Render only if editingTask is not null
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={editingTask.title}
                        onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="Task title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={editingTask.description}
                        onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                        placeholder="Task description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Points</label>
                        <Select
                          value={editingTask.points.toString()}
                          onValueChange={(value) => setEditingTask(prev => prev ? { ...prev, points: parseInt(value) } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Points" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 5, 8, 13].map(points => (
                              <SelectItem key={points} value={points.toString()}>{points}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={editingTask.status}
                          onValueChange={(value: Task['status']) => setEditingTask(prev => prev ? { ...prev, status: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">Todo</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Assignee Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assignee (Optional)</label>
                      <Input
                        value={editingTask.assignee || ''}
                        onChange={(e) => setEditingTask(prev => prev ? { ...prev, assignee: e.target.value } : null)}
                        placeholder="Assignee name"
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setEditTaskDialogOpen(false); setEditingTask(null); }}>Cancel</Button>
                  <Button onClick={() => editingTask && updateTask(editingTask)}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="mb-4">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Sprints Created</h3>
              <p className="text-muted-foreground mb-4">
                Create a sprint to start planning your work. Each sprint can contain multiple tasks organized by status.
              </p>
              <Button onClick={handleCreateSprint}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Sprint
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
