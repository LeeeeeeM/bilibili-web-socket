import { useEffect, useRef, useState } from "react";
import "./App.css";
import Room from "./lib";

function App() {
  const socketRef = useRef<Room | null>(null);
  const [message, setMessage] = useState<{ name: string; text: string }[]>([]);

  const { VITE_ROOM_ID, VITE_USER_ID, VITE_USER_TOKEN } = import.meta.env;

  useEffect(() => {
    const room = new Room(
      Number(VITE_ROOM_ID),
      Number(VITE_USER_ID),
      VITE_USER_TOKEN
    );
    socketRef.current = room;
    room.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    room.subscribe((data: any) => {
      for (const item of data) {
        if (item.cmd === "DANMU_MSG") {
          console.log("弹幕消息", item);
          setMessage((prev) => [...prev, {
            name: item.info[2][1],
            text: item.info[1],
          }]);
        }
      }
    });

    return () => {
      socketRef.current?.destroy();
    };
  }, []);

  return (
    <>
      <div id="content">
        请按照 README 中配置 .env
      </div>
      <button id="btn">房间弹幕</button>
      <div id="message">
        {message.map((item, index) => (
          <div key={index} className="danmu">
            <span>{item.name}</span>: <span>{item.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
