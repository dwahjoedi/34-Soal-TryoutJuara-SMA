/**
 * Generic validator for IPS speed sets.
 * Usage: node validate-speed.js <path-to-json> <expected-tag>
 */
const fs = require('fs');
const path = require('path');

const [,, filePath, expectedTag] = process.argv;
if (!filePath || !expectedTag) {
  console.error('Usage: node validate-speed.js <file> <tag>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const tax = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'question-bank-metadata-taxonomy.json'), 'utf8'));
const ips = tax.subjects.ips;
const topicMap = {};
Object.values(ips.topics).forEach((t) => { topicMap[t.name] = t.subtopics; });
const validSkills = ips.skill_types.map((s) => s.value);
const validQTypes = ips.question_types.map((q) => q.value);

const required = ['subject','difficulty','topic','subtopic','skill_type','question_type','tags','is_active','question','options','answer','rationale'];
const errors = [];
data.forEach((q, i) => {
  const n = 'Q' + (i + 1);
  required.forEach((f) => { if (q[f] === undefined) errors.push(n + ': missing ' + f); });
  if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(n + ': options');
  if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) errors.push(n + ': answer');
  if (!Array.isArray(q.tags) || !q.tags.includes(expectedTag)) errors.push(n + ': missing tag ' + expectedTag);
  if (q.subject !== 'ips') errors.push(n + ': subject');
  if (!topicMap[q.topic]) errors.push(n + ': invalid topic: ' + q.topic);
  else if (!topicMap[q.topic].includes(q.subtopic)) errors.push(n + ': invalid subtopic: ' + q.subtopic);
  if (!validSkills.includes(q.skill_type)) errors.push(n + ': invalid skill_type: ' + q.skill_type);
  if (!validQTypes.includes(q.question_type)) errors.push(n + ': invalid question_type: ' + q.question_type);
  if (q.content) {
    if (!q.content.questionRich || q.content.questionRich.type !== 'doc') errors.push(n + ': content.questionRich invalid');
    if (!Array.isArray(q.content.optionsRich) || q.content.optionsRich.length !== 4) errors.push(n + ': content.optionsRich');
    if (!JSON.stringify(q.content.questionRich).includes('"type":"table"')) errors.push(n + ': content.questionRich missing table');
  }
});

if (errors.length === 0) console.log('ALL CHECKS: PASSED');
else errors.forEach((e) => console.log('ERROR:', e));

const byDiff = {}, byTopic = {}, byAns = { 0: 0, 1: 0, 2: 0, 3: 0 };
let tableCount = 0;
data.forEach((q) => {
  byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1;
  byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
  byAns[q.answer]++;
  if (q.content && JSON.stringify(q.content.questionRich).includes('"type":"table"')) tableCount++;
});
console.log('Total:', data.length, '| Difficulty:', JSON.stringify(byDiff));
console.log('Topics:', JSON.stringify(byTopic));
console.log('Answer dist:', JSON.stringify(byAns));
console.log('Rich-table questions:', tableCount);
console.log('');
console.log('Subtopic detail:');
data.forEach((q, i) => console.log('Q' + (i + 1) + ' [' + q.difficulty + '] (' + q.topic + ') ' + q.subtopic + (q.content ? ' [TABLE]' : '') + ' | ans:' + q.answer));
