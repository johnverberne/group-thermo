const express = require('express');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');
const dataFilePath = path.join(__dirname, 'data', 'scores-by-day.json');
const topics = [
  'workload',
  'focusTime',
  'contextSwitching',
  'morale',
  'stress',
  'happiness'
];

app.use(express.json());
app.use(express.static(distPath));

function createEmptyVotes() {
  return topics.reduce((acc, topic) => {
    acc[topic] = [];
    return acc;
  }, {});
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sanitizeVotes(data) {
  const sanitized = {};

  topics.forEach((topic) => {
    const values = Array.isArray(data?.[topic]) ? data[topic] : [];
    sanitized[topic] = values.filter(
      (score) =>
        typeof score === 'number' &&
        Number.isFinite(score) &&
        score >= 1 &&
        score <= 5
    );
  });

  return sanitized;
}

function loadVotesByDay() {
  if (!fs.existsSync(dataFilePath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const loaded = {};
    Object.entries(parsed).forEach(([dateKey, dateVotes]) => {
      loaded[dateKey] = sanitizeVotes(dateVotes);
    });
    return loaded;
  } catch (error) {
    console.error('Kon scoredata niet laden, start met lege dataset.', error);
    return {};
  }
}

let votesByDay = loadVotesByDay();

function ensureDateBucket(dateKey) {
  if (!votesByDay[dateKey]) {
    votesByDay[dateKey] = createEmptyVotes();
  }
}

function persistVotesByDay() {
  const dataDir = path.dirname(dataFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const body = JSON.stringify(votesByDay, null, 2);
  fs.writeFileSync(dataFilePath, `${body}${os.EOL}`, 'utf8');
}

function getAvailableDates() {
  return Object.keys(votesByDay).sort((a, b) => b.localeCompare(a));
}

function getAveragesForDate(dateKey) {
  ensureDateBucket(dateKey);
  const votes = votesByDay[dateKey];
  const averages = {};

  for (const topic in votes) {
    const scores = votes[topic];

    if (scores.length === 0) {
      averages[topic] = 0;
    } else {
      const sum = scores.reduce((a, b) => a + b, 0);
      averages[topic] = Math.round((sum / scores.length) * 10) / 10;
    }
  }

  return {
    date: dateKey,
    today: getTodayKey(),
    availableDates: getAvailableDates(),
    averages,
    totalVotes: votes.workload.length,
    canVote: dateKey === getTodayKey()
  };
}

io.on('connection', (socket) => {
  console.log(`Client verbonden: ${socket.id}`);

  const todayKey = getTodayKey();
  ensureDateBucket(todayKey);
  persistVotesByDay();
  socket.emit('update-scores', getAveragesForDate(todayKey));

  socket.on('get-scores', ({ date } = {}) => {
    const requestedDate =
      typeof date === 'string' && date.trim().length > 0 ? date : getTodayKey();
    socket.emit('update-scores', getAveragesForDate(requestedDate));
  });

  socket.on('submit-vote', (data) => {
    if (!data || typeof data !== 'object') {
      return;
    }

    const dateKey = getTodayKey();
    ensureDateBucket(dateKey);

    topics.forEach((topic) => {
      const score = data[topic];

      if (
        typeof score === 'number' &&
        Number.isFinite(score) &&
        score >= 1 &&
        score <= 5
      ) {
        votesByDay[dateKey][topic].push(score);
      }
    });

    persistVotesByDay();
    io.emit('update-scores', getAveragesForDate(dateKey));
  });

  socket.on('reset-scores', () => {
    const dateKey = getTodayKey();
    votesByDay[dateKey] = createEmptyVotes();
    persistVotesByDay();
    io.emit('update-scores', getAveragesForDate(dateKey));
  });

  socket.on('disconnect', () => {
    console.log(`Client verbroken: ${socket.id}`);
  });
});

app.get(/^(?!\/socket\.io(?:\/|$)|\/api(?:\/|$)).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});