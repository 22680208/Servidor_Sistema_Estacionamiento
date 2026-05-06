
export async function handleExitMessage(payload) {
  try {
    const exitCode = String(payload).trim();

    console.log('Exit recibida:', exitCode);

  } catch (error) {
    console.error('Error handleExitMessage:', error);
  }
}