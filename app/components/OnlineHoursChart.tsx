"use client";

import { useState } from "react";
import data from "../data/online-hours.json";
import styles from "./OnlineHoursChart.module.css";

const W = 900;
const H = 420;
const M = { top: 16, right: 24, bottom: 40, left: 48 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

const { dates, series } = data as {
  dates: string[];
  series: { name: string; values: (number | null)[] }[];
};

const yMax = Math.max(4, Math.ceil(Math.max(...series.flatMap((s) => s.values.filter((v): v is number => v !== null))) / 4) * 4);
const x = (i: number) => M.left + (i / (dates.length - 1)) * PW;
const y = (v: number) => M.top + PH - (v / yMax) * PH;

const fmt = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Split values into runs of consecutive non-null points so gaps stay gaps. */
function paths(values: (number | null)[]) {
  const runs: { i: number; v: number }[][] = [];
  let cur: { i: number; v: number }[] = [];
  values.forEach((v, i) => {
    if (v === null) {
      if (cur.length) runs.push(cur);
      cur = [];
    } else cur.push({ i, v });
  });
  if (cur.length) runs.push(cur);
  return runs;
}

export default function OnlineHoursChart() {
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [table, setTable] = useState(false);

  const toggle = (name: string) =>
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * PW;
    setHover(Math.max(0, Math.min(dates.length - 1, Math.round((px / PW) * (dates.length - 1)))));
  };

  const ticks = Array.from({ length: yMax / 4 + 1 }, (_, k) => k * 4);
  const xTicks = dates.map((_, i) => i).filter((i) => i % 7 === 0);

  return (
    <figure className={styles.chart}>
      <figcaption>
        <h2>Hours online per day</h2>
        <p>Daily total hours each device was connected. Gaps mean no data was collected that day.</p>
      </figcaption>

      <ul className={styles.legend}>
        {series.map((s, k) => (
          <li key={s.name}>
            <button
              type="button"
              aria-pressed={!hidden.has(s.name)}
              onClick={() => toggle(s.name)}
              style={{ ["--c" as string]: `var(--series-${k + 1})` }}
            >
              <span className={styles.swatch} />
              {s.name}
            </button>
          </li>
        ))}
      </ul>

      {table ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                {series.map((s) => (
                  <th key={s.name}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((d, i) => (
                <tr key={d}>
                  <td>{fmt(d)}</td>
                  {series.map((s) => (
                    <td key={s.name}>{s.values[i] ?? "–"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.plot}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart of daily hours online for each device">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className={t === 0 ? styles.axis : styles.grid} />
                <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className={styles.tick}>
                  {t}
                </text>
              </g>
            ))}
            <text transform={`translate(12 ${M.top + PH / 2}) rotate(-90)`} textAnchor="middle" className={styles.axisTitle}>
              Hours online
            </text>
            {xTicks.map((i) => (
              <text key={i} x={x(i)} y={H - 14} textAnchor="middle" className={styles.tick}>
                {fmt(dates[i])}
              </text>
            ))}

            {series.map((s, k) =>
              hidden.has(s.name)
                ? null
                : paths(s.values).map((run, r) => (
                    <g key={`${s.name}-${r}`} style={{ ["--c" as string]: `var(--series-${k + 1})` }}>
                      {run.length === 1 ? (
                        <circle cx={x(run[0].i)} cy={y(run[0].v)} r={3} className={styles.dot} />
                      ) : (
                        <polyline points={run.map((p) => `${x(p.i)},${y(p.v)}`).join(" ")} className={styles.line} />
                      )}
                    </g>
                  )),
            )}

            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + PH} className={styles.cross} />
                {series.map((s, k) => {
                  const v = s.values[hover];
                  if (v === null || hidden.has(s.name)) return null;
                  return (
                    <circle key={s.name} cx={x(hover)} cy={y(v)} r={4} className={styles.marker} style={{ ["--c" as string]: `var(--series-${k + 1})` }} />
                  );
                })}
              </g>
            )}
            <rect
              x={M.left}
              y={M.top}
              width={PW}
              height={PH}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>

          {hover !== null && (
            <div
              className={styles.tip}
              style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > dates.length / 2 ? "calc(-100% - 12px)" : "12px"})` }}
            >
              <strong>{fmt(dates[hover])}</strong>
              {series.map((s, k) =>
                hidden.has(s.name) ? null : (
                  <div key={s.name} className={styles.tipRow} style={{ ["--c" as string]: `var(--series-${k + 1})` }}>
                    <span className={styles.swatch} />
                    <span>{s.name}</span>
                    <span className={styles.val}>{s.values[hover] === null ? "no data" : `${s.values[hover]} h`}</span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}

      <button type="button" className={styles.toggle} onClick={() => setTable((t) => !t)}>
        {table ? "Show chart" : "Show as table"}
      </button>
    </figure>
  );
}
