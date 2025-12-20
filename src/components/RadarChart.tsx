"use client"

import React from "react"
import { Group } from "@visx/group"
import { scaleLinear } from "@visx/scale"
import { Point } from "@visx/point"
import { Line, LineRadial } from "@visx/shape"

const blue = "#3b82f6"
const silver = "#d1d5db"

export interface RadarData {
  label: string
  [key: string]: string | number
}

const margin = { top: 40, left: 80, right: 80, bottom: 40 }

export function RadarChart({ width, height, data, keys }: { width: number, height: number, data: RadarData[], keys: string[] }) {
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom
  const radius = Math.min(xMax, yMax) / 2

  const radialScale = scaleLinear<number>({
    range: [0, radius],
    domain: [0, 1],
  })

  const getTheta = (index: number) => (index * 2 * Math.PI) / keys.length - Math.PI / 2

  const getPoint = (value: number, index: number) => {
    const theta = getTheta(index)
    const r = radialScale(value)
    return new Point({ x: r * Math.cos(theta), y: r * Math.sin(theta) })
  }

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <Group top={height / 2} left={width / 2}>
        {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
          <LineRadial
            key={`web-${r}`}
            data={keys}
            angle={(d, i) => getTheta(i)}
            radius={() => radialScale(r)}
            fill="none"
            stroke="white"
            strokeWidth={1}
            strokeOpacity={0.05}
            curve={undefined}
          />
        ))}
        {keys.map((key, i) => {
          const theta = getTheta(i)
          const x = radius * Math.cos(theta)
          const y = radius * Math.sin(theta)
          return (
            <React.Fragment key={`axis-${key}`}>
              <Line from={new Point({ x: 0, y: 0 })} to={new Point({ x, y })} stroke="white" strokeOpacity={0.1} />
              <text
                x={x * 1.2}
                y={y * 1.2}
                fontSize={10}
                fill="rgba(255,255,255,0.4)"
                textAnchor="middle"
                dy=".35em"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {key.toUpperCase()}
              </text>
            </React.Fragment>
          )
        })}
        {data.map((d, i) => {
          const points = keys.map((key, j) => getPoint(d[key] as number, j))
          return (
            <polygon
              key={`radar-${i}`}
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill={i === 0 ? blue : silver}
              fillOpacity={0.3}
              stroke={i === 0 ? blue : silver}
              strokeWidth={2}
            />
          )
        })}
      </Group>
    </svg>
  )
}
