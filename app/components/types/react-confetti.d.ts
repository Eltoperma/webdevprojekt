declare module 'react-confetti' {
  import { Component } from 'react';

  interface ConfettiProps {
    width?: number;
    height?: number;
    numberOfPieces?: number;
    recycle?: boolean;
    colors?: string[];
    drawShape?: (ctx: CanvasRenderingContext2D) => void;
    gravity?: number;
    initialVelocityX?: number;
    initialVelocityY?: number;
    tweenDuration?: number;
    tweenFunction?: (t: number) => number;
    wind?: number;
  }

  export default class ReactConfetti extends Component<ConfettiProps> {}
} 