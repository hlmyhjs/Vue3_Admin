// const fs = require('fs')

// const readFile = (path) => {
//   var data = fs.readFileSync(path)
//   jsonData = JSON.parse(data)
//   return jsonData
// }

// const { dependencies, devDependencies } = readFile('../../../../../package.json')

// // 运行依赖
// let dependenciesArr = []
// for (const item in dependencies) {
//   dependenciesArr.push({ name: item, description: dependencies[item] })
// }
// console.log(dependenciesArr)

// // 开发依赖
// let devDependenciesArr = []
// for (const item in devDependencies) {
//   devDependenciesArr.push({ name: item, description: devDependencies[item] })
// }
// console.log(devDependenciesArr)

// // export { dependenciesArr, devDependenciesArr }
