import React, { useState } from 'react';

const DEFAULT_PROFILE_PIC = '/icons/profile.png';

export const Avatar = ({ src, alt, fallback, className = '' }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </div>
  );
};

export const AvatarImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(src || DEFAULT_PROFILE_PIC);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="w-full h-full object-cover rounded-full"
      onError={() => setImageSrc(DEFAULT_PROFILE_PIC)}
    />
  );
};

export const AvatarFallback = ({ children }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full">
      {children}
    </div>
  );
};