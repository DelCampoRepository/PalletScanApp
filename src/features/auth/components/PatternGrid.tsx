import { useCallback, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const GRID_SIZE = 3;
const CANVAS_SIZE = 240;
const DOT_RADIUS = 10;
const HIT_RADIUS = 24; // qué tan cerca del punto debe pasar el dedo para "activarlo"
const PADDING = 40;

interface Dot {
  id: number;
  x: number;
  y: number;
}

function getDotPositions(): Dot[] {
  const positions: Dot[] = [];
  const spacing = (CANVAS_SIZE - PADDING * 2) / (GRID_SIZE - 1);
  let id = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      positions.push({ id, x: PADDING + col * spacing, y: PADDING + row * spacing });
      id++;
    }
  }
  return positions;
}

const DOTS = getDotPositions();

interface PatternGridProps {
  // Se llama cuando el usuario suelta el dedo, con la lista de puntos
  // tocados en orden (ej. [0, 4, 8]). Lista vacía = no tocó ningún punto.
  onComplete: (pattern: number[]) => void;
}

export function PatternGrid({ onComplete }: PatternGridProps) {
  const [activeIds, setActiveIds] = useState<number[]>([]);
  const [fingerPos, setFingerPos] = useState<{ x: number; y: number } | null>(null);

  const findNearestDot = useCallback((x: number, y: number): number | null => {
    for (const dot of DOTS) {
      const distance = Math.hypot(dot.x - x, dot.y - y);
      if (distance < HIT_RADIUS) return dot.id;
    }
    return null;
  }, []);

  const handleStart = useCallback(() => {
    setActiveIds([]);
  }, []);

  const handleMove = useCallback(
    (x: number, y: number) => {
      setFingerPos({ x, y });
      const id = findNearestDot(x, y);
      if (id !== null) {
        setActiveIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }
    },
    [findNearestDot],
  );

  const handleEnd = useCallback(() => {
    setFingerPos(null);
    setActiveIds((prev) => {
      onComplete(prev);
      return prev; // se limpia después, cuando quien use este componente decida (correcto/incorrecto)
    });
  }, [onComplete]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      runOnJS(handleStart)();
    })
    .onTouchesMove((event) => {
      const touch = event.changedTouches[0];
      if (touch) {
        runOnJS(handleMove)(touch.x, touch.y);
      }
    })
    .onFinalize(() => {
      runOnJS(handleEnd)();
    });

  const lastActiveDot = activeIds.length > 0 ? DOTS[activeIds[activeIds.length - 1]] : null;

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          {/* Líneas entre los puntos ya conectados */}
          {activeIds.slice(1).map((id, index) => {
            const from = DOTS[activeIds[index]];
            const to = DOTS[id];
            return (
              <Line
                key={`line-${id}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#3B82F6"
                strokeWidth={4}
              />
            );
          })}

          {/* Línea "viva" que sigue al dedo hasta el último punto tocado */}
          {fingerPos && lastActiveDot && (
            <Line
              x1={lastActiveDot.x}
              y1={lastActiveDot.y}
              x2={fingerPos.x}
              y2={fingerPos.y}
              stroke="#3B82F6"
              strokeWidth={4}
            />
          )}

          {/* Los puntos, en gris o azul según si ya se tocaron */}
          {DOTS.map((dot) => (
            <Circle
              key={dot.id}
              cx={dot.x}
              cy={dot.y}
              r={DOT_RADIUS}
              fill={activeIds.includes(dot.id) ? '#3B82F6' : '#D1D5DB'}
              stroke="#9CA3AF"
              strokeWidth={2}
            />
          ))}
        </Svg>
      </View>
    </GestureDetector>
  );
}