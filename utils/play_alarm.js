import Player from 'play-sound'
import { config } from '../config.js'

export const playSound = async () => {
  const player = Player({})
  player.play(`./alarm/${config.alarm_mp3_name}.mp3`) 
}