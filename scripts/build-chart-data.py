"""Build app/data/online-hours.json from data/device-connectivity.csv.

A device counts as online at a sample when its last_connected_at is within
ONLINE_WINDOW_MIN minutes of the sample time. The samples are about 15 minutes
apart, so each online sample counts as 0.25 hours. A day with no samples for a
device is null, which the chart draws as a gap.
"""
import csv, json, sys
from collections import defaultdict
from datetime import datetime, timedelta

ONLINE_WINDOW_MIN = 15
HOURS_PER_SAMPLE = 0.25

def parse(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))

hours = defaultdict(lambda: defaultdict(float))
seen = defaultdict(set)
with open(sys.argv[1], newline="") as f:
    for row in csv.DictReader(f):
        day = row["sampled_at_utc"][:10]
        name = row["device_name"]
        seen[name].add(day)
        lag = parse(row["sampled_at_utc"]) - parse(row["last_connected_at"])
        if lag <= timedelta(minutes=ONLINE_WINDOW_MIN):
            hours[name][day] += HOURS_PER_SAMPLE

days = sorted({d for s in seen.values() for d in s})
first, last = datetime.fromisoformat(days[0]), datetime.fromisoformat(days[-1])
dates = []
d = first
while d <= last:
    dates.append(d.date().isoformat())
    d += timedelta(days=1)

series = [
    {"name": n, "values": [round(hours[n][x], 2) if x in seen[n] else None for x in dates]}
    for n in sorted(seen)
]
json.dump({"dates": dates, "series": series}, open(sys.argv[2], "w"), separators=(",", ":"))
for s in series:
    v = [x for x in s["values"] if x is not None]
    print(s["name"], len(v), "days, max", max(v), "mean", round(sum(v)/len(v), 2))
