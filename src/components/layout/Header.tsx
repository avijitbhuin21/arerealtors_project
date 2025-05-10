import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div className="py-4 Header_Header__container__ZX38g">
      <div className="px-4 mx-auto Header_Header__brand__sztra max-w-7xl md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="block">
              <img
                src="/new_logo.png"
                alt="RealEstateAgents.com"
                className="w-[120px] md:w-[180px] h-auto mix-blend-screen brightness-200 contrast-200"
              />
            </Link>
            <img
              src="/Flag-United-States-of-America.webp"
              alt="USA Flag"
              className="w-[30px] md:w-[40px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
