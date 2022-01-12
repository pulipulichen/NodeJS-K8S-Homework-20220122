const fs = require('fs')
const path = require('path')

fs.watch(path.resolve('./yaml/'), (eventType, filename) => {
  console.log(eventType);
  // could be either 'rename' or 'change'. new file event and delete
  // also generally emit 'rename'
  console.log(filename);
})