import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";

const CONFETTI_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#F97316", "#06B6D4"];
const PIECE_COUNT = 42;

interface PieceState {
  x: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  color: string;
  width: number;
  height: number;
}

interface Props {
  visible: boolean;
}

export default function ConfettiOverlay({ visible }: Props) {
  const { width, height } = useWindowDimensions();

  const pieces = useRef<PieceState[]>(
    Array.from({ length: PIECE_COUNT }, (_, i) => ({
      x: Math.random() * width,
      translateY: new Animated.Value(-30),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotation: new Animated.Value(Math.random() * 180),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      width: Math.random() * 7 + 5,
      height: Math.random() * 5 + 3,
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    pieces.forEach((piece) => {
      const delay = Math.random() * 400;
      const duration = 1800 + Math.random() * 1200;
      const drift = (Math.random() - 0.5) * 120;
      const targetRotation = Math.random() * 540 + 180;

      piece.translateY.setValue(-30);
      piece.translateX.setValue(0);
      piece.opacity.setValue(1);
      piece.rotation.setValue(Math.random() * 180);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(piece.translateY, {
            toValue: height + 80,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(piece.translateX, {
            toValue: drift,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotation, {
            toValue: targetRotation,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(duration * 0.65),
            Animated.timing(piece.opacity, {
              toValue: 0,
              duration: duration * 0.35,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => {
        const spin = piece.rotation.interpolate({
          inputRange: [0, 720],
          outputRange: ["0deg", "720deg"],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: piece.x,
              top: 0,
              width: piece.width,
              height: piece.height,
              backgroundColor: piece.color,
              borderRadius: 2,
              opacity: piece.opacity,
              transform: [
                { translateY: piece.translateY },
                { translateX: piece.translateX },
                { rotate: spin },
              ],
            }}
          />
        );
      })}
    </View>
  );
}
