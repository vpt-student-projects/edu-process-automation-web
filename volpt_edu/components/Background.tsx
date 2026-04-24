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

    float grid(vec2 uv, float size) {
        vec2 g = abs(fract(uv * size) - 0.5);
        float line = min(g.x, g.y);
        return 1.0 - smoothstep(0.0, 0.015, line);
      }

    void main() {
         vec2 uv = gl_FragCoord.xy / iResolution.xy;
         float aspect = iResolution.x / iResolution.y;
         vec2 suv = vec2(uv.x * aspect, uv.y);
         // Светлый фон: почти белый с чуть голубоватым оттенком
        vec3 bg = vec3(0.921, 0.937, 0.957);

        // Мелкая сетка — очень тонкая, едва заметная
        float smallGrid = grid(suv, 30.0) * 0.09;

        // Крупная сетка — чуть заметнее
        float gridSize = 10.0;
        float largeGrid = grid(suv, gridSize) * 0.15;

        // Медленное плавное мерцание крупной сетки
        float pulse = sin(iTime * 2.0) * 0.5 + 0.5;
        largeGrid *= 0.85 + pulse * 0.08;

        // Узлы на пересечениях крупной сетки
        vec2 nodeUv = fract(suv * gridSize) - 0.5;
        float nodeDist = length(nodeUv);
        float nodePulse = sin(iTime * 2.0 + floor(suv.x * gridSize) * 5.0 + floor(suv.y * gridSize) * 2.1) * 0.5 + 0.5;
        float node = smoothstep(0.07, 0.04, nodeDist) * nodePulse * 0.18;

        // Диагональный мягкий свет сверху-слева
        float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - vec2(0.2, 0.85)));
        float glow = vignette * 0.01;

        // Аккент: очень лёгкий синеватый тон в верхнем углу
        vec3 accentColor = vec3(0.78, 0.87, 0.98);
        float accentStrength = smoothstep(1.0, 0.0, length(uv - vec2(0.0, 1.0)) * 1.6) * 0.08;

        vec3 gridColor = vec3(0.62, 0.67, 0.76);
        vec3 nodeColor = vec3(0.45, 0.55, 0.72);

        vec3 col = bg;
        col = mix(col, accentColor, accentStrength);
        col = mix(col, gridColor, smallGrid + largeGrid);
        col = mix(col, nodeColor, node);
        col += glow * 0.5;

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
   `;
const Background: React.FC = () => {
    type UniformLocations = {
        iResolution: WebGLUniformLocation | null;
        iTime: WebGLUniformLocation | null;
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(Date.now());
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const uniformLocationsRef = useRef<UniformLocations>({
        iResolution: null,
        iTime: null,
    });

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
        <div className="fixed inset-0 z-[-1] w-full h-full bg-[#ebeff4]">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

export default Background;
