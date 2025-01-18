import { Prisma, PrismaClient, Task as PrismaTask } from "@prisma/client";
import NotificationService from "../notification/service";
import BaseService from "@/misc/baseService";
import { TaskNotFound } from "./errors/taskNotFound";

export type Task = PrismaTask
export type CreateTaskInput = Prisma.TaskCreateInput

export default class TaskService extends BaseService {

  private notificationService;

  constructor(prisma?: PrismaClient, notificationService = new NotificationService()) {
    super(prisma);
    this.notificationService = notificationService
  }

  async getTask(taskId: string) {
    const task = this._prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      throw new TaskNotFound();
    }

    return task;
  }

  async getTasks() {
    return this._prisma.task.findMany();
  }

  async createTask(data: CreateTaskInput) {
    const task = await this._prisma.task.create({
      data,
    });

    return task;
  }

  async toggleFinishTask(taskId: string, action: boolean) {
    const task = await this.getTask(taskId);

    if (!task) {
      throw new TaskNotFound();
    }

    await this._prisma.$transaction(async (prisma) => {
      await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          isDone: action,
        },
      });

      this.sendFinishedMessage(task);
    });
  }

  private async sendFinishedMessage(task: Task) {
    const notification = await this.notificationService.createNotification({
      title: "Sua tarefa foi finalizada!",
      message: "",
      template: "default",
      model: "task",
      targets: {
        create: {
          userId: task.authorId
        }
      }
    })

    await this.notificationService.sendNotification(notification);
  }

}
