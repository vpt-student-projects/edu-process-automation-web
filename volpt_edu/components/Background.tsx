"use client";

import React, { useRef, useEffect } from "react";

const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0, 1);
    }
  `;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform float uSpeed;
    uniform float uDensity;
    uniform float uPointSize;

    // Pseudo-random function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      // Coordinate normalization
      vec2 uv = gl_FragCoord.xy / iResolution.y;

      // Theme Adaptation: Dark Mode
      // Background: Dark Slate (#0f172a)
      vec3 bgColor = vec3(0.922, 0.937, 0.957);

      // Point Color: Soft Blue-Grey
      vec3 pointColor = vec3(0.24, 0.31, 0.38);

      // Grid Logic
      vec2 gridUv = uv * uDensity;
      vec2 ipos = floor(gridUv); // Cell ID
      vec2 fpos = fract(gridUv); // Intra-cell coordinates

      // Flicker Animation
      float t = iTime * uSpeed;
      float blink = sin(t + random(ipos) * 6.28) * 0.5 + 0.5;

      // Draw Circle in center of cell
      float dist = distance(fpos, vec2(0.5));

      // Soft edge circle
      float mask = smoothstep(uPointSize, uPointSize - 0.05, dist);

      // Apply blink to the mask
      mask *= blink * 0.6;

      vec3 finalCol = mix(bgColor, pointColor, mask);

      gl_FragColor = vec4(finalCol, 1.0);
    }
  `;
const Background: React.FC = () => {
    type UniformLocations = {
        iResolution: WebGLUniformLocation | null;
        iTime: WebGLUniformLocation | null;
        uSpeed: WebGLUniformLocation | null;
        uDensity: WebGLUniformLocation | null;
        uPointSize: WebGLUniformLocation | null;
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(Date.now());
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const uniformLocationsRef = useRef<UniformLocations>({
        iResolution: null,
        iTime: null,
        uSpeed: null,
        uDensity: null,
        uPointSize: null,
    });

    // Config defaults adapted from user's specifications
    const speed = 4;
    const density = 50.0;
    const pointSize = 0.08;

    useEffect(() => {
        startTimeRef.current = Date.now();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl =
            canvas.getContext("webgl") ||
            (canvas.getContext("experimental-webgl") as WebGLRenderingContext);
        if (!gl) return;
        glRef.current = gl;

        const createShader = (
            gl: WebGLRenderingContext,
            type: number,
            source: string,
        ) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vs || !fs) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);
        programRef.current = program;

        const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW,
        );

        const posLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        uniformLocationsRef.current = {
            iResolution: gl.getUniformLocation(program, "iResolution"),
            iTime: gl.getUniformLocation(program, "iTime"),
            uSpeed: gl.getUniformLocation(program, "uSpeed"),
            uDensity: gl.getUniformLocation(program, "uDensity"),
            uPointSize: gl.getUniformLocation(program, "uPointSize"),
        };

        const handleResize = () => {
            if (!canvas || !gl) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        const render = () => {
            if (!gl || !programRef.current) return;
            const uniforms = uniformLocationsRef.current;
            const time = (Date.now() - startTimeRef.current) / 1000;

            gl.uniform2f(uniforms.iResolution, canvas.width, canvas.height);
            gl.uniform1f(uniforms.iTime, time);
            gl.uniform1f(uniforms.uSpeed, speed);
            gl.uniform1f(uniforms.uDensity, density);
            gl.uniform1f(uniforms.uPointSize, pointSize);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] w-full h-full bg-[#0f172a]">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

export default Background;
