import React, { createContext, useContext, useEffect, useState } from "react";
import { roomData } from "../data/rooms";
import type { Room, RoomContextType } from "../types";

const RoomInfo = createContext<RoomContextType | undefined>(undefined);

interface RoomContextProviderProps {
  children: React.ReactNode;
}

export const RoomContext: React.FC<RoomContextProviderProps> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(roomData);
  const [loading, setLoading] = useState<boolean>(false);

  const [adults, setAdults] = useState<string>("1 Adult");
  const [kids, setKids] = useState<string>("0 Kid");
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    setTotal(+adults[0] + +kids[0]);
  }, [adults, kids]);

  const resetRoomFilterData = () => {
    setAdults("1 Adult");
    setKids("0 Kid");
    setRooms(roomData);
  };

  // User clicks "Check Now" button - executes this function
  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Filter rooms based on total persons
    const filterRooms = roomData.filter((room) => total <= room.maxPerson);

    setTimeout(() => {
      setLoading(false);
      setRooms(filterRooms); // Refresh UI with new filtered rooms after 3 seconds
    }, 3000);
  };

  const shareWithChildren: RoomContextType = {
    rooms,
    loading,
    adults,
    setAdults,
    kids,
    setKids,
    handleCheck,
    resetRoomFilterData,
  };

  return <RoomInfo.Provider value={shareWithChildren}>{children}</RoomInfo.Provider>;
};

export const useRoomContext = (): RoomContextType => {
  const context = useContext(RoomInfo);
  if (context === undefined) {
    throw new Error("useRoomContext must be used within a RoomContext provider");
  }
  return context;
};
