import React, { useState, useEffect } from 'react';

interface PixelatedAvatarProps {
  seed: number;
  size: number;
}

const PixelatedAvatar: React.FC<PixelatedAvatarProps> = ({ seed, size }) => {
  const [gridSize] = useState(8);
  const [pixelSize] = useState(size / gridSize);
  const [colorPalette] = useState(['#ff6b6b', '#f9844a', '#fee440', '#90be6d', '#43aa8b', '#4d908e', '#577590', '#277da1']);
  const [backgroundColor] = useState('#f8f9fa');
  const [showGrid] = useState(false);
  const [symmetry] = useState('horizontal');
  const [avatarData, setAvatarData] = useState('');

  const generateGridData = () => {
    const pseudoRandom = (x: number, y: number, seed: number) => {
      const value = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
      return value - Math.floor(value);
    };

    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if ((symmetry === 'horizontal' && x >= gridSize / 2) ||
          (symmetry === 'vertical' && y >= gridSize / 2) ||
          (symmetry === 'both' && (x >= gridSize / 2 || y >= gridSize / 2))) {
          continue;
        }

        const randomValue = pseudoRandom(x, y, seed);
        const colorIndex = Math.floor(randomValue * colorPalette.length);
        grid[y][x] = colorPalette[colorIndex];

        if (symmetry === 'horizontal' || symmetry === 'both') {
          grid[y][gridSize - 1 - x] = grid[y][x];
        }
        if (symmetry === 'vertical' || symmetry === 'both') {
          grid[gridSize - 1 - y][x] = grid[y][x];
        }
        if (symmetry === 'both') {
          grid[gridSize - 1 - y][gridSize - 1 - x] = grid[y][x];
        }
      }
    }

    return grid;
  };

  const generateSVG = (grid: string[][]) => {
    const sizeValue = gridSize * pixelSize;
    let svgContent = `<svg width="${sizeValue}" height="${sizeValue}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">`;

    svgContent += `<rect width="${sizeValue}" height="${sizeValue}" fill="${backgroundColor}" />`;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const color = grid[y][x];
        svgContent += `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`;
      }
    }

    if (showGrid) {
      for (let i = 0; i <= gridSize; i++) {
        svgContent += `<line x1="0" y1="${i * pixelSize}" x2="${sizeValue}" y2="${i * pixelSize}" stroke="black" strokeWidth="0.5" opacity="0.3" />`;
        svgContent += `<line x1="${i * pixelSize}" y1="0" x2="${i * pixelSize}" y2="${sizeValue}" stroke="black" strokeWidth="0.5" opacity="0.3" />`;
      }
    }

    svgContent += '</svg>';
    return svgContent;
  };

  useEffect(() => {
    const grid = generateGridData();
    const svgContent = generateSVG(grid);
    setAvatarData(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`);
  }, [seed]);

  return (
    <img
      src={avatarData}
      alt="Pixelated Avatar"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default PixelatedAvatar;
