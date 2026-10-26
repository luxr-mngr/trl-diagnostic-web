
import React from 'react';

/**
 * Decorative only. Solid shapes are hidden below `md` because at phone widths
 * the content spans the full viewport and the shapes land on top of the text.
 */
const BackgroundShapes: React.FC = () => {
  return (
    <>
      {/* Top Left Circle */}
      <div className="shape hidden md:block border-[2px] border-[#00AEEF] rounded-full w-48 h-48 -top-12 -left-12"></div>

      {/* Middle Left Cyan Circle */}
      <div className="shape hidden md:block bg-[#00AEEF] rounded-full w-24 h-24 top-1/4 -left-12 opacity-80"></div>

      {/* Top Right Pink Circle */}
      <div className="shape hidden md:block bg-[#E91E63] rounded-full w-32 h-32 top-10 right-20 opacity-80"></div>

      {/* Bottom Right Shape */}
      <div className="shape hidden md:block border-[2px] border-[#E91E63] w-20 h-20 bottom-10 right-10">
        <div className="absolute -top-1 -left-1 border-[2px] border-[#E91E63] w-10 h-10"></div>
      </div>

      {/* Scattered Dots and Small Squares */}
      <div className="shape hidden md:block bg-[#E91E63] rounded-full w-6 h-6 bottom-40 left-40"></div>
      <div className="shape hidden md:block bg-[#00AEEF] w-8 h-8 bottom-80 left-20"></div>

      {/* Soft tint — subtle enough to sit behind content at any size */}
      <div className="shape bg-[#FFD700] rounded-full w-[260px] h-[260px] md:w-[400px] md:h-[400px] top-1/2 right-0 opacity-[0.12] md:opacity-20 -translate-y-1/2 translate-x-1/2"></div>
    </>
  );
};

export default BackgroundShapes;
