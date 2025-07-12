// src/components/Gallery.tsx
import React, { useEffect, useState } from "react";

export function Gallery() {
  const [artifacts, setArtifacts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/artifacts?public=true")
      .then(r => r.json())
      .then(setArtifacts);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Public Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artifacts.map(a => (
          <div key={a.id} className="border rounded p-4 flex flex-col items-center">
            <img src={`/api/avatar/${a.avatarSeed || a.id}`} width={48} height={48} alt="avatar" className="mb-2 rounded" />
            <div className="font-semibold">{a.title || a.name}</div>
            <div className="text-xs text-gray-500">{a.language}</div>
            <div className="flex gap-2 mt-2">
              <button className="text-blue-600">View</button>
              <button className="text-yellow-600">Star</button>
              <button className="text-green-600">Like</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
