import Player from 'play-sound'

export const playSound = async () => {
  const player = Player({})
  let audio = player.play('./alarm/alarm.mp3') 
  // audio.kill()
}