import React, {createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type Region = 'US' | 'DE';

interface RegionContextProp {
    region: Region;
    setRegion: (r: Region) => void;
}

const RegionContext = createContext<RegionContextProp | undefined> ( undefined );

export const RegionProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [region, setRegion] = useState<Region>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('region')
      if (saved === 'DE' || saved === 'US') {
        return saved as Region
      }
    }
    return 'US'
  })

  useEffect(() => {
    try {
      localStorage.setItem('region', region)
    } catch {
    }
  }, [region])

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  )
}

export const useRegion = (): RegionContextProp => {
    const context = useContext(RegionContext);
    if (!context) 
        throw new Error('useRegion must be inside a RegionProvider')
    
    return context;
};