import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { processTransferTask } from "./transfer";

export interface TransferTask {
  type: "upload" | "download";
  status: "pending" | "in-progress" | "completed" | "failed";
  remoteKey: string;
  file?: File;
  name: string;
  loaded: number;
  total: number;
  error?: any;
}

const TransferQueueContext = createContext<TransferTask[]>([]);
const SetTransferQueueContext = createContext<
  React.Dispatch<React.SetStateAction<TransferTask[]>>
>(() => {});

export function useTransferQueue() {
  return useContext(TransferQueueContext);
}

export function useUploadEnqueue() {
  const setTransferTasks = useContext(SetTransferQueueContext);
  return (...requests: { basedir: string; file: File }[]) => {
    const newTasks = requests.map(
      ({ basedir, file }) =>
        ({
          type: "upload",
          status: "pending",
          name: file.name,
          file,
          remoteKey: basedir + file.name,
          loaded: 0,
          total: file.size,
        } as TransferTask)
    );
    setTransferTasks((tasks) => [...tasks, ...newTasks]);
  };
}

export function TransferQueueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transferTasks, setTransferTasks] = useState<TransferTask[]>([]);
  const taskProcessing = useRef<TransferTask | null>(null);
  const cleanupTimeoutRef = useRef<number | null>(null);

  function currentTaskUpdater(props: Partial<TransferTask>) {
    const currentTask = taskProcessing.current!;
    return (tasks: TransferTask[]) => {
      const newTask: TransferTask = { ...currentTask, ...props };
      const newTasks = tasks.map((t) =>
        t === taskProcessing.current ? newTask : t
      );
      if (currentTask === taskProcessing.current)
        taskProcessing.current = newTask;
      return newTasks;
    };
  }

  // Cleanup completed tasks after a delay
  useEffect(() => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }

    const hasCompletedTasks = transferTasks.some(task => 
      task.status === "completed" || task.status === "failed"
    );

    if (hasCompletedTasks) {
      cleanupTimeoutRef.current = window.setTimeout(() => {
        setTransferTasks(tasks => 
          tasks.filter(task => 
            task.status !== "completed" && task.status !== "failed"
          )
        );
      }, 2000); // Clean up after 2 seconds
    }

    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [transferTasks]);

  useEffect(() => {
    const taskToProcess = transferTasks.find(
      (task) => task.status === "pending"
    );
    if (!taskToProcess || taskProcessing.current) return;
    taskProcessing.current = taskToProcess;

    setTransferTasks(currentTaskUpdater({ status: "in-progress" }));

    processTransferTask({
      task: taskToProcess,
      onTaskProgress: ({ loaded }) => {
        setTransferTasks(currentTaskUpdater({ loaded }));
      },
    })
      .then(() => {
        setTransferTasks(currentTaskUpdater({ status: "completed" }));
        taskProcessing.current = null;
      })
      .catch((error) => {
        setTransferTasks(currentTaskUpdater({ status: "failed", error }));
        taskProcessing.current = null;
      });
  }, [transferTasks]);

  return (
    <TransferQueueContext.Provider value={transferTasks}>
      <SetTransferQueueContext.Provider value={setTransferTasks}>
        {children}
      </SetTransferQueueContext.Provider>
    </TransferQueueContext.Provider>
  );
}
