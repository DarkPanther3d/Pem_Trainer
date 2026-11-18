import React, { useState } from "react";

export default function BrandLogo({ className = "w-10 h-10" }) {
  const [src, setSrc] = useState("/logo.svg");
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (src === "/logo.svg") {
      setSrc("/logo.png");
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div
        className={`${className} rounded-xl bg-blue-600 text-white font-extrabold text-xs tracking-tighter flex items-center justify-center shadow-md shadow-blue-600/30 select-none shrink-0`}
      >
        PEM
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Logo PEM Trainer"
      onError={handleError}
      className={`${className} object-contain rounded-xl shrink-0`}
    />
  );
}