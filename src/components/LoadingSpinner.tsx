import React from "react"

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <img
        src={"../Scrapify_logo.png"}
        alt={"logo"}
        className={`w-[100px] h-[100px] animate-spin`}
      />
    </div>
  )
}

export default LoadingSpinner
