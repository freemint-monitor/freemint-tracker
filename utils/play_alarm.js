import Player from 'play-sound'

export const playSound = async () => {
  const player = Player({})
  let audio = player.play('./alarm/qingtian.mp3') 
  // audio.kill()
}