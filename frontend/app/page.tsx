/**
 * v0 by Vercel.
 * @see https://v0.dev/t/U93FXenr4q9
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socketManager from "@/lib/utils/socketInstance";

interface user {
  socketId: string;
  username: string;
  email: string;
  id: string;
}

export default function Component() {
  const { toast } = useToast();
  const [users, setUsers] = useState<user[]>([]);

  const router = useRouter();

  useEffect(() => {
    socketManager.connect();

    socketManager.on<user[]>("users", (users) => {
      setUsers(
        users.filter((user) => user.socketId !== socketManager.socketId)
      );
    });

    socketManager.on<{ username: string }>("ping", ({ username }) => {
      toast({
        description: `${username} has pinged you.`,
      });
    });

    return () => {
      socketManager.disconnect();
    };
  }, [toast]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-background">
      {users.length > 0 ? (
        <div className="container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 py-12">
          {users.map((user) => (
            <Card
              className="flex flex-col items-center justify-between p-6 shadow-sm hover:shadow-md"
              key={user.socketId}
            >
              <div className="space-y-2 flex flex-col items-center">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>
                    {user.username
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium capitalize">
                  {user.username}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 shadow-sm"
                onClick={() => {
                  socketManager.emit("ping", user.id);
                }}
              >
                Ping
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-lg font-medium">No users Available</div>
      )}
      <div className="mt-8">
        <Button
          variant={"outline"}
          size={"lg"}
          onClick={() => {
            // toast.success("Notification sent to all users.");
            socketManager.emit("pingAll", "");
          }}
          className="mb-8 "
          disabled={users.length === 0}
        >
          Send notification to all
        </Button>
      </div>
    </div>
  );
}
