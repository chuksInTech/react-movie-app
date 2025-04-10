
const Spinner = () => {
  const text = 'Loading';
  const orbitSpeed = 1;
  const satelliteCount = 5;
  const size = 'md';
  
  
  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };
  
  // Color definition for green
  const colorStyle = {
    primary: 'border-green-500',
    secondary: 'bg-green-500',
    text: 'text-green-500'
  };
  
  
  // Calculate satellite positions
  const renderSatellites = () => {
    const satelliteElements = [];
    const sizes = [3, 4, 5]; // Varying satellite sizes
    
    for (let i = 0; i < satelliteCount; i++) {
      const satelliteSize = sizes[i % sizes.length];
      
      satelliteElements.push(
        <div 
          key={i}
          className={`absolute rounded-full ${colorStyle.secondary}`}
          style={{
            width: `${satelliteSize}px`,
            height: `${satelliteSize}px`,
            animation: `orbitAnimation${i} ${orbitSpeed}s infinite linear`,
            opacity: 0.8 - (i * 0.15)
          }}
        />
      );
    }
    
    return satelliteElements;
  };
  
  const getOrbitDistance = (sizeKey, orbitIndex) => {
    const baseSizes = {
      xs: 8,
      sm: 14,
      md: 22,
      lg: 32,
      xl: 42
    };
    
    // Add some variation based on orbit index
    const variations = [1, 1.2, 0.9];
    return Math.round(baseSizes[sizeKey] * variations[orbitIndex % variations.length]);
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} mt-8 relative`}>
        {/* Main orbit ring */}
        <div className="absolute w-full h-full rounded-full border-2 border-gray-200 opacity-30"></div>
        
        {/* Rotating orbit ring */}
        <div 
          className={`absolute w-full h-full rounded-full border-t-4 ${colorStyle.primary} animate-spin`} 
          style={{ animationDuration: `${orbitSpeed}s` }}
        ></div>
        
        {/* Central hub */}
        <div className={`absolute w-1/4 h-1/4 rounded-full ${colorStyle.secondary} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}></div>
        
        {/* Orbiting satellites */}
        {renderSatellites()}
        
        {/* Additional orbit rings */}
        <div className="absolute w-3/4 h-3/4 rounded-full border border-gray-200 opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-1/2 h-1/2 rounded-full border border-gray-200 opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {text && <p className={`mt-4 text-sm font-medium ${colorStyle.text}`}>{text}</p>}
      
      <style jsx>{`
        @keyframes orbitAnimation0 {
          from { transform: rotate(0deg) translateX(${getOrbitDistance(size, 0)}px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(${getOrbitDistance(size, 0)}px) rotate(-360deg); }
        }
        @keyframes orbitAnimation1 {
          from { transform: rotate(120deg) translateX(${getOrbitDistance(size, 1)}px) rotate(-120deg); }
          to { transform: rotate(480deg) translateX(${getOrbitDistance(size, 1)}px) rotate(-480deg); }
        }
        @keyframes orbitAnimation2 {
          from { transform: rotate(240deg) translateX(${getOrbitDistance(size, 2)}px) rotate(-240deg); }
          to { transform: rotate(600deg) translateX(${getOrbitDistance(size, 2)}px) rotate(-600deg); }
        }
        @keyframes orbitAnimation3 {
          from { transform: rotate(90deg) translateX(${getOrbitDistance(size, 0) - 2}px) rotate(-90deg); }
          to { transform: rotate(450deg) translateX(${getOrbitDistance(size, 0) - 2}px) rotate(-450deg); }
        }
        @keyframes orbitAnimation4 {
          from { transform: rotate(180deg) translateX(${getOrbitDistance(size, 1) - 3}px) rotate(-180deg); }
          to { transform: rotate(540deg) translateX(${getOrbitDistance(size, 1) - 3}px) rotate(-540deg); }
        }
      `}</style>
    </div>
  );
};

export default Spinner;