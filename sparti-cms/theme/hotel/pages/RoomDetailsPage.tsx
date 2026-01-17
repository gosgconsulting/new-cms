import React from "react";
import { useRoomContext } from "../context/RoomContext";
import { hotelRules } from "../data/constants";
import { FaCheck } from "react-icons/fa";
import CheckIn from "../components/booking/CheckIn";
import CheckOut from "../components/booking/CheckOut";
import AdultsDropdown from "../components/booking/AdultsDropdown";
import KidsDropdown from "../components/booking/KidsDropdown";
import ScrollToTop from "../utils/ScrollToTop";
import type { RoomDetailsPageProps } from "../types";

const RoomDetailsPage: React.FC<RoomDetailsPageProps> = ({ roomId }) => {
  const { rooms } = useRoomContext();

  const room = rooms.find((room) => room.id === +roomId);

  if (!room) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="h2">Room not found</h2>
          <p>The room you are looking for does not exist.</p>
        </div>
      </section>
    );
  }

  const { name, description, facilities, price, imageLg } = room;

  return (
    <section>
      <ScrollToTop />

      <div className="bg-room h-[560px] relative flex justify-center items-center bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70" />
        <h1 className="text-6xl text-white z-20 font-primary text-center">
          {name} Details
        </h1>
      </div>

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row lg:gap-x-8 h-full py-24">
          {/* Left side */}
          <div className="w-full lg:w-[60%] h-full text-justify">
            <h2 className="h2">{name}</h2>
            <p className="mb-8">{description}</p>
            <img className="mb-8" src={imageLg} alt={name} />

            <div className="mt-12">
              <h3 className="h3 mb-3">Room Facilities</h3>
              <p className="mb-12">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Blanditiis accusantium sapiente quas quos explicabo, odit
                nostrum? Reiciendis illum dolor eos dicta. Illum vero at hic
                nostrum sint et quod porro.
              </p>

              {/* Icons grid */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                {facilities.map((item, index) => (
                  <div key={index} className="flex items-center gap-x-3 flex-1">
                    <div className="text-3xl text-accent">
                      <item.icon />
                    </div>
                    <div className="text-base">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-[40%] h-full">
            {/* Reservation */}
            <div className="py-8 px-6 bg-accent/20 mb-12">
              <div className="flex flex-col space-y-4 mb-4">
                <h3>Your Reservation</h3>
                <div className="h-[60px]">
                  <CheckIn />
                </div>
                <div className="h-[60px]">
                  <CheckOut />
                </div>
                <div className="h-[60px]">
                  <AdultsDropdown />
                </div>
                <div className="h-[60px]">
                  <KidsDropdown />
                </div>
              </div>

              <button className="btn btn-lg btn-primary w-full">
                book now for ${price}
              </button>
            </div>

            <div>
              <h3 className="h3">Hotel Rules</h3>
              <p className="mb-6 text-justify">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi
                dolores iure fugiat eligendi illo est, aperiam quasi distinctio
                necessitatibus suscipit nemo provident eaque voluptas earum.
              </p>

              <ul className="flex flex-col gap-y-4">
                {hotelRules.map(({ rules }, idx) => (
                  <li key={idx} className="flex items-center gap-x-4">
                    <FaCheck className="text-accent" />
                    {rules}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomDetailsPage;