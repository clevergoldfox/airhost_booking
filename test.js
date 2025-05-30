const preDate = new Date('2023-03-31');
const curDate = new Date('2023-04-01');
console.log("diffDays", Math.floor((curDate - preDate) / (1000 * 60 * 60 * 24)));
