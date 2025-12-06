"use client";

import { FC } from "react";

interface LocationButtonProps {
  onClick: () => void;
  loading?: boolean;
  title?: string;
  className?: string;
  size?: number;
}

const AstronautLoader: FC<{ size: number }> = ({ size }) => {
  // Animation keyframe pour l'astronaute - on le définit en CSS inline
  const astronautKeyframes = `
    @keyframes astronautSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Taille de base pour l'astronaute, légèrement plus petite que le bouton
  const astronautSize = size * 0.8;
  
  return (
    <>
      {/* Ajouter les keyframes via une balise style */}
      <style jsx>{astronautKeyframes}</style>
      
      <div
        style={{
          width: `${astronautSize}px`,
          height: `${astronautSize}px`,
          position: 'relative',
          animation: 'astronautSpin 5s linear infinite'
        }}
      >
        {/* Schoolbag */}
        <div
          style={{
            width: `${astronautSize * 0.4}px`,
            height: `${astronautSize * 0.6}px`,
            position: 'absolute',
            zIndex: 1,
            top: `${astronautSize * 0.3}px`,
            left: `${astronautSize * 0.3}px`,
            backgroundColor: '#94b7ca',
            borderRadius: '50px 50px 0 0 / 30px 30px 0 0'
          }}
        />

        {/* Head */}
        <div
          style={{
            width: `${astronautSize * 0.388}px`,
            height: `${astronautSize * 0.32}px`,
            position: 'absolute',
            zIndex: 3,
            background: 'linear-gradient(90deg, #e3e8eb 0%, #e3e8eb 50%, #fbfdfa 50%, #fbfdfa 100%)',
            borderRadius: '50%',
            top: `${astronautSize * 0.13}px`,
            left: `${astronautSize * 0.306}px`
          }}
        >
          {/* Visor */}
          <div
            style={{
              content: "",
              width: `${astronautSize * 0.24}px`,
              height: `${astronautSize * 0.2}px`,
              position: 'absolute',
              top: `${astronautSize * 0.06}px`,
              left: `${astronautSize * 0.074}px`,
              background: 'linear-gradient(180deg, #15aece 0%, #15aece 50%, #0391bf 50%, #0391bf 100%)',
              borderRadius: '15px'
            }}
          />

          {/* Ear pieces */}
          <div
            style={{
              content: "",
              width: `${astronautSize * 0.048}px`,
              height: `${astronautSize * 0.1}px`,
              position: 'absolute',
              top: `${astronautSize * 0.11}px`,
              left: `-${astronautSize * 0.016}px`,
              backgroundColor: '#618095',
              borderRadius: '5px',
              boxShadow: `${astronautSize * 0.368}px 0px 0px #618095`
            }}
          />
        </div>

        {/* Body */}
        <div
          style={{
            width: `${astronautSize * 0.34}px`,
            height: `${astronautSize * 0.4}px`,
            position: 'absolute',
            zIndex: 2,
            borderRadius: '40px / 20px',
            top: `${astronautSize * 0.42}px`,
            left: `${astronautSize * 0.33}px`,
            background: 'linear-gradient(90deg, #e3e8eb 0%, #e3e8eb 50%, #fbfdfa 50%, #fbfdfa 100%)'
          }}
        >
          {/* Panel */}
          <div
            style={{
              width: `${astronautSize * 0.24}px`,
              height: `${astronautSize * 0.16}px`,
              position: 'absolute',
              top: `${astronautSize * 0.08}px`,
              left: `${astronautSize * 0.05}px`,
              backgroundColor: '#b7cceb'
            }}
          >
            {/* Panel lines */}
            <div
              style={{
                content: "",
                width: `${astronautSize * 0.12}px`,
                height: `${astronautSize * 0.02}px`,
                position: 'absolute',
                top: `${astronautSize * 0.036}px`,
                left: `${astronautSize * 0.028}px`,
                backgroundColor: '#fbfdfa',
                boxShadow: `0px ${astronautSize * 0.036}px 0px #fbfdfa, 0px ${astronautSize * 0.072}px 0px #fbfdfa`
              }}
            />

            {/* Panel buttons */}
            <div
              style={{
                content: "",
                width: `${astronautSize * 0.032}px`,
                height: `${astronautSize * 0.032}px`,
                position: 'absolute',
                top: `${astronautSize * 0.036}px`,
                right: `${astronautSize * 0.028}px`,
                backgroundColor: '#fbfdfa',
                borderRadius: '50%',
                boxShadow: `0px ${astronautSize * 0.056}px 0px 2px #fbfdfa`
              }}
            />
          </div>
        </div>

        {/* Left Arm */}
        <div
          style={{
            width: `${astronautSize * 0.32}px`,
            height: `${astronautSize * 0.12}px`,
            position: 'absolute',
            top: `${astronautSize * 0.484}px`,
            left: `${astronautSize * 0.12}px`,
            zIndex: 2,
            backgroundColor: '#e3e8eb',
            borderRadius: '0 0 0 39px'
          }}
        >
          <div
            style={{
              content: "",
              width: `${astronautSize * 0.12}px`,
              height: `${astronautSize * 0.28}px`,
              position: 'absolute',
              top: `-${astronautSize * 0.16}px`,
              borderRadius: '50px 50px 0px 120px / 50px 50px 0 110px',
              left: 0,
              backgroundColor: '#e3e8eb'
            }}
          />
          <div
            style={{
              content: "",
              width: `${astronautSize * 0.12}px`,
              height: `${astronautSize * 0.04}px`,
              position: 'absolute',
              top: `-${astronautSize * 0.096}px`,
              backgroundColor: '#6e91a4',
              left: 0
            }}
          />
        </div>

        {/* Right Arm */}
        <div
          style={{
            width: `${astronautSize * 0.32}px`,
            height: `${astronautSize * 0.12}px`,
            position: 'absolute',
            top: `${astronautSize * 0.484}px`,
            right: `${astronautSize * 0.12}px`,
            zIndex: 2,
            backgroundColor: '#fbfdfa',
            borderRadius: '0 0 39px 0'
          }}
        >
          <div
            style={{
              content: "",
              width: `${astronautSize * 0.12}px`,
              height: `${astronautSize * 0.28}px`,
              position: 'absolute',
              top: `-${astronautSize * 0.16}px`,
              borderRadius: '50px 50px 120px 0 / 50px 50px 110px 0',
              right: 0,
              backgroundColor: '#fbfdfa'
            }}
          />
          <div
            style={{
              content: "",
              width: `${astronautSize * 0.12}px`,
              height: `${astronautSize * 0.04}px`,
              position: 'absolute',
              top: `-${astronautSize * 0.096}px`,
              right: 0,
              backgroundColor: '#b6d2e0'
            }}
          />
        </div>

        {/* Left Leg */}
        <div
          style={{
            width: `${astronautSize * 0.12}px`,
            height: `${astronautSize * 0.16}px`,
            position: 'absolute',
            zIndex: 2,
            bottom: `${astronautSize * 0.12}px`,
            left: `${astronautSize * 0.30}px`,
            backgroundColor: '#e3e8eb',
            transform: 'rotate(20deg)'
          }}
        >
          <div
            style={{
              content: "",
              width: `${astronautSize * 0.2}px`,
              height: `${astronautSize * 0.1}px`,
              position: 'absolute',
              bottom: `-${astronautSize * 0.1}px`,
              left: `-${astronautSize * 0.08}px`,
              backgroundColor: '#e3e8eb',
              borderRadius: '30px 0 0 0',
              borderBottom: `${astronautSize * 0.04}px solid #6d96ac`
            }}
          />
        </div>

        {/* Right Leg */}
        <div
          style={{
            width: `${astronautSize * 0.12}px`,
            height: `${astronautSize * 0.16}px`,
            position: 'absolute',
            zIndex: 2,
            bottom: `${astronautSize * 0.12}px`,
            right: `${astronautSize * 0.30}px`,
            backgroundColor: '#fbfdfa',
            transform: 'rotate(-20deg)'
          }}
        >
          <div
            style={{
              content: "",
              width: `${astronautSize * 0.2}px`,
              height: `${astronautSize * 0.1}px`,
              position: 'absolute',
              bottom: `-${astronautSize * 0.1}px`,
              right: `-${astronautSize * 0.08}px`,
              backgroundColor: '#fbfdfa',
              borderRadius: '0 30px 0 0',
              borderBottom: `${astronautSize * 0.04}px solid #b0cfe4`
            }}
          />
        </div>
      </div>
    </>
  );
};

// Le composant bouton de localisation avec les mêmes styles que la loupe de InputSearch
const LocationButton: FC<LocationButtonProps> = ({ 
  onClick, 
  loading = false, 
  title = "Utiliser ma position actuelle", 
  className = "",
  size = 40
}) => {
  const handleClick = () => {
    // Vibration haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`bg-purple text-white rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-white hover:text-purple disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${className}`}
      title={title}
      style={{ 
        width: `${size}px`, 
        height: `${size}px` 
      }}
    >
      {loading ? (
        <AstronautLoader size={size} />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          {/* Icône GPS/Localisation */}
          <path 
            fillRule="evenodd" 
            d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
    </button>
  );
};

export default LocationButton;
