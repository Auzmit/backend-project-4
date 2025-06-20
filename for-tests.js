// Просто рандомная функция для теста тестов
function processCommandLineArgs() {
  const args = process.argv;
  console.log('real:', process.argv);
  return args;
}

processCommandLineArgs();

export { processCommandLineArgs };
