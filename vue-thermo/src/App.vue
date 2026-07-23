<template>
  <main class="container">
    <h1>Group Measurement</h1>

    <section class="date-controls">
      <label for="date-picker">Score date:</label>
      <select id="date-picker" v-model="selectedDate" @change="onDateChange">
        <option v-for="date in availableDates" :key="date" :value="date">
          {{ formatDate(date) }}{{ date === todayKey ? ' (vandaag)' : '' }}
        </option>
      </select>
    </section>

    <p>Number of submissions: <strong>{{ totalVotes }}</strong></p>

    <section class="thermometers-grid">
      <Thermometer label="Workload" :score="scores.workload">
        What is the group's workload like?
      </Thermometer>
      <Thermometer label="Focus Time" :score="scores.focusTime">
        What is the group's focus time like?
      </Thermometer>
      <Thermometer label="Context Switching" :score="scores.contextSwitching">
        How often does the group switch contexts?
      </Thermometer>
      <Thermometer label="Morale" :score="scores.morale">
        What is the group's morale level?
      </Thermometer>
      <Thermometer label="Happiness" :score="scores.happiness">
        What is the group's happiness level?
      </Thermometer>
      <Thermometer label="Work environment" :score="scores.stress">
        What is your work environment like?
      </Thermometer>
    </section>

    <section v-if="canVote && !hasVoted" class="vote-form">
      <h2>Your rating (1 = Low, 5 = High)</h2>

      <div v-for="(val, topic) in myVote" :key="topic" class="input-group">
        <label>{{ formatLabel(topic) }}: {{ val }}</label>
        <input type="range" min="1" max="5" v-model.number="myVote[topic]" />
      </div>

      <button @click="sendVote" class="btn-primary">Submit anonymously</button>
    </section>

    <div v-else-if="canVote && hasVoted" class="thank-you">
      <p>Scale 1 = low to 5 = high</p>
      <p>Thank you! Your vote has been submitted anonymously.</p>
    </div>

    <div v-else class="historic-note">
      <p>You are viewing historical data. Voting is only possible for today.</p>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { io } from 'socket.io-client';
import Thermometer from './components/Thermometer.vue';

const socket = io();

const hasVoted = ref(false);
const totalVotes = ref(0);
const canVote = ref(true);
const selectedDate = ref('');
const todayKey = ref('');
const availableDates = ref([]);

const scores = reactive({
  workload: 0,
  focusTime: 0,
  contextSwitching: 0,
  morale: 0,
  happiness: 0,
  stress: 0
});

const myVote = reactive({
  workload: 3,
  focusTime: 3,
  contextSwitching: 3,
  morale: 3,
  happiness: 3,
  stress: 3
});

function applyScores(data) {
  Object.assign(scores, data.averages);
  totalVotes.value = data.totalVotes;
  canVote.value = data.canVote;
}

onMounted(() => {
  socket.on('update-scores', (data) => {
    todayKey.value = data.today;
    availableDates.value = data.availableDates;

    if (!selectedDate.value) {
      selectedDate.value = data.date;
      applyScores(data);
      return;
    }

    if (data.date === selectedDate.value) {
      applyScores(data);
    }
  });
});

onUnmounted(() => {
  socket.disconnect();
});

const sendVote = () => {
  if (!canVote.value) {
    return;
  }

  socket.emit('submit-vote', { ...myVote });
  hasVoted.value = true;
};

const onDateChange = () => {
  hasVoted.value = false;
  socket.emit('get-scores', { date: selectedDate.value });
};

const formatLabel = (key) => {
  const labels = {
    workload: 'Workload',
    focusTime: 'Focus time',
    contextSwitching: 'Context switching',
    morale: 'Morale',
    stress: 'Work environment',
    happiness: 'Happiness'
  };
  return labels[key] || key;
};

const formatDate = (dateKey) => {
  const [year, month, day] = dateKey.split('-');
  return `${day}-${month}-${year}`;
};
</script>

<style scoped>
.container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
}

.date-controls {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  align-items: center;
  margin: 1rem 0 1.5rem;
}

.date-controls select {
  padding: 0.35rem 0.5rem;
}

.thermometers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.vote-form {
  background: #ffffff;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.input-group {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-group input {
  width: 60%;
}

button {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #42b883;
  color: white;
  font-weight: bold;
}

.thank-you {
  margin-top: 2rem;
  color: #42b883;
  font-weight: bold;
}

.historic-note {
  margin-top: 2rem;
  color: #555;
}
</style>
