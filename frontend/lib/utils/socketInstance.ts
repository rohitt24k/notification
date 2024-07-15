// utils/socket.ts
import { Socket, ManagerOptions, SocketOptions } from "socket.io-client";
import io from "socket.io-client";

class SocketManager {
  private socket: Socket | null = null;
  private shouldReconnect: boolean = true;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectInterval: number = 5000; // 5 seconds

  public socketId: string | undefined;
  public connect(url: string = process.env.NEXT_PUBLIC_SERVER_URL || ""): void {
    if (!url) {
      console.error("Socket server URL is not provided");
      return;
    }
    this.shouldReconnect = true;
    const options: Partial<ManagerOptions & SocketOptions> = {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      withCredentials: true,
    };

    this.socket = io(url, options);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.socketId = this.socket?.id;
      console.log("Socket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason: Socket.DisconnectReason) => {
      console.log(`Socket disconnected: ${reason}`);
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on("error", (error: Error) => {
      console.error("Socket error:", error);
    });

    this.socket.on("reconnect_attempt", (attemptNumber: number) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Reconnection failed after maximum attempts");
    });
  }

  private handleReconnect(): void {
    if (!this.shouldReconnect) {
      console.log("Reconnection is disabled");
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.socket?.connect();
      }, this.reconnectInterval);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.shouldReconnect = false;
      this.socket.disconnect();
      this.isConnected = false;
      console.log("Socket disconnected");
    }
  }

  public emit<T>(eventName: string, data: T): void {
    if (this.isConnected && this.socket) {
      this.socket.emit(eventName, data);
    } else {
      console.error("Socket is not connected");
    }
  }

  public on<T>(eventName: string, callback: (data: T) => void): void {
    if (this.socket) {
      this.socket.on(eventName, callback);
    } else {
      console.error("Socket is not connected");
    }
  }

  public off<T>(eventName: string, callback?: (data: T) => void): void {
    if (this.socket) {
      this.socket.off(eventName, callback);
    } else {
      console.error("Socket is not connected");
    }
  }
}

const socketManager = new SocketManager();

export default socketManager;
