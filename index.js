const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const execSync = require('child_process').execSync

let directory = path.resolve('./input/')
let destination = path.resolve('./output/output.yaml')
let destinationForDelete = path.resolve('./output/output-delete.yaml')

function sleep(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let main = async (eventType, filename) => {
  console.log(1)
  if (fs.existsSync(destinationForDelete)) {
    try {
      console.log(1, 'kubectl.exe delete -f ' + destinationForDelete)
      
      //execSync('kubectl delete pvc/mysql-hostpath-mysql-statefulset-0'
      //  , { encoding: 'utf-8' });  // the default is 'buffer'
      
      let outputBefore = execSync('kubectl.exe delete -f ' + destinationForDelete
        , { encoding: 'utf-8' });  // the default is 'buffer'
      if (typeof(outputBefore) === 'string') {
        outputBefore = outputBefore.trim()
        console.log('Output before was:\n', outputBefore);
      }
      console.log('[Wait for deleting...]')
      
      let cleaned = false
      while (cleaned === false) {
        await sleep(1000)
        if (again) {
          again = false
          return await main()
        }
        let cleanOutput = execSync('kubectl.exe get pod'
            , { encoding: 'utf-8' });  // the default is 'buffer'
        console.log(cleanOutput)
        if (cleanOutput.trim() === '') {
          cleaned = true
          await sleep(1000)
        }
        else {
          execSync('kubectl.exe delete -f ' + destinationForDelete
            , { encoding: 'utf-8' });  // the default is 'buffer'
        }
      }
      
      cleaned = false
      while (cleaned === false) {
        await sleep(1000)
        if (again) {
          again = false
          return await main()
        }
        let cleanOutput = execSync('kubectl.exe get pvc'
            , { encoding: 'utf-8' });  // the default is 'buffer'
        console.log(cleanOutput)
        if (cleanOutput.trim() === '') {
          cleaned = true
          await sleep(1000)
        }
        else {
          execSync('kubectl.exe delete -f ' + destinationForDelete
            , { encoding: 'utf-8' });  // the default is 'buffer'
        }
      }
      
      cleaned = false
      while (cleaned === false) {
        await sleep(1000)
        if (again) {
          again = false
          return await main()
        }
        let cleanOutput = execSync('kubectl.exe get pv'
            , { encoding: 'utf-8' });  // the default is 'buffer'
        console.log(cleanOutput)
        if (cleanOutput.trim() === '') {
          cleaned = true
          await sleep(1000)
        }
        else {
          execSync('kubectl.exe delete -f ' + destinationForDelete
            , { encoding: 'utf-8' });  // the default is 'buffer'
        }
      }
      
      console.log('Deleted')
      
      if (again === true) {
        again = false
        return await main()
      }
    }
    catch (e) {
      console.error(e)
    }
  }
  console.log(2)
  
  //return false
  //console.log(eventType);
  // could be either 'rename' or 'change'. new file event and delete
  // also generally emit 'rename'
  //console.log(filename);
  fs.readdirAsync(directory)
    .map(file => fs.readFileAsync(path.join(directory, file), 'utf8'))
    .then(contents => fs.writeFileAsync(destination, contents.join('\n---\n')))
  
  fs.readdirAsync(directory)
    .map(file => fs.readFileAsync(path.join(directory, file), 'utf8'))
    .then(contents => fs.writeFileAsync(destinationForDelete, contents.reverse().join('\n---\n')))
  
    
  //console.log(filename)
  try {
    let outputAfter = execSync('kubectl.exe apply -f ' + destination
      , { encoding: 'utf-8' });  // the default is 'buffer'
    if (typeof(outputAfter) === 'string') {
      outputAfter = outputAfter.trim()
      console.log('Output after was:\n', outputAfter);
    }
    console.log('[Wait for creating...]')
    await sleep(10000)
  }
  catch (e) {
    console.log(e)
  }
  
  if (!again) {
    console.log('[YOU CAN FORWARD PORT NOW] ' + (new Date()))
  }
  else {
    again = false
    await main()
  }
  again = false
}


let timer1
let timer2
let lock = false
let again = false
fs.watch(directory, () => {
  clearTimeout(timer1)
  clearTimeout(timer2)
  timer1 = setTimeout(() => {
    console.log('prepare writing... wait for 3 seconds', lock, again)
    timer2 = setTimeout(async () => {
      console.log('lock', lock, again)
      if (lock === true) {
        again = true
        return false
      }
      lock = true

      main()

      lock = false
    }, 3000)
  }, 100)
})